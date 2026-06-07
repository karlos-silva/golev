import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { config as loadEnv } from 'dotenv';

// Carrega o DATABASE_URL do .env da raiz ANTES de criar o client (cwd = apps/api).
loadEnv({ path: resolve(process.cwd(), '../../.env') });

import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { eq, like } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { BadRequestException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type Stripe from 'stripe';
import { ErrorCode } from '@golev/shared';
import * as schema from '../../../drizzle/schema';
import {
  customers,
  invoices,
  stripeWebhookEvents,
  subscriptions,
  users,
} from '../../../drizzle/schema';
import type { Database } from '../../database/database.module';
import { BillingService } from './billing.service';

const client = postgres(process.env.DATABASE_URL!, { max: 1 });
const db: Database = drizzle({ client, schema });

// Stub do Stripe: só interessa `webhooks.constructEvent`, controlado por teste.
const constructEvent = vi.fn();
const stripe = { webhooks: { constructEvent } } as unknown as Stripe.Stripe;

const config = {
  getOrThrow: (key: string): string => {
    const values: Record<string, string> = {
      STRIPE_WEBHOOK_SECRET: 'whsec_test',
      APP_URL: 'http://localhost:3000',
    };
    const value = values[key];
    if (value === undefined) throw new Error(`missing config ${key}`);
    return value;
  },
} as unknown as ConfigService;

const service = new BillingService(db, stripe, config);

const SIG = 'sig';
const body = () => Buffer.from('{}');
const nowSec = () => Math.floor(Date.now() / 1000);
const uid = () => randomUUID().replace(/-/g, '');

async function seed(suffix: string): Promise<{
  userId: string;
  stripeCustomerId: string;
}> {
  const [user] = await db
    .insert(users)
    .values({
      email: `ittest_${suffix}@billing-test.local`,
      name: 'IT Test',
      passwordHash: 'x',
    })
    .returning({ id: users.id });
  const stripeCustomerId = `cus_ittest_${suffix}`;
  await db
    .insert(customers)
    .values({ userId: user!.id, stripeCustomerId })
    .returning({ id: customers.id });
  return { userId: user!.id, stripeCustomerId };
}

function subscriptionEvent(o: {
  eventId: string;
  created: number;
  type:
    | 'customer.subscription.created'
    | 'customer.subscription.updated'
    | 'customer.subscription.deleted';
  subscriptionId: string;
  stripeCustomerId: string;
  userId: string | null;
  status: string;
  priceId?: string;
  periodStart?: number;
  periodEnd?: number;
  currency?: string;
}) {
  return {
    id: o.eventId,
    type: o.type,
    created: o.created,
    data: {
      object: {
        id: o.subscriptionId,
        customer: o.stripeCustomerId,
        metadata: o.userId ? { userId: o.userId } : {},
        status: o.status,
        currency: o.currency ?? 'brl',
        cancel_at_period_end: false,
        cancel_at: null,
        items: {
          data: [
            {
              price: { id: o.priceId ?? 'price_ittest' },
              current_period_start: o.periodStart ?? o.created,
              current_period_end: o.periodEnd ?? o.created + 2_592_000,
            },
          ],
        },
      },
    },
  };
}

function invoicePaidEvent(o: {
  eventId: string;
  created: number;
  invoiceId: string;
  stripeCustomerId: string;
  subscriptionId: string;
  amountDue: number;
  amountPaid: number;
  paidAt: number;
  currency?: string;
}) {
  return {
    id: o.eventId,
    type: 'invoice.paid' as const,
    created: o.created,
    data: {
      object: {
        id: o.invoiceId,
        customer: o.stripeCustomerId,
        parent: { subscription_details: { subscription: o.subscriptionId } },
        amount_due: o.amountDue,
        amount_paid: o.amountPaid,
        currency: o.currency ?? 'brl',
        status: 'paid',
        status_transitions: { paid_at: o.paidAt },
      },
    },
  };
}

async function cleanup(): Promise<void> {
  await db
    .delete(stripeWebhookEvents)
    .where(like(stripeWebhookEvents.stripeEventId, 'evt_ittest_%'));
  // Cascata remove subscriptions e invoices ligadas ao customer.
  await db.delete(customers).where(like(customers.stripeCustomerId, 'cus_ittest_%'));
  await db.delete(users).where(like(users.email, '%@billing-test.local'));
}

beforeEach(() => {
  constructEvent.mockReset();
});

afterEach(async () => {
  await cleanup();
});

afterAll(async () => {
  await cleanup();
  await client.end({ timeout: 5 });
});

describe('BillingService.handleWebhook (integração)', () => {
  it('rejeita corpo ou assinatura ausentes sem chamar constructEvent', async () => {
    for (const args of [
      [undefined, SIG] as const,
      [body(), undefined] as const,
    ]) {
      const err: unknown = await service
        .handleWebhook(args[0], args[1])
        .then(() => null)
        .catch((e: unknown) => e);
      expect(err).toBeInstanceOf(BadRequestException);
      if (err instanceof BadRequestException) {
        const res = err.getResponse() as { code?: string };
        expect(res.code).toBe(ErrorCode.WEBHOOK_SIGNATURE_INVALID);
      }
    }
    expect(constructEvent).not.toHaveBeenCalled();
  });

  it('rejeita assinatura inválida e não escreve no banco', async () => {
    constructEvent.mockImplementation(() => {
      throw new Error('bad signature');
    });

    const err: unknown = await service
      .handleWebhook(body(), SIG)
      .then(() => null)
      .catch((e: unknown) => e);

    expect(err).toBeInstanceOf(BadRequestException);
    if (err instanceof BadRequestException) {
      const res = err.getResponse() as { code?: string };
      expect(res.code).toBe(ErrorCode.WEBHOOK_SIGNATURE_INVALID);
    }

    const events = await db
      .select()
      .from(stripeWebhookEvents)
      .where(like(stripeWebhookEvents.stripeEventId, 'evt_ittest_%'));
    expect(events).toHaveLength(0);
  });

  it('é idempotente: o mesmo event.id duas vezes gera um único efeito', async () => {
    const s = uid();
    const { userId, stripeCustomerId } = await seed(s);
    const subscriptionId = `sub_ittest_${s}`;
    const eventId = `evt_ittest_${s}_a`;

    constructEvent.mockReturnValue(
      subscriptionEvent({
        eventId,
        created: nowSec(),
        type: 'customer.subscription.created',
        subscriptionId,
        stripeCustomerId,
        userId,
        status: 'active',
      }),
    );

    const r1 = await service.handleWebhook(body(), SIG);
    const r2 = await service.handleWebhook(body(), SIG);
    expect(r1).toEqual({ received: true });
    expect(r2).toEqual({ received: true });

    const subs = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.stripeSubscriptionId, subscriptionId));
    expect(subs).toHaveLength(1);
    expect(subs[0]?.status).toBe('active');

    const events = await db
      .select()
      .from(stripeWebhookEvents)
      .where(eq(stripeWebhookEvents.stripeEventId, eventId));
    expect(events).toHaveLength(1);
    expect(events[0]?.processedAt).not.toBeNull();
  });

  it('descarta evento de assinatura mais antigo que o já aplicado (guard de ordem)', async () => {
    const s = uid();
    const { userId, stripeCustomerId } = await seed(s);
    const subscriptionId = `sub_ittest_${s}`;
    const t2 = nowSec();
    const t1 = t2 - 100;

    // Evento mais novo (active) chega primeiro.
    constructEvent.mockReturnValue(
      subscriptionEvent({
        eventId: `evt_ittest_${s}_new`,
        created: t2,
        type: 'customer.subscription.updated',
        subscriptionId,
        stripeCustomerId,
        userId,
        status: 'active',
      }),
    );
    await service.handleWebhook(body(), SIG);

    // Evento mais antigo (canceled) chega depois — deve ser ignorado.
    constructEvent.mockReturnValue(
      subscriptionEvent({
        eventId: `evt_ittest_${s}_old`,
        created: t1,
        type: 'customer.subscription.updated',
        subscriptionId,
        stripeCustomerId,
        userId,
        status: 'canceled',
      }),
    );
    await service.handleWebhook(body(), SIG);

    const [row] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.stripeSubscriptionId, subscriptionId));
    expect(row?.status).toBe('active');
    expect(row?.lastStripeEventAt?.getTime()).toBe(t2 * 1000);
  });

  it('ignora a mutação quando metadata.userId diverge do customer (anti-IDOR)', async () => {
    const s = uid();
    const { stripeCustomerId } = await seed(s);
    const subscriptionId = `sub_ittest_${s}`;
    const eventId = `evt_ittest_${s}_idor`;

    constructEvent.mockReturnValue(
      subscriptionEvent({
        eventId,
        created: nowSec(),
        type: 'customer.subscription.created',
        subscriptionId,
        stripeCustomerId,
        userId: randomUUID(), // userId diferente do dono do customer
        status: 'active',
      }),
    );
    await service.handleWebhook(body(), SIG);

    const subs = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.stripeSubscriptionId, subscriptionId));
    expect(subs).toHaveLength(0);

    // O evento é registrado para auditoria, mas sem efeito colateral.
    const events = await db
      .select()
      .from(stripeWebhookEvents)
      .where(eq(stripeWebhookEvents.stripeEventId, eventId));
    expect(events).toHaveLength(1);
  });

  it('invoice.paid grava a fatura em centavos e linka à assinatura', async () => {
    const s = uid();
    const { userId, stripeCustomerId } = await seed(s);
    const subscriptionId = `sub_ittest_${s}`;
    const invoiceId = `in_ittest_${s}`;
    const paidAt = nowSec();

    // Primeiro cria a assinatura local (para a fatura conseguir linkar).
    constructEvent.mockReturnValue(
      subscriptionEvent({
        eventId: `evt_ittest_${s}_sub`,
        created: nowSec(),
        type: 'customer.subscription.created',
        subscriptionId,
        stripeCustomerId,
        userId,
        status: 'active',
      }),
    );
    await service.handleWebhook(body(), SIG);

    constructEvent.mockReturnValue(
      invoicePaidEvent({
        eventId: `evt_ittest_${s}_inv`,
        created: nowSec(),
        invoiceId,
        stripeCustomerId,
        subscriptionId,
        amountDue: 49900,
        amountPaid: 49900,
        paidAt,
      }),
    );
    await service.handleWebhook(body(), SIG);

    const [inv] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.stripeInvoiceId, invoiceId));
    expect(inv?.amountDue).toBe(49900);
    expect(inv?.amountPaid).toBe(49900);
    expect(inv?.currency).toBe('brl');
    expect(inv?.status).toBe('paid');
    expect(inv?.paidAt?.getTime()).toBe(paidAt * 1000);

    const [sub] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.stripeSubscriptionId, subscriptionId));
    expect(inv?.subscriptionId).toBe(sub?.id);
  });
});
