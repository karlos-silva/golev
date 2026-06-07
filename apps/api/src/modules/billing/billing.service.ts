import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq, inArray, sql } from 'drizzle-orm';
import Stripe from 'stripe';
import {
  ErrorCode,
  type CheckoutResponse,
  type SubscriptionResponse,
} from '@golev/shared';
import { DATABASE, type Database } from '../../database/database.module';
import { STRIPE_CLIENT } from './stripe.provider';
import {
  anamneseSubmissions,
  customers,
  invoices,
  stripeWebhookEvents,
  subscriptions,
  users,
} from '../../../drizzle/schema';

type Tx = Parameters<Parameters<Database['transaction']>[0]>[0];

/**
 * Sob `moduleResolution: node` o entry CJS do `stripe` expõe o construtor mas
 * não os tipos de recurso via `Stripe.X`. Derivamos tudo do tipo da instância
 * (`Stripe.Stripe`) — `StripeEvent` é a união discriminada de eventos, e cada
 * objeto de recurso sai do `data.object` do evento correspondente.
 */
type StripeClient = Stripe.Stripe;
type StripeEvent = ReturnType<StripeClient['webhooks']['constructEvent']>;
type EventObject<T extends StripeEvent['type']> = Extract<
  StripeEvent,
  { type: T }
>['data']['object'];
type StripeSubscription = EventObject<'customer.subscription.updated'>;
type StripeInvoice = EventObject<'invoice.paid'>;
type StripeCheckoutSession = EventObject<'checkout.session.completed'>;
type CheckoutCreateParams = NonNullable<
  Parameters<StripeClient['checkout']['sessions']['create']>[0]
>;

@Injectable()
export class BillingService {
  private readonly logger = new Logger('Billing');

  constructor(
    @Inject(DATABASE) private db: Database,
    @Inject(STRIPE_CLIENT) private stripe: StripeClient,
    private config: ConfigService,
  ) {}

  private appUrl(): string {
    return this.config.getOrThrow<string>('APP_URL');
  }

  /**
   * Trava de segurança: enquanto `BILLING_ENABLED !== 'true'`, todo o caminho de
   * pagamento fica inerte — mesmo com chaves Stripe presentes. Liga só quando
   * for cobrar de verdade.
   */
  private assertBillingEnabled(): void {
    if (this.config.get<string>('BILLING_ENABLED') !== 'true') {
      throw new ForbiddenException({
        code: ErrorCode.BILLING_DISABLED,
        message: 'Pagamentos ainda não estão disponíveis.',
      });
    }
  }

  async getSubscription(userId: string): Promise<SubscriptionResponse> {
    const customer = await this.db.query.customers.findFirst({
      where: eq(customers.userId, userId),
      with: { subscriptions: true },
    });

    const sub = customer?.subscriptions[0] ?? null;
    if (!sub) {
      return { subscription: null };
    }

    return {
      subscription: {
        id: sub.id,
        status: sub.status,
        stripePriceId: sub.stripePriceId,
        currency: sub.currency,
        currentPeriodStart: sub.currentPeriodStart?.toISOString() ?? null,
        currentPeriodEnd: sub.currentPeriodEnd?.toISOString() ?? null,
        cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
        cancelAt: sub.cancelAt?.toISOString() ?? null,
      },
    };
  }

