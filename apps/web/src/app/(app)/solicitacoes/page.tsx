'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import { api } from '@/lib/api';
import {
  CONSULTATION_REQUEST_STATUS_CONFIG,
  CONSULTATION_PERIOD_LABELS,
} from '@/lib/consultations';

interface RequestRow {
  id: string;
  preferredPeriod: string | null;
  preferredDate: string | null;
  reason: string | null;
  notes: string | null;
  status: string;
  createdAt: string;
  patient: { id: string; user: { id: string; name: string } | null } | null;
}

interface Assignee {
  id: string;
  name: string;
  role: string;
}

export default function SolicitacoesPage() {
  const { data, isLoading } = useQuery<RequestRow[]>({
    queryKey: ['consultation-requests'],
    queryFn: () => api('/consultation-requests'),
  });

  const [confirming, setConfirming] = useState<RequestRow | null>(null);

  const pending = (data ?? []).filter((r) => r.status === 'pendente');
  const handled = (data ?? []).filter((r) => r.status !== 'pendente');

  return (
    <div className="flex flex-col flex-1 gap-6">
      <div className="gl-in flex items-start justify-between flex-shrink-0">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--gl-ink-3)' }}>
            Atendimento
          </p>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--gl-ink)' }}>
            Solicitações de consulta
          </h1>
        </div>
        {pending.length > 0 && (
          <span
            className="rounded-full px-3 py-1 text-sm font-semibold"
            style={{ background: 'var(--gl-accent-tint)', color: 'var(--gl-accent-strong)' }}
          >
            {pending.length} pendente{pending.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {isLoading ? (
        <Centered text="Carregando…" />
      ) : pending.length === 0 && handled.length === 0 ? (
        <Centered text="Nenhuma solicitação por enquanto." />
      ) : (
        <div className="gl-in flex flex-col gap-6" style={{ animationDelay: '60ms' }}>
          {pending.length > 0 && (
            <Card title="Pendentes">
              <ul className="divide-y" style={{ borderColor: 'var(--gl-line)' }}>
                {pending.map((r) => (
                  <RequestItem key={r.id} req={r} onConfirm={() => setConfirming(r)} />
                ))}
              </ul>
            </Card>
          )}

          {handled.length > 0 && (
            <Card title="Histórico">
              <ul className="divide-y" style={{ borderColor: 'var(--gl-line)' }}>
                {handled.map((r) => (
                  <RequestItem key={r.id} req={r} />
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}

      {confirming && (
        <ConfirmModal req={confirming} onClose={() => setConfirming(null)} />
      )}
    </div>
  );
}

function RequestItem({ req, onConfirm }: { req: RequestRow; onConfirm?: () => void }) {
  const qc = useQueryClient();
  const cfg =
    CONSULTATION_REQUEST_STATUS_CONFIG[req.status] ??
    CONSULTATION_REQUEST_STATUS_CONFIG.pendente!;

  const reject = useMutation({
    mutationFn: () => api(`/consultation-requests/${req.id}/reject`, { method: 'POST' }),
    onSuccess: () => {
      toast.success('Solicitação recusada');
      void qc.invalidateQueries({ queryKey: ['consultation-requests'] });
    },
    onError: (e: Error) => toast.error(e.message || 'Erro'),
  });

  const prefs: string[] = [];
  if (req.preferredPeriod)
    prefs.push(CONSULTATION_PERIOD_LABELS[req.preferredPeriod] ?? req.preferredPeriod);
  if (req.preferredDate)
    prefs.push(format(new Date(req.preferredDate), "d 'de' MMM", { locale: ptBR }));

  return (
    <li className="flex items-start justify-between gap-4 px-4 py-3.5">
      <div className="min-w-0">
        <p className="text-sm font-semibold" style={{ color: 'var(--gl-ink)' }}>
          {req.patient?.user?.name ?? 'Paciente'}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--gl-ink-3)' }}>
          {prefs.length > 0 ? prefs.join(' · ') : 'Sem preferência'}
          {' · pedido em '}
          {format(new Date(req.createdAt), "d 'de' MMM", { locale: ptBR })}
        </p>
        {(req.reason || req.notes) && (
          <p className="text-sm mt-1.5" style={{ color: 'var(--gl-ink-2)' }}>
            {req.reason}
            {req.reason && req.notes ? ' — ' : ''}
            {req.notes}
          </p>
        )}
      </div>
      {onConfirm ? (
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => reject.mutate()}
            disabled={reject.isPending}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors disabled:opacity-50"
            style={{ border: '1px solid var(--gl-line)', color: 'var(--gl-ink-2)' }}
          >
            <X className="h-3.5 w-3.5" /> Recusar
          </button>
          <button
            onClick={onConfirm}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-opacity hover:opacity-90"
            style={{ background: 'var(--gl-primary)', color: 'var(--gl-paper)' }}
          >
            <Check className="h-3.5 w-3.5" /> Confirmar
          </button>
        </div>
      ) : (
        <span
          className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
          style={{ background: cfg.bg, color: cfg.color }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: cfg.dot }} />
          {cfg.label}
        </span>
      )}
    </li>
  );
}

function ConfirmModal({ req, onClose }: { req: RequestRow; onClose: () => void }) {
  const qc = useQueryClient();
  const [scheduledAt, setScheduledAt] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [notes, setNotes] = useState(req.notes ?? '');

  const { data: assignees } = useQuery<Assignee[]>({
    queryKey: ['assignees'],
    queryFn: () => api('/appointments/assignees'),
  });

  const confirm = useMutation({
    mutationFn: () =>
      api(`/consultation-requests/${req.id}/confirm`, {
        method: 'POST',
        body: JSON.stringify({
          scheduledAt: new Date(scheduledAt).toISOString(),
          doctorId: doctorId || undefined,
          notes: notes.trim() || undefined,
        }),
      }),
    onSuccess: () => {
      toast.success('Consulta confirmada e agendada');
      void qc.invalidateQueries({ queryKey: ['consultation-requests'] });
      void qc.invalidateQueries({ queryKey: ['appointments'] });
      onClose();
    },
    onError: (e: Error) => toast.error(e.message || 'Erro ao confirmar'),
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!scheduledAt) {
      toast.error('Defina a data e o horário');
      return;
    }
    confirm.mutate();
  }

  return (
    <div
      className="gl-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(30,36,38,0.55)', backdropFilter: 'blur(2px)' }}
      onClick={onClose}
    >
      <div
        className="gl-modal w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: 'var(--gl-surface)', border: '1px solid var(--gl-line)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--gl-line)' }}>
          <h2 className="text-base font-bold tracking-tight" style={{ color: 'var(--gl-ink)' }}>
            Confirmar consulta
          </h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--gl-ink-3)' }}>
            {req.patient?.user?.name ?? 'Paciente'}
          </p>
        </div>
        <form onSubmit={submit} className="px-5 py-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--gl-ink)' }}>
              Data e horário
            </label>
            <input
              type="datetime-local"
              className="gl-select"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--gl-ink)' }}>
              Médico responsável
            </label>
            <select className="gl-select" value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
              <option value="">A definir</option>
              {(assignees ?? []).map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--gl-ink)' }}>
              Observações (opcional)
            </label>
            <textarea
              className="gl-select min-h-20 resize-none"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={2000}
            />
          </div>
          <button
            type="submit"
            disabled={confirm.isPending}
            className="w-full rounded-lg px-4 py-3 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: 'var(--gl-primary)', color: 'var(--gl-paper)' }}
          >
            {confirm.isPending ? 'Confirmando…' : 'Confirmar e agendar'}
          </button>
        </form>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: 'var(--gl-surface)', border: '1px solid var(--gl-line)' }}
    >
      <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--gl-line)' }}>
        <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--gl-ink-2)' }}>
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

function Centered({ text }: { text: string }) {
  return (
    <div className="flex flex-1 items-center justify-center">
      <p className="text-sm" style={{ color: 'var(--gl-ink-3)' }}>
        {text}
      </p>
    </div>
  );
}
