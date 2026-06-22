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

/** Origem de uma pesagem. `anamnese` = peso da avaliação inicial (1º ponto da série). */
export const WeightLogSource = {
  PATIENT_APP: 'patient_app',
  PORTAL: 'portal',
  ANAMNESE: 'anamnese',
} as const;
export type WeightLogSource =
  (typeof WeightLogSource)[keyof typeof WeightLogSource];

/** Sexo informado pelo paciente. */
export const Sex = {
  FEMININO: 'feminino',
  MASCULINO: 'masculino',
  OUTRO: 'outro',
} as const;
export type Sex = (typeof Sex)[keyof typeof Sex];
export const SEX_VALUES = values(Sex);

/**
 * Idade em anos derivada da data de nascimento — substitui o `idade` (int)
 * congelado do lead: agora atualiza sozinha. Retorna null se ausente/inválida.
 */
export function ageFromBirthDate(
  birthDate: string | Date | null | undefined,
): number | null {
  if (!birthDate) return null;
  const d = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return age >= 0 ? age : null;
}

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

/**
 * Etapa dos exames no onboarding. A médica pede → o paciente envia (hoje pelo
 * WhatsApp) → a equipe marca recebido → a médica revisa e inicia o tratamento.
 */
export const ExamsStatus = {
  NAO_SOLICITADO: 'nao_solicitado',
  SOLICITADO: 'solicitado',
  RECEBIDO: 'recebido',
  REVISADO: 'revisado',
} as const;
export type ExamsStatus = (typeof ExamsStatus)[keyof typeof ExamsStatus];
export const EXAMS_STATUS_VALUES = values(ExamsStatus);
