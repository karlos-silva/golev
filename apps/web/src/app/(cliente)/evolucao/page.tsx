'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Scale, TrendingDown, Activity, LineChart } from 'lucide-react';
import { WeightChart } from '@/components/app/weight-chart';
import {
  PageHeader,
  Accent,
  SectionCard,
  Metric,
  EmptyState,
  CenteredMessage,
} from '@/components/client/primitives';
import { WeighInForm } from '@/components/client/weigh-in-form';
import { useMeOverview, useMeWeightLogs } from '@/hooks/use-me';
import { imcClass } from '@/lib/anamnese';

const kg = (n: number) => `${n.toFixed(1).replace('.', ',')} kg`;
const signedKg = (n: number) =>
  `${n > 0 ? '+' : n < 0 ? '−' : ''}${Math.abs(n).toFixed(1).replace('.', ',')} kg`;

export default function EvolucaoPage() {
  const overview = useMeOverview();
  const logs = useMeWeightLogs();

  if (overview.isLoading) return <CenteredMessage>Carregando…</CenteredMessage>;
  if (overview.error || !overview.data)
    return <CenteredMessage>Não conseguimos carregar agora. Tente recarregar.</CenteredMessage>;

  const { journey } = overview.data;
  const points = journey.chart.map((c) => ({ t: +new Date(c.measuredAt), w: c.weightKg }));
  const lost = journey.deltaKg != null && journey.deltaKg < 0;
  const list = logs.data ?? [];

  return (
    <>
      <PageHeader
        kicker="Minha evolução"
        title="Sua evolução de peso"
        subtitle={
          <>
            O que importa é a constância, não a perfeição. Registre quando puder — a gente celebra <Accent>cada passo</Accent>.
          </>
        }
      />

      <div className="gl-in grid grid-cols-2 gap-4 lg:grid-cols-4" style={{ animationDelay: '40ms' }}>
        <Metric
          label="Peso inicial"
          value={journey.initialWeightKg != null ? kg(journey.initialWeightKg) : '—'}
          icon={<Scale className="h-3.5 w-3.5" />}
        />
        <Metric
          label="Peso atual"
          value={journey.currentWeightKg != null ? kg(journey.currentWeightKg) : '—'}
          icon={<Scale className="h-3.5 w-3.5" />}
          accent
        />
        <Metric
          label="Variação"
          value={journey.deltaKg != null ? signedKg(journey.deltaKg) : '—'}
          sub={
            journey.deltaPct != null
              ? `${journey.deltaPct > 0 ? '+' : journey.deltaPct < 0 ? '−' : ''}${Math.abs(journey.deltaPct).toFixed(1).replace('.', ',')}% do inicial`
              : undefined
          }
          icon={<TrendingDown className="h-3.5 w-3.5" />}
          tone={lost ? 'var(--gl-primary)' : 'var(--gl-ink)'}
        />
        <Metric
          label="IMC atual"
          value={journey.currentBmi != null ? journey.currentBmi.toFixed(1).replace('.', ',') : '—'}
          sub={journey.currentBmi != null ? imcClass(journey.currentBmi) : undefined}
          icon={<Activity className="h-3.5 w-3.5" />}
        />
      </div>

      <div className="gl-in" style={{ animationDelay: '90ms' }}>
        <SectionCard title="Linha do tempo" icon={<LineChart className="h-4 w-4" />}>
          <WeightChart points={points} />
          <div className="mt-5 border-t pt-4" style={{ borderColor: 'var(--gl-line)' }}>
            <p className="mb-2 text-xs" style={{ color: 'var(--gl-ink-3)' }}>
              Registrar pesagem de hoje
            </p>
            <WeighInForm />
          </div>
        </SectionCard>
      </div>

      <div className="gl-in" style={{ animationDelay: '140ms' }}>
        <SectionCard title="Histórico de pesagens" icon={<Scale className="h-4 w-4" />} bodyClassName="p-0">
          {list.length === 0 ? (
            <div className="p-5">
              <EmptyState icon={<Scale className="h-5 w-5" />} title="Nenhuma pesagem ainda">
                Registre seu peso acima para começar a acompanhar sua evolução por aqui.
              </EmptyState>
            </div>
          ) : (
            <ul className="divide-y" style={{ borderColor: 'var(--gl-line)' }}>
              {list.map((l, i, arr) => {
                const prev = arr[i + 1];
                const delta = prev ? l.weightKg - prev.weightKg : 0;
                return (
                  <li key={l.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                    <div className="flex items-baseline gap-3">
                      <span
                        className="text-base"
                        style={{ color: 'var(--gl-ink)', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 500 }}
                      >
                        {kg(l.weightKg)}
                      </span>
                      <span
                        className="text-[11px] uppercase tracking-wide"
                        style={{ color: 'var(--gl-ink-3)' }}
                      >
                        {l.source === 'patient_app' ? 'você registrou' : 'pela equipe'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {prev && delta !== 0 && (
                        <span
                          className="text-xs font-medium"
                          style={{ color: delta < 0 ? 'var(--gl-primary)' : 'var(--gl-ink-3)' }}
                        >
                          {delta < 0 ? '−' : '+'}
                          {Math.abs(delta).toFixed(1).replace('.', ',')} kg
                        </span>
                      )}
                      <span className="text-xs" style={{ color: 'var(--gl-ink-3)' }}>
                        {format(new Date(l.measuredAt), "d 'de' MMM", { locale: ptBR })}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </SectionCard>
      </div>
    </>
  );
}
