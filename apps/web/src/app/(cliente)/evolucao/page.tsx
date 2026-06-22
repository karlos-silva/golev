'use client';

import { useRef } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Scale, LineChart, Flag } from 'lucide-react';
import { WeightChart } from '@/components/app/weight-chart';
import {
  PageHeader,
  Accent,
  SectionCard,
  StatusPill,
  EmptyState,
  CenteredMessage,
} from '@/components/client/primitives';
import { ImcBand } from '@/components/client/imc-band';
import { WeighInForm } from '@/components/client/weigh-in-form';
import { useMeOverview, useMeWeightLogs } from '@/hooks/use-me';
import { imcClass } from '@/lib/anamnese';
import {
  trendReading,
  lossMilestonePct,
  goalKgFromHeight,
  lowestWeight,
  avgPaceKgPerWeek,
} from '@/lib/journey-insights';
import type { MeWeightLog } from '@golev/shared';

const DAY_MS = 86_400_000;
const comma = (n: number, d = 1) => n.toFixed(d).replace('.', ',');
const kg = (n: number) => `${comma(n)} kg`;
const signed = (n: number) => `${n > 0 ? '+' : n < 0 ? '−' : ''}${comma(Math.abs(n))}`;

export default function EvolucaoPage() {
  const overview = useMeOverview();
  const logs = useMeWeightLogs();
  const chartRef = useRef<HTMLDivElement>(null);

  if (overview.isLoading) return <CenteredMessage>Carregando…</CenteredMessage>;
  if (overview.error || !overview.data)
    return <CenteredMessage>Não conseguimos carregar agora. Tente recarregar.</CenteredMessage>;

  const { journey } = overview.data;
  const list = logs.data ?? [];

  const points = journey.chart.map((c) => ({ t: +new Date(c.measuredAt), w: c.weightKg }));
  const goalKg = goalKgFromHeight(journey.alturaCm);
  const lowest = lowestWeight(journey.chart);
  const pace = avgPaceKgPerWeek(journey.chart);
  const lost = journey.deltaKg != null && journey.deltaKg < 0;
  const hasHero = journey.weighInCount >= 2 && journey.deltaKg != null;
  const trend = trendReading(journey);
  const milestone = lossMilestonePct(journey.deltaPct);

  const daysSince =
    journey.lastWeighInAt != null
      ? Math.round((Date.now() - +new Date(journey.lastWeighInAt)) / DAY_MS)
      : null;
  const context =
    journey.lastWeighInAt == null || journey.weighInCount < 1
      ? 'Sua primeira pesagem por aqui — começamos sua linha do tempo.'
      : daysSince != null && daysSince <= 0
        ? 'Você já se pesou hoje. Pode atualizar se quiser.'
        : `Última pesagem ${daysSince === 1 ? 'ontem' : `há ${daysSince} dias`}${journey.currentWeightKg != null ? ` · ${kg(journey.currentWeightKg)}` : ''}`;

  return (
    <>
      <PageHeader
        kicker="Minha evolução"
        title="Sua evolução de peso"
        subtitle={
          <>
            A constância importa mais que a perfeição — a gente celebra <Accent>cada passo</Accent>.
          </>
        }
        action={
          <StatusPill
            label={`${journey.daysInProgram} ${journey.daysInProgram === 1 ? 'dia' : 'dias'} com a gente`}
            bg="var(--gl-support-tint)"
            color="var(--gl-primary-strong)"
          />
        }
      />

      {/* Convite de pesagem — no topo */}
      <section
        className="gl-in rounded-2xl p-5"
        style={{ background: 'var(--gl-surface)', border: '1px solid var(--gl-line)', borderTop: '3px solid var(--gl-accent)', animationDelay: '40ms' }}
      >
        <p className="text-[1.35rem] leading-tight" style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--gl-ink)' }}>
          Como você está hoje?
        </p>
        <p className="mt-1 mb-4 text-sm" style={{ color: 'var(--gl-ink-3)' }}>
          {context}
        </p>
        <WeighInForm onSaved={() => chartRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })} />
        <p className="mt-2 text-xs" style={{ color: 'var(--gl-ink-3)' }}>
          Leva 5 segundos. Registre quando puder, sem pressa.
        </p>
      </section>

      {/* Herói da jornada */}
      {hasHero && journey.deltaKg != null && (
        <section
          className="gl-in rounded-2xl p-5"
          style={{ background: 'var(--gl-surface)', border: '1px solid var(--gl-line)', animationDelay: '90ms' }}
        >
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span
              className="leading-none"
              style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 500, fontSize: '2.6rem', color: lost ? 'var(--gl-primary)' : 'var(--gl-ink)' }}
            >
              {signed(journey.deltaKg)}
            </span>
            <span className="text-base" style={{ color: 'var(--gl-ink-2)' }}>kg</span>
            <span className="text-sm" style={{ color: 'var(--gl-ink-2)' }}>
              desde o início
              {milestone == null && journey.deltaPct != null && (
                <>
                  {' · '}
                  <span style={{ color: 'var(--gl-primary-strong)' }}>{signed(journey.deltaPct)}%</span>
                </>
              )}
            </span>
          </div>

          {milestone != null && (
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium" style={{ background: 'var(--gl-accent-tint)', color: 'var(--gl-on-accent)' }}>
              <Flag className="h-3.5 w-3.5" style={{ color: 'var(--gl-accent-strong)' }} />
              Você já está {milestone}% mais leve
            </p>
          )}

          <p className="mt-3 text-sm leading-relaxed" style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--gl-accent-strong)' }}>
            {trend.phrase}
          </p>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 border-t pt-3.5 text-xs" style={{ borderColor: 'var(--gl-line)', color: 'var(--gl-ink-3)' }}>
            {journey.initialWeightKg != null && (
              <span>inicial <span style={{ color: 'var(--gl-ink)' }}>{kg(journey.initialWeightKg)}</span></span>
            )}
            {lowest != null && (
              <span>menor peso <span style={{ color: 'var(--gl-ink)' }}>{kg(lowest)}</span></span>
            )}
            {pace != null && pace < 0 && (
              <span>ritmo <span style={{ color: 'var(--gl-ink)' }}>~{comma(Math.abs(pace))} kg/sem</span></span>
            )}
          </div>
        </section>
      )}

      {/* Faixa de objetivo (IMC) */}
      {journey.currentBmi != null && (
        <section
          className="gl-in rounded-2xl p-5"
          style={{ background: 'var(--gl-surface)', border: '1px solid var(--gl-line)', animationDelay: '120ms' }}
        >
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.13em]" style={{ color: 'var(--gl-ink-3)' }}>
            Seu IMC, caminhando
          </p>
          <ImcBand initialBmi={journey.initialBmi} currentBmi={journey.currentBmi} />
          <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--gl-ink-2)' }}>
            <span style={{ color: 'var(--gl-ink)' }}>{imcClass(journey.currentBmi)}</span> hoje · a faixa
            verde é a saudável (IMC abaixo de 25). Referência de orientação — a meta real é definida com a equipe.
          </p>
        </section>
      )}

      {/* Gráfico — linha do tempo */}
      <div ref={chartRef} className="gl-in" style={{ animationDelay: '160ms' }}>
        <SectionCard title="Linha do tempo" icon={<LineChart className="h-4 w-4" />}>
          <WeightChart points={points} goalKg={goalKg ?? undefined} interactive height={230} />
          <p className="mt-3 text-xs" style={{ color: 'var(--gl-ink-3)' }}>
            Toque no gráfico para ver cada pesagem.
            {goalKg != null && ` A linha pontilhada é a referência (~${comma(goalKg)} kg), não uma meta clínica.`}
          </p>
        </SectionCard>
      </div>

      {/* Histórico */}
      <div className="gl-in" style={{ animationDelay: '200ms' }}>
        <SectionCard title="Histórico de pesagens" icon={<Scale className="h-4 w-4" />} bodyClassName="p-0">
          {list.length === 0 ? (
            <div className="p-5">
              <EmptyState icon={<Scale className="h-5 w-5" />} title="Nenhuma pesagem ainda">
                Registre seu peso lá em cima para começar a acompanhar sua evolução por aqui.
              </EmptyState>
            </div>
          ) : (
            <History list={list} />
          )}
        </SectionCard>
      </div>
    </>
  );
}

