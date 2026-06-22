import type { MeOverview } from '@golev/shared';

/* ============================================================================
   "Para hoje" — núcleo do cartão de foco do dia. Função PURA que deriva 1 a 3
   passos do payload /me que JÁ existe. Decide QUAIS passos aparecem e em que
   ordem; a apresentação (ícone, copy, formatação) fica no componente. A metáfora
   "tarefa" vive aqui no código, NUNCA na copy visível ao paciente.
   ========================================================================== */

const DAY_MS = 86_400_000;

export type TodayTaskKind = 'send-exams' | 'weigh-in' | 'appointment' | 'request-pending' | 'read-plan';

export interface TodayTask {
  kind: TodayTaskKind;
  /** Consulta: ISO da data, p/ o componente formatar com date-fns. */
  at?: string;
  doctorName?: string | null;
  apptType?: string;
}

export interface BuildTasksOptions {
  now?: Date;
  /** Paciente já tocou em "ler o plano" neste device (localStorage). */
  readPlanDismissed?: boolean;
}

/**
 * Deriva os passos do dia, por prioridade, no máximo 3:
 *  1. pesagem da semana (núcleo do hábito) — se nunca pesou ou faz > 6 dias
 *  2. consulta nos próximos 7 dias
 *  3. solicitação em análise (informativo)
 *  4. ler o plano (até dispensar)
 */
export function buildTasks(overview: MeOverview, opts: BuildTasksOptions = {}): TodayTask[] {
  const now = opts.now ?? new Date();
  const { journey } = overview;
  const tasks: TodayTask[] = [];

  // A médica pediu os exames → passo no topo (gating do início do tratamento).
  if (overview.profile.examsStatus === 'solicitado') tasks.push({ kind: 'send-exams' });

  const lastMs = journey.lastWeighInAt ? +new Date(journey.lastWeighInAt) : null;
  const weighInDue = lastMs == null || (now.getTime() - lastMs) / DAY_MS > 6;
  if (weighInDue) tasks.push({ kind: 'weigh-in' });

  const appt = journey.nextAppointment;
  if (appt) {
    const ageDays = (+new Date(appt.scheduledAt) - now.getTime()) / DAY_MS;
    if (ageDays >= -0.5 && ageDays <= 7) {
      tasks.push({
        kind: 'appointment',
        at: appt.scheduledAt,
        doctorName: appt.doctor?.name ?? null,
        apptType: appt.type,
      });
    }
  }

  if (overview.pendingConsultationRequest) tasks.push({ kind: 'request-pending' });

  if (overview.hasDietPlan && !opts.readPlanDismissed) tasks.push({ kind: 'read-plan' });

  return tasks.slice(0, 3);
}