  /**
   * Garante um Stripe Customer para o usuário e a linha local correspondente.
   * `idempotencyKey` determinístico evita customers duplicados em retries; a
   * constraint UNIQUE(user_id) resolve corridas concorrentes.
   */
  private async ensureCustomer(
    userId: string,
  ): Promise<{ id: string; stripeCustomerId: string }> {
    const existing = await this.db.query.customers.findFirst({
      where: eq(customers.userId, userId),
    });
    if (existing?.stripeCustomerId) {
      return { id: existing.id, stripeCustomerId: existing.stripeCustomerId };
    }

    const user = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { id: true, email: true, name: true },
    });
    if (!user) {
      throw new NotFoundException({
        code: ErrorCode.CUSTOMER_NOT_FOUND,
        message: 'Usuário não encontrado.',
      });
    }

    const stripeCustomer = await this.stripe.customers.create(
      { email: user.email, name: user.name, metadata: { userId } },
      { idempotencyKey: `cust:${userId}` },
    );

    const [row] = await this.db
      .insert(customers)
      .values({ userId, stripeCustomerId: stripeCustomer.id })
      .onConflictDoUpdate({
        target: customers.userId,
        set: { stripeCustomerId: stripeCustomer.id },
      })
      .returning({
        id: customers.id,
        stripeCustomerId: customers.stripeCustomerId,
      });

    return { id: row!.id, stripeCustomerId: row!.stripeCustomerId! };
  }

  /** Gate clínico: só assina quem concluiu a avaliação como elegível. */
  private async assertEligible(userId: string): Promise<void> {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { email: true },
    });
    if (!user) {
      throw new NotFoundException({
        code: ErrorCode.CUSTOMER_NOT_FOUND,
        message: 'Usuário não encontrado.',
      });
    }

    const eligible = await this.db.query.anamneseSubmissions.findFirst({
      where: and(
        sql`lower(${anamneseSubmissions.email}) = ${user.email.toLowerCase()}`,
        eq(anamneseSubmissions.eligible, true),
      ),
      columns: { id: true },
    });

    if (!eligible) {
      throw new ForbiddenException({
        code: ErrorCode.NOT_ELIGIBLE,
        message: 'Conclua a avaliação de elegibilidade antes de assinar.',
      });
    }
  }

  // Statuses que representam uma assinatura "viva" — bloqueiam um novo checkout
  // para evitar assinaturas duplicadas / cobrança em dobro.
  private static readonly LIVE_SUBSCRIPTION_STATUSES = [
    'active',
    'trialing',
    'past_due',
  ];

  async createCheckoutSession(userId: string): Promise<CheckoutResponse> {
    this.assertBillingEnabled();
    await this.assertEligible(userId);
    const { id: customerRowId, stripeCustomerId } =
      await this.ensureCustomer(userId);

    // Impede dupla assinatura: se já existe uma viva, manda gerenciar no portal.
    const existingLive = await this.db.query.subscriptions.findFirst({
      where: and(
        eq(subscriptions.customerId, customerRowId),
        inArray(
          subscriptions.status,
          BillingService.LIVE_SUBSCRIPTION_STATUSES,
        ),
      ),
      columns: { id: true },
    });
    if (existingLive) {
      throw new ConflictException({
        code: ErrorCode.ALREADY_SUBSCRIBED,
        message: 'Você já possui uma assinatura ativa.',
      });
    }

    const priceId = this.config.getOrThrow<string>('STRIPE_PRICE_ID');
    const appUrl = this.appUrl();
    // Métodos configuráveis (a conta precisa ter a capability ativa de cada um).
    // Default 'card'; ligue 'card,pix' quando o Pix estiver habilitado na conta.
    const methods = (this.config.get<string>('STRIPE_PAYMENT_METHODS') ?? 'card')
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);

    const params: CheckoutCreateParams = {
      mode: 'subscription',
      customer: stripeCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      payment_method_types:
        methods as NonNullable<CheckoutCreateParams['payment_method_types']>,
      client_reference_id: userId,
      subscription_data: { metadata: { userId } },
      success_url: `${appUrl}/billing/processing?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/avaliacao`,
    };

    // Pix recorrente exige mandate. Parcelamento (card.installments) não se
    // aplica a cobrança mensal recorrente.
    if (methods.includes('pix')) {
      const mandateAmount = Number.parseInt(
        this.config.getOrThrow<string>('STRIPE_PRICE_AMOUNT_CENTS'),
        10,
      );
      params.payment_method_options = {
        pix: {
          mandate_options: {
            payment_schedule: 'monthly',
            amount: mandateAmount,
            amount_type: 'fixed',
          },
        },
      };
    }

    const session = await this.stripe.checkout.sessions.create(params, {
      idempotencyKey: `checkout:${userId}:${priceId}`,
    });

    if (!session.url) {
      throw new BadRequestException({
        code: ErrorCode.CHECKOUT_FAILED,
        message: 'Não foi possível iniciar o checkout.',
      });
    }
    return { url: session.url };
  }

  async createPortalSession(userId: string): Promise<CheckoutResponse> {
    this.assertBillingEnabled();
    const { stripeCustomerId } = await this.ensureCustomer(userId);
    const session = await this.stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${this.appUrl()}/assinatura`,
    });
    return { url: session.url };
  }

  /**
   * Verifica a assinatura do evento (raw body), faz dedup por `stripe_event_id`
   * e despacha o sync — tudo numa transação. Retorna 200 rápido.
   */
  async handleWebhook(
    rawBody: Buffer | undefined,
    signature: string | undefined,
  ): Promise<{ received: true }> {
    if (!rawBody || !signature) {
      throw new BadRequestException({
        code: ErrorCode.WEBHOOK_SIGNATURE_INVALID,
        message: 'Webhook sem corpo ou assinatura.',
      });
    }

    const secret = this.config.getOrThrow<string>('STRIPE_WEBHOOK_SECRET');
    let event: StripeEvent;
    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, secret);
    } catch {
      // Falha de assinatura: 400 para a Stripe registrar a entrega como falha.
      throw new BadRequestException({
        code: ErrorCode.WEBHOOK_SIGNATURE_INVALID,
        message: 'Assinatura de webhook inválida.',
      });
    }

    await this.db.transaction(async (tx) => {
      const inserted = await tx
        .insert(stripeWebhookEvents)
        .values({ stripeEventId: event.id, type: event.type, payload: event })
        .onConflictDoNothing({ target: stripeWebhookEvents.stripeEventId })
        .returning({ id: stripeWebhookEvents.id });

      if (inserted.length === 0) {
        // Já processado (retry/replay) — no-op idempotente.
        return;
      }

      await this.dispatch(tx, event);

      await tx
        .update(stripeWebhookEvents)
        .set({ processedAt: new Date() })
        .where(eq(stripeWebhookEvents.stripeEventId, event.id));
    });

    return { received: true };
  }

  private async dispatch(tx: Tx, event: StripeEvent): Promise<void> {
    switch (event.type) {
      case 'checkout.session.completed':
        await this.onCheckoutCompleted(tx, event.data.object);
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await this.syncSubscription(
          tx,
          event.data.object,
          new Date(event.created * 1000),
        );
        break;
      case 'invoice.paid':
      case 'invoice.payment_failed':
        await this.syncInvoice(tx, event.data.object);
        break;
      default:
        // Registrado em stripe_webhook_events para auditoria; sem ação.
        break;
    }
  }

  private async onCheckoutCompleted(
    tx: Tx,
    session: StripeCheckoutSession,
  ): Promise<void> {
    const userId = session.client_reference_id ?? session.metadata?.userId;
    const stripeCustomerId =
      typeof session.customer === 'string'
        ? session.customer
        : (session.customer?.id ?? null);
    if (!userId || !stripeCustomerId) return;

    const customer = await tx.query.customers.findFirst({
      where: eq(customers.stripeCustomerId, stripeCustomerId),
      columns: { userId: true },
    });
    if (!customer) {
      this.logger.warn(
        `checkout.session.completed: customer Stripe desconhecido — ignorado`,
      );
      return;
    }
    if (customer.userId !== userId) {
      this.logger.warn(
        `checkout.session.completed: client_reference_id diverge do customer — ignorado`,
      );
      return;
    }
    // O sync da assinatura vem de customer.subscription.created/updated.
  }

  private async syncSubscription(
    tx: Tx,
    sub: StripeSubscription,
    eventCreated: Date,
  ): Promise<void> {
    const stripeCustomerId =
      typeof sub.customer === 'string' ? sub.customer : sub.customer.id;

    const customer = await tx.query.customers.findFirst({
      where: eq(customers.stripeCustomerId, stripeCustomerId),
      columns: { id: true, userId: true },
    });
    if (!customer) {
      this.logger.warn(`subscription: customer Stripe desconhecido — ignorado`);
      return;
    }

    const metaUserId = sub.metadata?.userId;
    if (metaUserId && metaUserId !== customer.userId) {
      this.logger.warn(`subscription: metadata.userId diverge — ignorado`);
      return;
    }

    const existing = await tx.query.subscriptions.findFirst({
      where: eq(subscriptions.stripeSubscriptionId, sub.id),
      columns: { id: true, lastStripeEventAt: true },
    });
    // Guard de ordem: descarta eventos mais antigos que o último já aplicado.
    if (existing?.lastStripeEventAt && eventCreated <= existing.lastStripeEventAt) {
      return;
    }

    const item = sub.items.data[0];
    const set = {
      stripePriceId: item?.price.id ?? null,
      status: sub.status,
      currency: sub.currency,
      currentPeriodStart: item
        ? new Date(item.current_period_start * 1000)
        : null,
      currentPeriodEnd: item ? new Date(item.current_period_end * 1000) : null,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      cancelAt: sub.cancel_at ? new Date(sub.cancel_at * 1000) : null,
      lastStripeEventAt: eventCreated,
      updatedAt: new Date(),
    };

    await tx
      .insert(subscriptions)
      .values({
        customerId: customer.id,
        stripeSubscriptionId: sub.id,
        ...set,
      })
      .onConflictDoUpdate({
        target: subscriptions.stripeSubscriptionId,
        set,
      });
  }

  private async syncInvoice(tx: Tx, invoice: StripeInvoice): Promise<void> {
    if (!invoice.id) return;

    const stripeCustomerId =
      typeof invoice.customer === 'string'
        ? invoice.customer
        : (invoice.customer?.id ?? null);
    if (!stripeCustomerId) return;

    const customer = await tx.query.customers.findFirst({
      where: eq(customers.stripeCustomerId, stripeCustomerId),
      columns: { id: true },
    });
    if (!customer) {
      this.logger.warn(`invoice: customer Stripe desconhecido — ignorado`);
      return;
    }

    // dahlia: o link da assinatura mora em parent.subscription_details.
    const subRef = invoice.parent?.subscription_details?.subscription ?? null;
    const stripeSubscriptionId =
      typeof subRef === 'string' ? subRef : (subRef?.id ?? null);

    let localSubscriptionId: string | null = null;
    if (stripeSubscriptionId) {
      const sub = await tx.query.subscriptions.findFirst({
        where: eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId),
        columns: { id: true },
      });
      localSubscriptionId = sub?.id ?? null;
    }

    const paidAt = invoice.status_transitions?.paid_at
      ? new Date(invoice.status_transitions.paid_at * 1000)
      : null;

    const set = {
      subscriptionId: localSubscriptionId,
      amountDue: invoice.amount_due,
      amountPaid: invoice.amount_paid,
      currency: invoice.currency,
      status: invoice.status ?? 'open',
      paidAt,
    };

    await tx
      .insert(invoices)
      .values({
        customerId: customer.id,
        stripeInvoiceId: invoice.id,
        ...set,
      })
      .onConflictDoUpdate({
        target: invoices.stripeInvoiceId,
        set,
      });

    // O status da assinatura (active/past_due) é mantido pelos eventos
    // customer.subscription.* — não o sobrescrevemos a partir da invoice.
  }
}
