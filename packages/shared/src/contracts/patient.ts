/**
 * Contratos (DTOs de resposta) da área do paciente. Interfaces puras consumidas
 * pelo front via TanStack Query. NUNCA inclua aqui campos internos da equipe
 * (ex.: `patients.notes`) — estes contratos modelam só o que o paciente pode ver.
 */

export interface DoctorRef {
  id: string;
  name: string;
}

/** Perfil do paciente logado (sem dados internos da equipe). */
export interface MeProfile {
  patientId: string;
  name: string;
  email: string;
  /** active | paused | discharged */
  status: string;
  startedAt: string;
  doctor: DoctorRef | null;
  sexo: string | null;
  idade: number | null;
  alturaCm: number | null;
  /** Data de nascimento (YYYY-MM-DD) p/ pré-preencher o form de confirmação. */
  birthDate: string | null;
  /** Telefone/WhatsApp p/ pré-preencher o form de confirmação. */
  phone: string | null;
  objetivos: string[];
  /** Foto de perfil (data URL) ou null se o paciente não definiu nenhuma. */
  avatarUrl: string | null;
  /** Etapa dos exames: nao_solicitado | solicitado | recebido | revisado. */
  examsStatus: string;
  /** Paciente já revisou o próprio perfil? Falso → app pede a confirmação. */
  profileConfirmed: boolean;
}

/** Uma consulta na visão do paciente. */
export interface MeAppointment {
  id: string;
  scheduledAt: string;
  durationMin: number;
  /** primeira | retorno */
  type: string;
  /** agendada | realizada | cancelada | falta */
  status: string;
  doctor: DoctorRef | null;
}

/** Uma pesagem na visão do paciente. */
export interface MeWeightLog {
  id: string;
  weightKg: number;
  measuredAt: string;
  /** patient_app | portal */
  source: string;
  notes: string | null;
}

/**
 * Resumo da jornada — métricas derivadas (peso inicial vem da anamnese; atual e
 * variação das pesagens). `deltaKg` negativo = perda de peso.
 */
export interface MeJourney {
  startedAt: string;
  daysInProgram: number;
  alturaCm: number | null;
  initialWeightKg: number | null;
  currentWeightKg: number | null;
  deltaKg: number | null;
  deltaPct: number | null;
  initialBmi: number | null;
  currentBmi: number | null;
  weighInCount: number;
  lastWeighInAt: string | null;
  nextAppointment: MeAppointment | null;
  chart: { measuredAt: string; weightKg: number }[];
}

/** Plano alimentar visível ao paciente. */
export interface MeDietPlan {
  id: string;
  title: string;
  content: string;
  fileUrl: string | null;
  status: string;
  updatedAt: string;
  doctor: DoctorRef | null;
}

/** Solicitação de consulta na visão do paciente. */
export interface MeConsultationRequest {
  id: string;
  preferredPeriod: string | null;
  preferredDate: string | null;
  reason: string | null;
  notes: string | null;
  /** pendente | confirmada | recusada | cancelada */
  status: string;
  createdAt: string;
}

/** Resposta de visão geral do app do cliente (uma chamada agrega o essencial). */
export interface MeOverview {
  profile: MeProfile;
  journey: MeJourney;
  hasDietPlan: boolean;
  pendingConsultationRequest: boolean;
}
