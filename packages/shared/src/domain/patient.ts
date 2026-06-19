/**
 * Domínio da área do paciente (app do cliente). Valores canônicos usados no
 * front (render) e no back (validação Zod + persistência). Labels de
 * apresentação vivem no front (apps/web/src/lib).
 */

type EnumValues<T extends Record<string, string>> = [T[keyof T], ...T[keyof T][]];
function values<T extends Record<string, string>>(obj: T): EnumValues<T> {
  return Object.values(obj) as EnumValues<T>;
}

/** Status do acompanhamento do paciente. */
export const PatientStatus = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  DISCHARGED: 'discharged',
} as const;
export type PatientStatus = (typeof PatientStatus)[keyof typeof PatientStatus];
export const PATIENT_STATUS_VALUES = values(PatientStatus);

/** Origem de uma pesagem. */
export const WeightLogSource = {
  PATIENT_APP: 'patient_app',
  PORTAL: 'portal',
} as const;
export type WeightLogSource =
  (typeof WeightLogSource)[keyof typeof WeightLogSource];

/** Período preferido do paciente ao solicitar uma consulta. */
export const ConsultationPeriod = {
  MANHA: 'manha',
  TARDE: 'tarde',
  NOITE: 'noite',
  QUALQUER: 'qualquer',
} as const;
export type ConsultationPeriod =
  (typeof ConsultationPeriod)[keyof typeof ConsultationPeriod];
export const CONSULTATION_PERIOD_VALUES = values(ConsultationPeriod);

/** Ciclo de vida de uma solicitação de consulta feita pelo paciente. */
export const ConsultationRequestStatus = {
  PENDENTE: 'pendente',
  CONFIRMADA: 'confirmada',
  RECUSADA: 'recusada',
  CANCELADA: 'cancelada',
} as const;
export type ConsultationRequestStatus =
  (typeof ConsultationRequestStatus)[keyof typeof ConsultationRequestStatus];
export const CONSULTATION_REQUEST_STATUS_VALUES = values(
  ConsultationRequestStatus,
);

/** Status do plano alimentar. */
export const DietPlanStatus = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
} as const;
export type DietPlanStatus =
  (typeof DietPlanStatus)[keyof typeof DietPlanStatus];
export const DIET_PLAN_STATUS_VALUES = values(DietPlanStatus);
