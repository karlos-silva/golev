import type { MeJourney } from '@golev/shared';

/* ============================================================================
   Leituras da jornada — funções PURAS que traduzem números em linguagem que
   acolhe. Celebram comportamento e constância (o que a pessoa controla), nunca
   o ponteiro da balança. Sem cobrança, sem vermelho. Testáveis isoladamente.
   ========================================================================== */

const DAY_MS = 86_400_000;

type ChartPoint = { measuredAt: string; weightKg: number };

/** Saudação pelo período do dia (device). */
export function greetingFor(date: Date): string {
  const h = date.getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

export type TrendDirection = 'loss' | 'stable' | 'gain' | 'new';

export interface TrendReading {
  direction: TrendDirection;
  phrase: string;
}

/**
 * Variação RECENTE (últimos ~28 dias) — base da leitura de tendência. Distinta
 * do total acumulado: a tendência olha o momento, não a jornada inteira.
 */
export function recentDeltaKg(chart: ChartPoint[], now: Date = new Date()): number | null {
  if (chart.length < 2) return null;
  const sorted = [...chart].sort((a, b) => +new Date(a.measuredAt) - +new Date(b.measuredAt));
  const last = sorted[sorted.length - 1];
  if (!last) return null;
  const cutoff = now.getTime() - 28 * DAY_MS;
  const within = sorted.filter((c) => +new Date(c.measuredAt) >= cutoff);
  const base = within.length >= 2 ? within[0] : sorted[sorted.length - 2];
  if (!base) return null;
  return Number((last.weightKg - base.weightKg).toFixed(1));
}

/** Frase que lê a tendência recente em tom sereno. */
export function trendReading(journey: MeJourney, now: Date = new Date()): TrendReading {
  if (journey.weighInCount < 2) {
    return { direction: 'new', phrase: 'Sua história começa aqui — cada registro conta.' };
  }
  const d = recentDeltaKg(journey.chart, now) ?? journey.deltaKg ?? 0;
  if (Math.abs(d) < 0.4) {
    return { direction: 'stable', phrase: 'Seu peso está estável — constância também é progresso.' };
  }
  if (d < 0) {
    return { direction: 'loss', phrase: 'Tendência de queda suave, no seu ritmo.' };
  }
  return { direction: 'gain', phrase: 'Altos e baixos fazem parte. A gente segue junto.' };
}

export interface WeeksRegistered {
  registered: number;
  window: number;
}

/**
 * Em quantas das últimas `window` semanas (janelas de 7 dias a partir de agora)
 * houve ao menos uma pesagem. Mede o HÁBITO, não o resultado. Sem punição por gaps.
 */
export function weeksRegistered(
  chart: { measuredAt: string }[],
  now: Date = new Date(),
  window = 6,
): WeeksRegistered {
  const buckets = new Set<number>();
  const nowMs = now.getTime();
  for (const c of chart) {
    const ageDays = (nowMs - +new Date(c.measuredAt)) / DAY_MS;
    if (ageDays < 0) continue;
    const bucket = Math.floor(ageDays / 7);
    if (bucket < window) buckets.add(bucket);
  }
  return { registered: buckets.size, window };
}

/**
 * Maior marco de % já alcançado, em degraus de 5% (5, 10, 15…). `null` se ainda
 * não cruzou 5% de perda. Derivado on-the-fly de `deltaPct` (sem persistência).
 */
export function lossMilestonePct(deltaPct: number | null): number | null {
  if (deltaPct == null || deltaPct >= 0) return null;
  const step = Math.floor(Math.abs(deltaPct) / 5) * 5;
  return step >= 5 ? step : null;
}

/**
 * Peso de referência ao entrar na faixa saudável (IMC 24,9), derivado da altura.
 * É só orientação — a meta real é definida com a equipe. Null sem altura.
 */
export function goalKgFromHeight(alturaCm: number | null): number | null {
  if (alturaCm == null || alturaCm <= 0) return null;
  const m = alturaCm / 100;
  return Math.round(24.9 * m * m * 10) / 10;
}

/** Menor peso já registrado na série. Null se vazia. */
export function lowestWeight(chart: { weightKg: number }[]): number | null {
  if (!chart.length) return null;
  return Math.min(...chart.map((c) => c.weightKg));
}

/**
 * Ritmo médio (kg/semana) entre o 1º e o último ponto. Negativo = perda.
 * `null` se a série tem menos de 3 pontos ou abrange menos de 1 semana — para
 * não passar uma falsa precisão nem virar prazo/cobrança.
 */
export function avgPaceKgPerWeek(chart: ChartPoint[]): number | null {
  if (chart.length < 3) return null;
  const sorted = [...chart].sort((a, b) => +new Date(a.measuredAt) - +new Date(b.measuredAt));
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  if (!first || !last) return null;
  const weeks = (+new Date(last.measuredAt) - +new Date(first.measuredAt)) / (7 * DAY_MS);
  if (weeks < 1) return null;
  return Math.round(((last.weightKg - first.weightKg) / weeks) * 10) / 10;
}
