import { z } from 'zod';

/**
 * Body do POST /billing/checkout (público): o checkout é iniciado a partir de
 * uma anamnese elegível. A conta do paciente só nasce no pagamento (webhook /
 * session-from-payment). O cliente nunca informa preço — é resolvido no servidor.
 */
export const checkoutRequestSchema = z.object({
  anamneseId: z.string().uuid(),
  // Cupom opcional — validado e aplicado server-side via Stripe (o cliente nunca
  // determina o desconto; só informa o código).
  couponCode: z.string().trim().min(1).max(64).optional(),
});

export type CheckoutInput = z.infer<typeof checkoutRequestSchema>;

/** Body do POST /billing/session-from-payment: troca a sessão paga por tokens. */
export const sessionFromPaymentSchema = z.object({
  sessionId: z.string().min(1),
});

export type SessionFromPaymentInput = z.infer<typeof sessionFromPaymentSchema>;
