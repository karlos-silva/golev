'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarHeart, CalendarPlus, Clock, Info } from 'lucide-react';
import {
  PageHeader,
  Accent,
  SectionCard,
  StatusPill,
  EmptyState,
  Modal,
  Field,
  CenteredMessage,
} from '@/components/client/primitives';
import {
  useMeAppointments,
  useMeConsultationRequests,
  useCreateConsultationRequest,
} from '@/hooks/use-me';
import {
  APPOINTMENT_STATUS_CONFIG,
  APPOINTMENT_TYPE_LABELS,
  type AppointmentStatus,
} from '@/lib/appointments';
import {
  CONSULTATION_REQUEST_STATUS_CONFIG,
  CONSULTATION_PERIOD_LABELS,
} from '@/lib/consultations';
import type { MeAppointment } from '@golev/shared';

export default function ConsultasPage() {
  const appts = useMeAppointments();
  const requests = useMeConsultationRequests();
  const [open, setOpen] = useState(false);

  if (appts.isLoading || requests.isLoading)
    return <CenteredMessage>Carregando suas consultas…</CenteredMessage>;

  const all = appts.data ?? [];
  const now = Date.now();
  const upcoming = all
    .filter((a) => a.status === 'agendada' && +new Date(a.scheduledAt) >= now)
    .sort((x, y) => +new Date(x.scheduledAt) - +new Date(y.scheduledAt));
  const past = all
    .filter((a) => !(a.status === 'agendada' && +new Date(a.scheduledAt) >= now))
    .sort((x, y) => +new Date(y.scheduledAt) - +new Date(x.scheduledAt));

  const reqs = requests.data ?? [];
  const pending = reqs.find((r) => r.status === 'pendente');

  return (
    <>
      <PageHeader
        kicker="Consultas"
        title="Suas consultas"
        subtitle={
          <>
            Acompanhe seus encontros com a equipe e, quando quiser, peça uma nova consulta — a gente <Accent>confirma</Accent> com você.
          </>
        }
        action={
          <button
            onClick={() => setOpen(true)}
            disabled={!!pending}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: 'var(--gl-primary)', color: 'var(--gl-paper)' }}
          >
            <CalendarPlus className="h-4 w-4" />
            Solicitar consulta
          </button>
        }
      />

      {pending && (
        <div
          className="gl-in flex items-start gap-3 rounded-2xl px-5 py-4"
          style={{ background: 'var(--gl-accent-tint)' }}
        >
          <Info className="mt-0.5 h-5 w-5 flex-shrink-0" style={{ color: 'var(--gl-accent-strong)' }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--gl-on-accent)' }}>
              Sua solicitação está em análise
            </p>
            <p className="mt-0.5 text-sm leading-relaxed" style={{ color: 'var(--gl-on-accent)' }}>
              A gente entra em contato em breve para confirmar o melhor horário. Sem pressa.
            </p>
          </div>
        </div>
      )}

      {/* Próximas */}
      <div className="gl-in" style={{ animationDelay: '40ms' }}>
        <SectionCard title="Próximas" icon={<CalendarHeart className="h-4 w-4" />} bodyClassName="p-0">
          {upcoming.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={<CalendarHeart className="h-5 w-5" />}
                title="Nenhuma consulta marcada"
                action={
                  <button
                    onClick={() => setOpen(true)}
                    disabled={!!pending}
                    className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
                    style={{ background: 'var(--gl-primary)', color: 'var(--gl-paper)' }}
                  >
                    <CalendarPlus className="h-4 w-4" /> Solicitar consulta
                  </button>
                }
              >
                Quando quiser conversar com a equipe, é só pedir.
              </EmptyState>
            </div>
          ) : (
            <ul className="divide-y" style={{ borderColor: 'var(--gl-line)' }}>
              {upcoming.map((a) => (
                <AppointmentRow key={a.id} appt={a} highlight />
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      {/* Histórico */}
      {past.length > 0 && (
        <div className="gl-in" style={{ animationDelay: '90ms' }}>
          <SectionCard title="Histórico" icon={<Clock className="h-4 w-4" />} bodyClassName="p-0">
            <ul className="divide-y" style={{ borderColor: 'var(--gl-line)' }}>
              {past.map((a) => (
                <AppointmentRow key={a.id} appt={a} />
              ))}
            </ul>
          </SectionCard>
        </div>
      )}

      {/* Solicitações */}
      {reqs.length > 0 && (
        <div className="gl-in" style={{ animationDelay: '140ms' }}>
          <SectionCard title="Suas solicitações" icon={<CalendarPlus className="h-4 w-4" />} bodyClassName="p-0">
            <ul className="divide-y" style={{ borderColor: 'var(--gl-line)' }}>
              {reqs.map((r) => {
                const cfg =
                  CONSULTATION_REQUEST_STATUS_CONFIG[r.status] ??
                  CONSULTATION_REQUEST_STATUS_CONFIG.pendente!;
                return (
                  <li key={r.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                    <div className="min-w-0">
                      <p className="text-sm font-medium" style={{ color: 'var(--gl-ink)' }}>
                        {r.preferredPeriod
                          ? `Preferência: ${CONSULTATION_PERIOD_LABELS[r.preferredPeriod] ?? r.preferredPeriod}`
                          : 'Solicitação de consulta'}
                        {r.preferredDate && (
                          <> · {format(new Date(r.preferredDate), "d 'de' MMM", { locale: ptBR })}</>
                        )}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--gl-ink-3)' }}>
                        Pedida em {format(new Date(r.createdAt), "d 'de' MMM", { locale: ptBR })}
                        {r.reason ? ` · ${r.reason}` : ''}
                      </p>
                    </div>
                    <StatusPill label={cfg.label} bg={cfg.bg} color={cfg.color} dot={cfg.dot} />
                  </li>
                );
              })}
            </ul>
          </SectionCard>
        </div>
      )}

      <RequestModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function AppointmentRow({ appt, highlight }: { appt: MeAppointment; highlight?: boolean }) {
  const cfg =
    APPOINTMENT_STATUS_CONFIG[appt.status as AppointmentStatus] ??
    APPOINTMENT_STATUS_CONFIG.agendada;
  return (
    <li className="flex items-center justify-between gap-3 px-5 py-4">
      <div className="flex items-center gap-4 min-w-0">
        <div
          className="flex h-12 w-12 flex-shrink-0 flex-col items-center justify-center rounded-xl"
          style={{
            background: highlight ? 'var(--gl-support-tint)' : 'var(--gl-paper)',
            border: '1px solid var(--gl-line)',
          }}
        >
          <span className="text-[10px] uppercase" style={{ color: 'var(--gl-ink-3)' }}>
            {format(new Date(appt.scheduledAt), 'MMM', { locale: ptBR })}
          </span>
          <span className="text-base font-bold leading-none" style={{ color: 'var(--gl-ink)' }}>
            {format(new Date(appt.scheduledAt), 'd', { locale: ptBR })}
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold" style={{ color: 'var(--gl-ink)' }}>
            {format(new Date(appt.scheduledAt), "EEEE 'às' HH'h'mm", { locale: ptBR })}
          </p>
          <p className="text-xs" style={{ color: 'var(--gl-ink-3)' }}>
            {APPOINTMENT_TYPE_LABELS[appt.type as 'primeira' | 'retorno'] ?? appt.type}
            {appt.doctor ? ` · ${appt.doctor.name}` : ''}
          </p>
        </div>
      </div>
      <StatusPill label={cfg.label} bg={cfg.bg} color={cfg.color} dot={cfg.dot} />
    </li>
  );
}

function todayLocalISODate(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function RequestModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const create = useCreateConsultationRequest();
  const [period, setPeriod] = useState('qualquer');
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    create.mutate(
      {
        preferredPeriod: period as 'manha' | 'tarde' | 'noite' | 'qualquer',
        preferredDate: date ? new Date(`${date}T12:00:00`).toISOString() : undefined,
        reason: reason.trim() || undefined,
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          setPeriod('qualquer');
          setDate('');
          setReason('');
          setNotes('');
          onClose();
        },
      },
    );
  }

  return (
    <Modal open={open} onClose={onClose} title="Solicitar consulta">
      <form onSubmit={submit} className="space-y-4">
        <p className="text-sm leading-relaxed" style={{ color: 'var(--gl-ink-2)' }}>
          Conta pra gente sua preferência. A equipe confirma o melhor horário com você.
        </p>

        <Field label="Período preferido">
          <select className="gl-select" value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="qualquer">Qualquer horário</option>
            <option value="manha">De manhã</option>
            <option value="tarde">À tarde</option>
            <option value="noite">À noite</option>
          </select>
        </Field>

        <Field label="Data preferida (opcional)" htmlFor="data">
          <input
            id="data"
            type="date"
            className="gl-select"
            value={date}
            min={todayLocalISODate()}
            onChange={(e) => setDate(e.target.value)}
          />
        </Field>

        <Field label="Motivo (opcional)" htmlFor="motivo">
          <input
            id="motivo"
            className="gl-select"
            placeholder="Ex.: dúvida sobre a medicação, retorno…"
            maxLength={200}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </Field>

        <Field label="Algo que a gente deva saber? (opcional)" htmlFor="notas">
          <textarea
            id="notas"
            className="gl-select min-h-20 resize-none"
            placeholder="Fique à vontade."
            maxLength={2000}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Field>

        <button
          type="submit"
          disabled={create.isPending}
          className="w-full rounded-lg px-4 py-3 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ background: 'var(--gl-primary)', color: 'var(--gl-paper)' }}
        >
          {create.isPending ? 'Enviando…' : 'Enviar solicitação'}
        </button>
      </form>
    </Modal>
  );
}
