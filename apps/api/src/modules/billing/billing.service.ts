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
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';
import {
  ErrorCode,
  type AuthResponse,
  type CheckoutResponse,
  type SubscriptionResponse,
} from '@golev/shared';
import { DATABASE, type Database } from '../../database/database.module';
import { STRIPE_CLIENT } from './stripe.provider';
import { PatientsService } from '../patients/patients.service';
import { TokenService } from '../auth/token.service';
import {
  anamneseSubmissions,
  customers,
  invoices,
  patients,
  redeemedCheckoutSessions,
  stripeWebhookEvents,
  subscriptions,
  users,
} from '../../../drizzle/schema';

/**
 * Sob `moduleResolution: node` o entry CJS do `stripe` expõe o construtor mas
 * não os tipos de recurso via `Stripe.X`. Derivamos tudo do tipo da instância.
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
    private patients: PatientsService,
    private tokenService: TokenService,
  ) {}

  private appUrl(): string {
    return this.config.getOrThrow<string>('APP_URL');
  }

  /**
   * Trava-mestra: enquanto `BILLING_ENABLED !== 'true'`, todo o caminho de
   * pagamento fica inerte — mesmo com chaves Stripe presentes.
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
   * Checkout PÚBLICO a partir de uma anamnese elegível. A conta do paciente
   * ainda NÃO existe — nasce no pagamento (webhook / session-from-payment).
   */
  async createCheckoutSession(
    anamneseId: string,
    couponCode?: string,
  ): Promise<CheckoutResponse> {
    this.assertBillingEnabled();

    const anamnese = await this.db.query.anamneseSubmissions.findFirst({
      where: eq(anamneseSubmissions.id, anamneseId),
      columns: { id: true, email: true, eligible: true },
    });
    if (!anamnese) {
      throw new NotFoundException({
        code: ErrorCode.NOT_ELIGIBLE,
        message: 'Avaliação não encontrada.',
      });
    }
    if (!anamnese.eligible) {
      throw new ForbiddenException({
        code: ErrorCode.NOT_ELIGIBLE,
        message: 'Esta avaliação não é elegível para assinatura.',
      });
    }

    // Já convertido em paciente → já tem conta/assinatura: não cria de novo.
    const converted = await this.db.query.patients.findFirst({
      where: eq(patients.anamneseId, anamneseId),
      columns: { id: true },
    });
    if (converted) {
      throw new ConflictException({
        code: ErrorCode.ALREADY_SUBSCRIBED,
        message: 'Você já possui uma assinatura. Faça login para acessar.',
      });
    }

    const priceId = this.config.getOrThrow<string>('STRIPE_PRICE_ID');
    const appUrl = this.appUrl();
    const methods = (this.config.get<string>('STRIPE_PAYMENT_METHODS') ?? 'card')
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);

    const params: CheckoutCreateParams = {
      mode: 'subscription',
      customer_email: anamnese.email,
      line_items: [{ price: priceId, quantity: 1 }],
      payment_method_types:
        methods as NonNullable<CheckoutCreateParams['payment_method_types']>,
      // anamneseId é a chave que liga o pagamento à criação da conta.
      client_reference_id: anamneseId,
      metadata: { anamneseId },
      subscription_data: { metadata: { anamneseId } },
      success_url: `${appUrl}/pagamento/processando?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/avaliacao`,
    };

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

    // Cupom opcional: valida no Stripe e aplica o desconto. O cliente nunca
    // determina o valor — o Stripe calcula/impõe (limite de usos, validade). Com
    // 100% off o total fica R$0 → 'if_required' dispensa o cartão ("de graça").
    if (couponCode) {
      const promos = await this.stripe.promotionCodes.list({
        code: couponCode.trim().toUpperCase(),
        active: true,
        limit: 1,
      });
      const promo = promos.data[0];
      if (!promo) {
        throw new BadRequestException({
          code: ErrorCode.COUPON_INVALID,
          message: 'Cupom inválido ou expirado.',
        });
      }
      params.discounts = [{ promotion_code: promo.id }];
      params.payment_method_collection = 'if_required';
    }

    const session = await this.stripe.checkout.sessions.create(params, {
      idempotencyKey: `checkout:${anamneseId}:${couponCode ?? ''}`,
    });

    if (!session.url) {
      throw new BadRequestException({
        code: ErrorCode.CHECKOUT_FAILED,
        message: 'Não foi possível iniciar o checkout.',
      });
    }
    return { url: session.url };
  }

  /**
   * "Pagou → entra direto": valida que a sessão foi paga, provisiona a conta
   * (idempotente) e devolve tokens (auto-login). É o webhook que garante o
   * provisionamento mesmo se o usuário fechar a aba.
   */
  async sessionFromPayment(sessionId: string): Promise<AuthResponse> {
    this.assertBillingEnabled();

    const session = await this.stripe.checkout.sessions
      .retrieve(sessionId)
      .catch(() => {
        throw new NotFoundException({
          code: ErrorCode.CHECKOUT_FAILED,
          message: 'Sessão de pagamento não encontrada.',
        });
      });

    if (session.payment_status !== 'paid') {
      throw new ConflictException({
        code: ErrorCode.PAYMENT_PENDING,
        message: 'Pagamento ainda não confirmado.',
      });
    }

    const anamneseId = session.metadata?.anamneseId ?? session.client_reference_id;
    if (!anamneseId) {
      throw new BadRequestException({
        code: ErrorCode.CHECKOUT_FAILED,
        message: 'Sessão sem referência da avaliação.',
      });
    }

    const userId = await this.provisionOrGetUserId(anamneseId);

    // Resgate ÚNICO: a primeira troca deste session_id por uma sessão registra a
    // redenção; uma segunda (link vazado/reutilizado por Referer, histórico ou
    // logs) colide no índice único → recusada. Sem isso, quem capturasse o
    // session_id assumiria a conta do comprador (account-takeover). O fluxo
    // legítimo troca uma vez e segue para /inicio; o webhook já garante a conta,
    // então recusar um reuso não tem custo (no máximo, login manual).
    try {
      await this.db.insert(redeemedCheckoutSessions).values({
        stripeSessionId: sessionId,
        userId,
      });
    } catch (e) {
      if ((e as { code?: string }).code === '23505') {
        throw new ForbiddenException({
          code: ErrorCode.CHECKOUT_FAILED,
          message:
            'Esta sessão de pagamento já foi utilizada. Faça login para acessar sua conta.',
        });
      }
      throw e;
    }

    const stripeCustomerId =
      typeof session.customer === 'string'
        ? session.customer
        : (session.customer?.id ?? null);
    if (stripeCustomerId) {
      await this.linkCustomer(userId, stripeCustomerId);
    }

    return this.issueSession(userId);
  }

  async createPortalSession(userId: string): Promise<CheckoutResponse> {
    this.assertBillingEnabled();
    const stripeCustomerId = await this.getStripeCustomerId(userId);
    const session = await this.stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${this.appUrl()}/assinatura`,
    });
    return { url: session.url };
  }

  private async getStripeCustomerId(userId: string): Promise<string> {
    const customer = await this.db.query.customers.findFirst({
      where: eq(customers.userId, userId),
      columns: { stripeCustomerId: true },
    });
    if (!customer?.stripeCustomerId) {
      throw new NotFoundException({
        code: ErrorCode.CUSTOMER_NOT_FOUND,
        message: 'Cliente Stripe não encontrado.',
      });
    }
    return customer.stripeCustomerId;
  }

  /** Provisiona a conta do paciente (idempotente) e devolve o userId. */
  private async provisionOrGetUserId(anamneseId: string): Promise<string> {
    const existing = await this.db.query.patients.findFirst({
      where: eq(patients.anamneseId, anamneseId),
      columns: { userId: true },
    });
    if (existing) return existing.userId;

    try {
      const result = await this.patients.provisionPatientAccount(anamneseId);
      return result.patient.userId;
    } catch (err) {
      // Corrida: outro evento provisionou em paralelo (uniqueIndex em
      // patients.anamneseId). Re-busca; se ainda não houver, o erro é real.
      const row = await this.db.query.patients.findFirst({
        where: eq(patients.anamneseId, anamneseId),
        columns: { userId: true },
      });
      if (row) return row.userId;
      throw err;
    }
  }

  private async linkCustomer(
    userId: string,
    stripeCustomerId: string,
  ): Promise<string> {
    const [row] = await this.db
      .insert(customers)
      .values({ userId, stripeCustomerId })
      .onConflictDoUpdate({
        target: customers.userId,
        set: { stripeCustomerId },
      })
      .returning({ id: customers.id });
    return row!.id;
  }

  private async issueSession(userId: string): Promise<AuthResponse> {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        id: true,
        email: true,
        name: true,
        role: true,
        mustResetPassword: true,
      },
    });
    if (!user) {
      throw new NotFoundException({
        code: ErrorCode.CUSTOMER_NOT_FOUND,
        message: 'Conta não encontrada.',
      });
    }

    const tokens = await this.tokenService.generateTokens({
      userId: user.id,
      role: user.role,
      mustResetPassword: user.mustResetPassword,
    });
    await this.tokenService.saveRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        mustResetPassword: user.mustResetPassword,
      },
      tokens,
    };
  }

  /**
   * Verifica a assinatura do evento, faz dedup idempotente por `stripe_event_id`
   * e despacha o sync. Provisionamento + sync rodam FORA de uma transação única
   * (o provisionamento tem transação + e-mail próprios). Falha → não marca
   * processado → a Stripe reentrega e reprocessamos (handlers idempotentes).
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
      throw new BadRequestException({
        code: ErrorCode.WEBHOOK_SIGNATURE_INVALID,
        message: 'Assinatura de webhook inválida.',
      });
    }

    const inserted = await this.db
      .insert(stripeWebhookEvents)
      .values({ stripeEventId: event.id, type: event.type, payload: event })
      .onConflictDoNothing({ target: stripeWebhookEvents.stripeEventId })
      .returning({ id: stripeWebhookEvents.id });

    if (inserted.length === 0) {
      const prior = await this.db.query.stripeWebhookEvents.findFirst({
        where: eq(stripeWebhookEvents.stripeEventId, event.id),
        columns: { processedAt: true },
      });
      // Já processado com sucesso → no-op. Senão (tentativa anterior falhou),
      // cai para reprocessar.
      if (prior?.processedAt) return { received: true };
    }

    await this.dispatch(event);

    await this.db
      .update(stripeWebhookEvents)
      .set({ processedAt: new Date() })
      .where(eq(stripeWebhookEvents.stripeEventId, event.id));

    return { received: true };
  }

  private async dispatch(event: StripeEvent): Promise<void> {
    switch (event.type) {
      case 'checkout.session.completed':
        await this.onCheckoutCompleted(event.data.object);
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await this.syncSubscription(
          event.data.object,
          new Date(event.created * 1000),
        );
        break;
      case 'invoice.paid':
      case 'invoice.payment_failed':
        await this.syncInvoice(event.data.object);
        break;
      default:
        break;
    }
  }

  private async onCheckoutCompleted(
    session: StripeCheckoutSession,
  ): Promise<void> {
    const anamneseId =
      session.metadata?.anamneseId ?? session.client_reference_id ?? null;
    const stripeCustomerId =
      typeof session.customer === 'string'
        ? session.customer
        : (session.customer?.id ?? null);
    if (!anamneseId || !stripeCustomerId) return;

    // Pagamento confirmado → cria a conta do paciente e liga ao customer Stripe.
    const userId = await this.provisionOrGetUserId(anamneseId);
    await this.linkCustomer(userId, stripeCustomerId);
  }

  private async syncSubscription(
    sub: StripeSubscription,
    eventCreated: Date,
  ): Promise<void> {
    const stripeCustomerId =
      typeof sub.customer === 'string' ? sub.customer : sub.customer.id;

    let customer = await this.db.query.customers.findFirst({
      where: eq(customers.stripeCustomerId, stripeCustomerId),
      columns: { id: true },
    });

    // Corrida: subscription.* chegou antes de checkout.session.completed →
    // auto-provisiona a partir do anamneseId no metadata.
    if (!customer) {
      const anamneseId = sub.metadata?.anamneseId;
      if (!anamneseId) {
        this.logger.warn(
          'subscription: customer desconhecido e sem anamneseId — ignorado',
        );
        return;
      }
      const userId = await this.provisionOrGetUserId(anamneseId);
      const customerRowId = await this.linkCustomer(userId, stripeCustomerId);
      customer = { id: customerRowId };
    }

    const existing = await this.db.query.subscriptions.findFirst({
      where: eq(subscriptions.stripeSubscriptionId, sub.id),
      columns: { id: true, lastStripeEventAt: true },
    });
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

    await this.db
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

  private async syncInvoice(invoice: StripeInvoice): Promise<void> {
    if (!invoice.id) return;

    const stripeCustomerId =
      typeof invoice.customer === 'string'
        ? invoice.customer
        : (invoice.customer?.id ?? null);
    if (!stripeCustomerId) return;

    let customer = await this.db.query.customers.findFirst({
      where: eq(customers.stripeCustomerId, stripeCustomerId),
      columns: { id: true },
    });
    // Corrida: invoice.paid antes do provisionamento → auto-provisiona pelo
    // anamneseId no snapshot de metadata da assinatura.
    if (!customer) {
      const anamneseId = invoice.parent?.subscription_details?.metadata?.anamneseId;
      if (!anamneseId) {
        this.logger.warn('invoice: customer desconhecido e sem anamneseId — ignorado');
        return;
      }
      const userId = await this.provisionOrGetUserId(anamneseId);
      const customerRowId = await this.linkCustomer(userId, stripeCustomerId);
      customer = { id: customerRowId };
    }

    const subRef = invoice.parent?.subscription_details?.subscription ?? null;
    const stripeSubscriptionId =
      typeof subRef === 'string' ? subRef : (subRef?.id ?? null);

    let localSubscriptionId: string | null = null;
    if (stripeSubscriptionId) {
      const sub = await this.db.query.subscriptions.findFirst({
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

    await this.db
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
  }
}
