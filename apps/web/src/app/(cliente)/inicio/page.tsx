'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, CalendarCheck, Flag } from 'lucide-react';
import { WeightChart } from '@/components/app/weight-chart';
import {
  PageHeader,
  Accent,
  StatusPill,
  CenteredMessage,
} from '@/components/client/primitives';
import { TodayCard } from '@/components/client/today-card';
import { ImcBand } from '@/components/client/imc-band';
import { WeighInForm } from '@/components/client/weigh-in-form';
import { ProfileConfirmCard } from '@/components/client/profile-confirm-card';
import { useMeOverview } from '@/hooks/use-me';
import { useAuth } from '@/stores/auth';
import { imcClass, OBJETIVO_LABELS } from '@/lib/anamnese';
import {
  greetingFor,
  trendReading,
  weeksRegistered,
  lossMilestonePct,
} from '@/lib/journey-insights';

const DAY_MS = 86_400_000;
const comma = (n: number, d = 1) => n.toFixed(d).replace('.', ',');
const signed = (n: number) => `${n > 0 ? '+' : n < 0 ? '−' : ''}${comma(Math.abs(n))}`;

export default function InicioPage() {
  const { data, isLoading, error } = useMeOverview();
  const user = useAuth((s) => s.user);
  const firstName = user?.name?.split(' ')[0] ?? 'Você';

  if (isLoading) return <CenteredMessage>Carregando sua jornada…</CenteredMessage>;
  if (error || !data)
    return <CenteredMessage>Não conseguimos carregar agora. Tente recarregar a página.</CenteredMessage>;

  const { profile, journey } = data;
  const greeting = greetingFor(new Date());

  const points = journey.chart.map((c) => ({ t: +new Date(c.measuredAt), w: c.weightKg }));
  const cutoff = Date.now() - 28 * DAY_MS;
  const recent = points.filter((p) => p.t >= cutoff);
  const miniPoints = recent.length >= 2 ? recent : points;

  const hasHero = journey.weighInCount >= 2 && journey.deltaKg != null;
  const lost = journey.deltaKg != null && journey.deltaKg < 0;
  const trend = trendReading(journey);
  const weeks = weeksRegistered(journey.chart);
  const milestone = lossMilestonePct(journey.deltaPct);

  return (
    <>
      <PageHeader
        kicker="Sua jornada"
        title={`${greeting}, ${firstName}`}
        subtitle={
          profile.profileConfirmed ? (
            <>
              A gente caminha <Accent>junto</Accent>, no seu ritmo — cada passo conta.
            </>
          ) : (
            <>Vamos confirmar seu perfil pra cuidar de você com mais precisão.</>
          )
        }
        action={
          <StatusPill
            label={`${journey.daysInProgram} ${journey.daysInProgram === 1 ? 'dia' : 'dias'} com a gente`}
            bg="var(--gl-support-tint)"
            color="var(--gl-primary-strong)"
          />
        }
      />

      {profile.profileConfirmed ? (
        <div className="gl-in" style={{ animationDelay: '40ms' }}>
          <TodayCard overview={data} />
        </div>
      ) : (
        <ProfileConfirmCard profile={profile} />
      )}

      {/* Número-herói + leitura de tendência */}
      <div className="gl-in" style={{ animationDelay: '90ms' }}>
        <section
          className="rounded-2xl p-5"
          style={{ background: 'var(--gl-surface)', border: '1px solid var(--gl-line)' }}
        >
          {hasHero && journey.deltaKg != null ? (
            <>
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span
                  className="leading-none"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontStyle: 'italic',
                    fontWeight: 500,
                    fontSize: '2.6rem',
                    color: lost ? 'var(--gl-primary)' : 'var(--gl-ink)',
                  }}
                >
                  {signed(journey.deltaKg)}
                </span>
                <span className="text-base" style={{ color: 'var(--gl-ink-2)' }}>
                  kg
                </span>
                <span className="text-sm" style={{ color: 'var(--gl-ink-2)' }}>
                  {lost && milestone == null ? 'mais leve desde o início' : 'desde o início'}
                  {milestone == null && journey.deltaPct != null && (
                    <>
                      {' · '}
                      <span style={{ color: 'var(--gl-primary-strong)' }}>{signed(journey.deltaPct)}%</span>
                    </>
                  )}
                </span>
              </div>

              {milestone != null && (
                <p
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                  style={{ background: 'var(--gl-accent-tint)', color: 'var(--gl-on-accent)' }}
                >
                  <Flag className="h-3.5 w-3.5" style={{ color: 'var(--gl-accent-strong)' }} />
                  Você já está {milestone}% mais leve
                </p>
              )}

              <p
                className="mt-3 text-sm leading-relaxed"
                style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--gl-accent-strong)' }}
              >
                {trend.phrase}
              </p>

              <div className="mt-4">
                <WeightChart points={miniPoints} />
              </div>

              <div
                className="mt-4 flex items-center justify-between gap-3 border-t pt-3.5"
                style={{ borderColor: 'var(--gl-line)' }}
              >
                {weeks.registered > 0 ? (
                  <span className="inline-flex items-center gap-2 text-xs" style={{ color: 'var(--gl-ink-3)' }}>
                    <CalendarCheck className="h-4 w-4" style={{ color: 'var(--gl-primary)' }} />
                    Você registrou{' '}
                    <span style={{ color: 'var(--gl-ink)' }}>
                      {weeks.registered} das últimas {weeks.window} semanas
                    </span>
                  </span>
                ) : (
                  <span className="text-xs" style={{ color: 'var(--gl-ink-3)' }}>
                    Sua evolução completa
                  </span>
                )}
                <Link
                  href="/evolucao"
                  className="inline-flex flex-shrink-0 items-center gap-1 text-xs font-medium transition-opacity hover:opacity-70"
                  style={{ color: 'var(--gl-primary)' }}
                >
                  Ver evolução <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </>
          ) : (
            <div className="py-2">
              <p
                className="text-xl leading-tight"
                style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 500, color: 'var(--gl-ink)' }}
              >
                Sua história começa aqui
              </p>
              <p className="mt-1.5 text-sm leading-relaxed" style={{ color: 'var(--gl-ink-2)' }}>
                Registre seu peso para a gente acompanhar sua evolução, no seu tempo.
              </p>
              <div className="mt-4">
                <WeighInForm />
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Faixa de IMC — o movimento, não o rótulo */}
      {journey.currentBmi != null && (
        <div className="gl-in" style={{ animationDelay: '120ms' }}>
          <section
            className="rounded-2xl p-5"
            style={{ background: 'var(--gl-surface)', border: '1px solid var(--gl-line)' }}
          >
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.13em]" style={{ color: 'var(--gl-ink-3)' }}>
              Seu IMC, caminhando
            </p>
            <ImcBand initialBmi={journey.initialBmi} currentBmi={journey.currentBmi} />
            <p className="mt-3 text-xs leading-relaxed" style={{ color: 'var(--gl-ink-2)' }}>
              <span style={{ color: 'var(--gl-ink)' }}>{imcClass(journey.currentBmi)}</span> hoje · a faixa
              verde é a saudável (IMC abaixo de 25), um objetivo no seu tempo. Referência de orientação — a
              meta real é definida com a equipe.
            </p>
          </section>
        </div>
      )}

      {/* Por que você começou */}
      {profile.objetivos.length > 0 && (
        <div className="gl-in rounded-2xl px-5 py-4" style={{ background: 'var(--gl-accent-tint)', animationDelay: '150ms' }}>
          <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.13em]" style={{ color: 'var(--gl-accent-strong)' }}>
            Por que você começou
          </p>
          <div className="flex flex-wrap gap-2">
            {profile.objetivos.map((o) => (
              <span
                key={o}
                className="rounded-full px-3 py-1 text-xs font-medium"
                style={{ background: 'var(--gl-surface)', color: 'var(--gl-on-accent)' }}
              >
                {OBJETIVO_LABELS[o] ?? o}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Acolhimento + acessos rápidos */}
      <div className="gl-in flex flex-col gap-3" style={{ animationDelay: '180ms' }}>
        <div className="flex items-start gap-3 rounded-2xl px-5 py-4" style={{ background: 'var(--gl-support-tint)' }}>
          <Sparkles className="mt-0.5 h-5 w-5 flex-shrink-0" style={{ color: 'var(--gl-primary)' }} />
          <p className="text-sm leading-relaxed" style={{ color: 'var(--gl-ink-2)' }}>
            Recomeçar quando precisar também faz parte. A gente está aqui para te acompanhar, sem cobrança.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-1.5 px-1">
          <Link href="/consultas" className="text-xs font-medium transition-opacity hover:opacity-70" style={{ color: 'var(--gl-primary)' }}>
            Ver minhas consultas
          </Link>
          {data.hasDietPlan && (
            <Link href="/plano" className="text-xs font-medium transition-opacity hover:opacity-70" style={{ color: 'var(--gl-primary)' }}>
              Ver meu plano
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
