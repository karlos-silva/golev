'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Scale,
  TrendingDown,
  CalendarHeart,
  Activity,
  ArrowRight,
  Salad,
  Sparkles,
} from 'lucide-react';
import { WeightChart } from '@/components/app/weight-chart';
import {
  PageHeader,
  Accent,
  SectionCard,
  Metric,
  CenteredMessage,
} from '@/components/client/primitives';
import { WeighInForm } from '@/components/client/weigh-in-form';
import { ProfileConfirmCard } from '@/components/client/profile-confirm-card';
import { useMeOverview } from '@/hooks/use-me';
import { useAuth } from '@/stores/auth';
import { imcClass } from '@/lib/anamnese';
import { APPOINTMENT_TYPE_LABELS } from '@/lib/appointments';

const kg = (n: number) => `${n.toFixed(1).replace('.', ',')} kg`;
const signedKg = (n: number) =>
  `${n > 0 ? '+' : n < 0 ? '−' : ''}${Math.abs(n).toFixed(1).replace('.', ',')} kg`;

export default function InicioPage() {
  const { data, isLoading, error } = useMeOverview();
  const user = useAuth((s) => s.user);
  const firstName = user?.name?.split(' ')[0] ?? 'Você';

  if (isLoading) return <CenteredMessage>Carregando sua jornada…</CenteredMessage>;
  if (error || !data)
    return <CenteredMessage>Não conseguimos carregar agora. Tente recarregar a página.</CenteredMessage>;

  const { journey, hasDietPlan } = data;
  const points = journey.chart.map((c) => ({ t: +new Date(c.measuredAt), w: c.weightKg }));
  const lost = journey.deltaKg != null && journey.deltaKg < 0;

  return (
    <>
      <PageHeader
        kicker="Sua jornada"
        title={`Olá, ${firstName}`}
        subtitle={
          <>
            Que bom ter você aqui. A gente caminha <Accent>junto</Accent>, no seu ritmo — cada passo conta.
          </>
        }
      />

      {!data.profile.profileConfirmed && (
        <ProfileConfirmCard profile={data.profile} />
      )}

      {/* Métricas da jornada */}
      <div className="gl-in grid grid-cols-2 gap-4 lg:grid-cols-4" style={{ animationDelay: '40ms' }}>
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
              ? `${journey.deltaPct > 0 ? '+' : journey.deltaPct < 0 ? '−' : ''}${Math.abs(journey.deltaPct).toFixed(1).replace('.', ',')}% desde o início`
              : 'desde o início'
          }
          icon={<TrendingDown className="h-3.5 w-3.5" />}
          tone={lost ? 'var(--gl-primary)' : 'var(--gl-ink)'}
        />
        <Metric
          label="Acompanhamento"
          value={`${journey.daysInProgram}`}
          sub={journey.daysInProgram === 1 ? 'dia com a gente' : 'dias com a gente'}
          icon={<CalendarHeart className="h-3.5 w-3.5" />}
        />
        <Metric
          label="IMC atual"
          value={journey.currentBmi != null ? journey.currentBmi.toFixed(1).replace('.', ',') : '—'}
          sub={journey.currentBmi != null ? imcClass(journey.currentBmi) : undefined}
          icon={<Activity className="h-3.5 w-3.5" />}
        />
      </div>

      <div className="gl-in grid gap-5 lg:grid-cols-3" style={{ animationDelay: '90ms' }}>
        {/* Evolução + pesagem rápida */}
        <div className="lg:col-span-2">
          <SectionCard
            title="Sua evolução"
            icon={<TrendingDown className="h-4 w-4" />}
            action={
              <Link
                href="/evolucao"
                className="inline-flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-70"
                style={{ color: 'var(--gl-primary)' }}
              >
                Ver tudo <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          >
            <WeightChart points={points} />
            <div className="mt-5 border-t pt-4" style={{ borderColor: 'var(--gl-line)' }}>
              <p className="mb-2 text-xs" style={{ color: 'var(--gl-ink-3)' }}>
                Registre sua pesagem de hoje
              </p>
              <WeighInForm />
            </div>
          </SectionCard>
        </div>

        {/* Coluna lateral */}
        <div className="flex flex-col gap-5">
          <SectionCard title="Próxima consulta" icon={<CalendarHeart className="h-4 w-4" />}>
            {journey.nextAppointment ? (
              <div className="space-y-3">
                <p
                  className="text-lg leading-tight"
                  style={{ color: 'var(--gl-ink)', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 500 }}
                >
                  {format(new Date(journey.nextAppointment.scheduledAt), "EEEE, d 'de' MMMM", { locale: ptBR })}
                </p>
                <p className="text-sm" style={{ color: 'var(--gl-ink-2)' }}>
                  às {format(new Date(journey.nextAppointment.scheduledAt), "HH'h'mm", { locale: ptBR })}
                  {' · '}
                  {APPOINTMENT_TYPE_LABELS[journey.nextAppointment.type as 'primeira' | 'retorno'] ?? journey.nextAppointment.type}
                </p>
                {journey.nextAppointment.doctor && (
                  <p className="text-sm" style={{ color: 'var(--gl-ink-3)' }}>
                    com {journey.nextAppointment.doctor.name}
                  </p>
                )}
                <Link
                  href="/consultas"
                  className="inline-flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-70"
                  style={{ color: 'var(--gl-primary)' }}
                >
                  Ver consultas <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm" style={{ color: 'var(--gl-ink-2)' }}>
                  Você não tem consulta marcada.
                </p>
                <Link
                  href="/consultas"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90"
                  style={{ background: 'var(--gl-primary)', color: 'var(--gl-paper)' }}
                >
                  Solicitar consulta
                </Link>
              </div>
            )}
          </SectionCard>

          <SectionCard title="Meu plano" icon={<Salad className="h-4 w-4" />}>
            {hasDietPlan ? (
              <div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--gl-ink-2)' }}>
                  Seu plano alimentar está pronto. Dê uma olhada quando puder.
                </p>
                <Link
                  href="/plano"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-70"
                  style={{ color: 'var(--gl-primary)' }}
                >
                  Abrir meu plano <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              <p className="text-sm leading-relaxed" style={{ color: 'var(--gl-ink-2)' }}>
                Seu plano vai aparecer aqui assim que a equipe montar, com calma e do seu jeito.
              </p>
            )}
          </SectionCard>
        </div>
      </div>

      {/* Nota de acolhimento */}
      <div
        className="gl-in flex items-start gap-3 rounded-2xl px-5 py-4"
        style={{ background: 'var(--gl-accent-tint)', animationDelay: '140ms' }}
      >
        <Sparkles className="mt-0.5 h-5 w-5 flex-shrink-0" style={{ color: 'var(--gl-accent-strong)' }} />
        <p className="text-sm leading-relaxed" style={{ color: 'var(--gl-on-accent)' }}>
          Recomeçar quando precisar também faz parte. A gente está aqui para te acompanhar, sem cobrança.
        </p>
      </div>
    </>
  );
}
