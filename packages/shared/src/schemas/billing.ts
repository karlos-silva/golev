import { z } from 'zod';

/**
 * Body do POST /billing/checkout. O cliente nunca informa preço/valor — só a
 * chave do plano, resolvida server-side contra uma allowlist (env). Plano único
 * no MVP; o default cobre o caso de body vazio.
 */
export const checkoutRequestSchema = z.object({
  plan: z.enum(['acompanhamento_mensal']).default('acompanhamento_mensal'),
});

export type CheckoutInput = z.infer<typeof checkoutRequestSchema>;