/** Histórico agrupado por mês, com delta cronológico correto (calculado antes de agrupar). */
function History({ list }: { list: MeWeightLog[] }) {
  const withDelta = list.map((l, i, arr) => {
    const prev = arr[i + 1];
    return { log: l, delta: prev ? l.weightKg - prev.weightKg : null };
  });

  const groups: { key: string; label: string; items: typeof withDelta }[] = [];
  for (const row of withDelta) {
    const d = new Date(row.log.measuredAt);
    const key = format(d, 'yyyy-MM');
    let g = groups.find((x) => x.key === key);
    if (!g) {
      g = { key, label: format(d, 'MMMM yyyy', { locale: ptBR }), items: [] };
      groups.push(g);
    }
    g.items.push(row);
  }

  return (
    <div>
      {groups.map((g) => (
        <div key={g.key}>
          <p className="px-5 pb-1.5 pt-4 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--gl-ink-3)' }}>
            {g.label}
          </p>
          <ul className="divide-y" style={{ borderColor: 'var(--gl-line)' }}>
            {g.items.map(({ log: l, delta }) => (
              <li key={l.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div className="flex items-baseline gap-3">
                  <span className="text-base" style={{ color: 'var(--gl-ink)', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 500 }}>
                    {kg(l.weightKg)}
                  </span>
                  <span className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--gl-ink-3)' }}>
                    {l.source === 'patient_app' ? 'você registrou' : 'pela equipe'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {delta != null && delta !== 0 && (
                    <span className="text-xs font-medium" style={{ color: delta < 0 ? 'var(--gl-primary)' : 'var(--gl-ink-3)' }}>
                      {delta < 0 ? '−' : '+'}
                      {comma(Math.abs(delta))} kg
                    </span>
                  )}
                  <span className="text-xs" style={{ color: 'var(--gl-ink-3)' }}>
                    {format(new Date(l.measuredAt), "d 'de' MMM", { locale: ptBR })}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
