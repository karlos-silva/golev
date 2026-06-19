import { z } from 'zod';
import {
  CONSULTATION_PERIOD_VALUES,
  DIET_PLAN_STATUS_VALUES,
} from '../domain/patient';

/**
 * Troca de senha (também serve o "definir senha no 1º acesso": o paciente entra
 * com a senha temporária como `currentPassword` e define a nova). Política igual
 * ao register: mínimo 8 chars, sem maxLength artificial.
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Informe a senha atual'),
    newPassword: z
      .string()
      .min(8, 'A nova senha precisa ter ao menos 8 caracteres'),
  })
  .refine((d) => d.newPassword !== d.currentPassword, {
    path: ['newPassword'],
    message: 'A nova senha precisa ser diferente da atual',
  });
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

/** Pesagem registrada pelo próprio paciente no app. */
export const selfWeightLogSchema = z.object({
  weightKg: z.coerce
    .number({ invalid_type_error: 'Informe o peso' })
    .positive('Confira o peso informado')
    .max(500, 'Confira o peso informado'),
  measuredAt: z.string().datetime().optional(),
  notes: z.string().trim().max(500).optional(),
});
export type SelfWeightLogInput = z.infer<typeof selfWeightLogSchema>;

/** Solicitação de consulta feita pelo paciente (a equipe confirma). */
export const consultationRequestCreateSchema = z.object({
  preferredPeriod: z.enum(CONSULTATION_PERIOD_VALUES).optional(),
  preferredDate: z.string().datetime().optional(),
  reason: z.string().trim().max(200).optional(),
  notes: z.string().trim().max(2000).optional(),
});
export type ConsultationRequestCreateInput = z.infer<
  typeof consultationRequestCreateSchema
>;

/** Upsert do plano alimentar pela equipe (portal). */
export const dietPlanUpsertSchema = z.object({
  title: z.string().trim().min(1, 'Informe um título').max(200),
  content: z.string().max(20000).default(''),
  // Só http(s): z.url() aceita esquemas perigosos (javascript:/data:) que, ao
  // serem renderizados como <a href> na área do paciente, viram XSS armazenado.
  fileUrl: z
    .string()
    .url('Link inválido')
    .max(2000)
    .refine((u) => /^https?:\/\//i.test(u), 'Use um link começando com http(s)')
    .nullish(),
  status: z.enum(DIET_PLAN_STATUS_VALUES).optional(),
});
export type DietPlanUpsertInput = z.infer<typeof dietPlanUpsertSchema>;

/** Solicitar redefinição de senha (envia e-mail com link). */
export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email('E-mail inválido'),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

/** Definir nova senha via token (link do e-mail de boas-vindas ou de reset). */
export const resetPasswordSchema = z.object({
  token: z.string().min(10, 'Link inválido'),
  newPassword: z
    .string()
    .min(8, 'A senha precisa ter ao menos 8 caracteres'),
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
