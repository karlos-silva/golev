'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Scale, CalendarHeart, Clock, Salad, ChevronRight, Sparkles, FlaskConical } from 'lucide-react';
import type { MeOverview } from '@golev/shared';
import { buildTasks, type TodayTask } from '@/lib/build-tasks';
import { Modal } from '@/components/client/primitives';
import { WeighInForm } from '@/components/client/weigh-in-form';
import { APPOINTMENT_TYPE_LABELS } from '@/lib/appointments';
import { whatsappUrl } from '@/lib/whatsapp';

const READ_PLAN_KEY = 'gl_today_read_plan_dismissed';

function relativeDay(at: string, now = new Date()): string {
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((startOf(new Date(at)) - startOf(now)) / 86_400_000);
  if (days <= 0) return 'hoje';
  if (days === 1) return 'amanhã';
  return format(new Date(at), 'EEEE', { locale: ptBR });
}

interface RowView {
  icon: ReactNode;
  title: string;
  description: string;
  accent?: boolean;
}

function viewFor(task: TodayTask): RowView {
  switch (task.kind) {
    case 'send-exams':
      return { icon: <FlaskConical className="h-[18px] w-[18px]" />, title: 'Envie seus exames', description: 'A médica pediu — toque para enviar pelo WhatsApp', accent: true };
    case 'weigh-in':
      return { icon: <Scale className="h-[18px] w-[18px]" />, title: 'Registrar seu peso da semana', description: 'Leva 10 segundos. Sem pressa.', accent: true };
    case 'appointment': {
      const time = task.at ? format(new Date(task.at), "HH'h'mm", { locale: ptBR }) : '';
      const when = task.at ? relativeDay(task.at) : '';
      const tipo = APPOINTMENT_TYPE_LABELS[(task.apptType as 'primeira' | 'retorno') ?? 'retorno'] ?? task.apptType ?? '';
      return {
        icon: <CalendarHeart className="h-[18px] w-[18px]" />,
        title: `Sua consulta é ${when}, ${time}`,
        description: task.doctorName ? `${tipo} com ${task.doctorName}` : tipo,
      };
    }
    case 'request-pending':
      return { icon: <Clock className="h-[18px] w-[18px]" />, title: 'Sua solicitação está em análise', description: 'A equipe retorna em breve.' };
    case 'read-plan':
      return { icon: <Salad className="h-[18px] w-[18px]" />, title: 'Seu plano alimentar está pronto', description: 'Dê uma olhada quando puder.' };
  }
}

function RowInner({ view, info }: { view: RowView; info?: boolean }) {
  return (
    <>
      <span
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px]"
        style={{
          background: view.accent ? 'var(--gl-accent-tint)' : 'var(--gl-support-tint)',
          color: view.accent ? 'var(--gl-accent-strong)' : 'var(--gl-primary)',
        }}
      >
        {view.icon}
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="block text-sm" style={{ color: 'var(--gl-ink)' }}>
          {view.title}
        </span>
        <span className="mt-0.5 block text-xs" style={{ color: 'var(--gl-ink-3)' }}>
          {view.description}
        </span>
      </span>
      {!info && <ChevronRight className="h-[18px] w-[18px] flex-shrink-0" style={{ color: 'var(--gl-ink-3)' }} />}
    </>
  );
}

const ROW_CLS = 'flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors';

/** Cartão "Para hoje": 1–3 passos derivados do /me. Encolhe conforme a pessoa age. */
export function TodayCard({ overview }: { overview: MeOverview }) {
  const [weighOpen, setWeighOpen] = useState(false);
  const [planDismissed, setPlanDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(READ_PLAN_KEY) === '1';
  });

  const tasks = buildTasks(overview, { readPlanDismissed: planDismissed });
  const examsWaUrl = whatsappUrl(
    `Olá, aqui é ${overview.profile.name}. Quero enviar meus exames para a Go Lev.`,
  );

  function dismissPlan() {
    setPlanDismissed(true);
    try {
      window.localStorage.setItem(READ_PLAN_KEY, '1');
    } catch {
      /* localStorage indisponível — segue sem persistir */
    }
  }

  return (
    <>
      <section
        className="overflow-hidden rounded-2xl"
        style={{ background: 'var(--gl-surface)', border: '1px solid var(--gl-line)' }}
      >
        <div className="px-5 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-[0.13em]" style={{ color: 'var(--gl-ink-3)' }}>
          Para hoje
        </div>

        {tasks.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 pb-7 pt-4 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: 'var(--gl-support-tint)', color: 'var(--gl-primary)' }}>
              <Sparkles className="h-5 w-5" />
            </span>
            <p className="text-base font-semibold" style={{ color: 'var(--gl-ink)' }}>
              Tudo em dia por aqui
            </p>
            <p className="max-w-xs text-sm leading-relaxed" style={{ color: 'var(--gl-ink-2)' }}>
              Que tal registrar como você está hoje? Sem pressa.
            </p>
            <button
              onClick={() => setWeighOpen(true)}
              className="mt-1 inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ background: 'var(--gl-primary)', color: 'var(--gl-paper)' }}
            >
              <Scale className="h-4 w-4" /> Registrar meu peso
            </button>
          </div>
        ) : (
          <ul className="mt-1 divide-y" style={{ borderColor: 'var(--gl-line)' }}>
            {tasks.map((task) => {
              const view = viewFor(task);
              if (task.kind === 'send-exams') {
                return (
                  <li key={task.kind} style={{ borderColor: 'var(--gl-line)' }}>
                    <a
                      href={examsWaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${ROW_CLS} hover:bg-[var(--gl-support-tint)]`}
                    >
                      <RowInner view={view} />
                    </a>
                  </li>
                );
              }
              if (task.kind === 'weigh-in') {
                return (
                  <li key={task.kind} style={{ borderColor: 'var(--gl-line)' }}>
                    <button onClick={() => setWeighOpen(true)} className={`${ROW_CLS} hover:bg-[var(--gl-support-tint)]`}>
                      <RowInner view={view} />
                    </button>
                  </li>
                );
              }
              if (task.kind === 'request-pending') {
                return (
                  <li key={task.kind} className={ROW_CLS} style={{ borderColor: 'var(--gl-line)' }}>
                    <RowInner view={view} info />
                  </li>
                );
              }
              const href = task.kind === 'appointment' ? '/consultas' : '/plano';
              return (
                <li key={task.kind} style={{ borderColor: 'var(--gl-line)' }}>
                  <Link
                    href={href}
                    onClick={task.kind === 'read-plan' ? dismissPlan : undefined}
                    className={`${ROW_CLS} hover:bg-[var(--gl-support-tint)]`}
                  >
                    <RowInner view={view} />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <Modal open={weighOpen} onClose={() => setWeighOpen(false)} title="Registrar pesagem">
        <p className="mb-3 text-sm leading-relaxed" style={{ color: 'var(--gl-ink-2)' }}>
          Como você está hoje? Registre seu peso — a gente cuida do resto.
        </p>
        <WeighInForm onSaved={() => setWeighOpen(false)} />
      </Modal>
    </>
  );
}
