import type { SubscriptionStatus } from '../domain/index';

/** URL para redirecionar o usuário (Stripe Checkout ou Billing Portal). */
export interface CheckoutResponse {
  url: string;
}

export interface SubscriptionView {
  id: string;
  // União aberta: autocomplete dos status conhecidos, mas aceita qualquer string
  // que a Stripe envie (o `& {}` evita o colapso para `string`).
  status: SubscriptionStatus | (string & {});
  stripePriceId: string | null;
  currency: string;
  /** ISO 8601 (UTC). */
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  cancelAt: string | null;
}

export interface SubscriptionResponse {
  subscription: SubscriptionView | null;
}
