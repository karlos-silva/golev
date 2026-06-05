'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  format, isToday, isTomorrow, startOfMonth, endOfMonth, startOfWeek,
  endOfWeek, eachDayOfInterval, addMonths, isSameDay, isSameMonth,
  startOfDay, isBefore,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { Plus, X, Stethoscope, ChevronDown, ChevronLeft, ChevronRight, CalendarDays, Check } from 'lucide-react';
import {
  type AppointmentStatus,
  type AppointmentType,
  APPOINTMENT_STATUS_CONFIG,
  APPOINTMENT_TYPE_LABELS,
} from '@/lib/appointments';
import { Select } from '@/components/ui/select';

interface Appointment {
  id: string;
  scheduledAt: string;
  durationMin: number;
  type: AppointmentType;
  status: AppointmentStatus;
  notes: string | null;
  anamnese: { id: string; nome: string; whatsapp: string; email: string } | null;
  patient: { id: string; user: { id: string; name: string } } | null;
  doctor: { id: string; name: string } | null;
}
interface Assignee { id: string; name: string; role: string }
interface Lead { id: string; nome: string; eligible: boolean; leadStatus: string }

function personName(a: Appointment): string {
  return a.patient?.user.name ?? a.anamnese?.nome ?? 'Sem nome';
}
function dayLabel(d: Date): string {
  if (isToday(d)) return 'Hoje';
  if (isTomorrow(d)) return 'Amanhã';
  return format(d, "EEEE, d 'de' MMMM", { locale: ptBR });
}

export default function AppointmentsPage() {
  const [scheduling, setScheduling] = useState(false);
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery<Appointment[]>({
    queryKey: ['appointments'],
    queryFn: () => api('/appointments'),
  });

  // Agrupa por dia (chave = data ISO local).
  const groups = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    (data ?? []).forEach((a) => {
      const key = format(new Date(a.scheduledAt), 'yyyy-MM-dd');
      const arr = map.get(key) ?? [];
      arr.push(a);
      map.set(key, arr);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [data]);

  const proximas = data?.filter((a) => a.status === 'agendada').length ?? 0;

  return (
    <>
      {scheduling && <ScheduleModal onClose={() => setScheduling(false)} onSaved={() => { void qc.invalidateQueries({ queryKey: ['appointments'] }); }} />}

      <div className="flex flex-col flex-1 gap-6">
        {/* Cabeçalho */}
        <div className="gl-in flex items-end justify-between flex-shrink-0">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest mb-1" style={{ color: 'var(--gl-ink-3)' }}>Agenda</p>
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--gl-ink)' }}>Consultas</h1>
          </div>
          <div className="flex items-center gap-3">
            {!isLoading && (
              <span className="text-xs font-medium rounded-full px-3 py-1.5" style={{ background: 'var(--gl-support-tint)', color: 'var(--gl-primary)' }}>
                {proximas} agendadas
              </span>
            )}
            <button onClick={() => setScheduling(true)}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-80"
              style={{ background: 'var(--gl-primary)', color: 'var(--gl-paper)' }}>
              <Plus className="h-4 w-4" /> Agendar
            </button>
          </div>
        </div>

        {/* Agenda */}
        <div className="gl-in flex-1 min-h-0 overflow-y-auto" style={{ animationDelay: '60ms' }}>
          {isLoading && <Centered text="Carregando…" />}
          {error && <Centered text="Erro ao carregar consultas." />}
          {!isLoading && !error && groups.length === 0 && (
            <div className="rounded-xl flex flex-col items-center justify-center py-20 gap-3" style={{ background: 'var(--gl-surface)', border: '1px solid var(--gl-line)' }}>
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full" style={{ background: 'var(--gl-support-tint)' }}>
                <CalendarDays className="h-5 w-5" style={{ color: 'var(--gl-primary)' }} />
              </div>
              <p className="text-sm font-medium" style={{ color: 'var(--gl-ink-2)' }}>Nenhuma consulta agendada</p>
              <button onClick={() => setScheduling(true)} className="text-xs font-medium" style={{ color: 'var(--gl-primary)' }}>Agendar a primeira</button>
            </div>
          )}

          <div className="space-y-6">
            {groups.map(([key, items]) => (
              <div key={key}>
                <h2 className="text-xs font-semibold uppercase tracking-wider mb-2 px-1" style={{ color: 'var(--gl-ink-3)' }}>
                  {dayLabel(new Date(key + 'T12:00:00'))}
                </h2>
                <div className="rounded-xl overflow-hidden divide-y" style={{ background: 'var(--gl-surface)', border: '1px solid var(--gl-line)', borderColor: 'var(--gl-line)' }}>
                  {items.map((a) => <AppointmentRow key={a.id} a={a} />)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Linha de consulta ──────────────────────────────────────────────────── */
function AppointmentRow({ a }: { a: Appointment }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const cfg = APPOINTMENT_STATUS_CONFIG[a.status];

  const mutation = useMutation({
    mutationFn: (status: AppointmentStatus) => api(`/appointments/${a.id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    onSuccess: () => { setOpen(false); void qc.invalidateQueries({ queryKey: ['appointments'] }); },
  });

  return (
    <div className="flex items-center gap-4 px-5 py-3.5">
      {/* Horário */}
      <div className="w-14 flex-shrink-0 text-center">
        <p className="text-sm font-semibold" style={{ color: 'var(--gl-ink)', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
          {format(new Date(a.scheduledAt), 'HH:mm')}
        </p>
        <p className="text-[10px]" style={{ color: 'var(--gl-ink-3)' }}>{a.durationMin}min</p>
      </div>

      <div className="w-px self-stretch" style={{ background: 'var(--gl-line)' }} />

      {/* Pessoa + tipo */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: 'var(--gl-ink)' }}>{personName(a)}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs" style={{ color: 'var(--gl-ink-3)' }}>{APPOINTMENT_TYPE_LABELS[a.type]}</span>
          {a.doctor && (
            <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--gl-ink-3)' }}>
              <Stethoscope className="h-3 w-3" /> {a.doctor.name}
            </span>
          )}
        </div>
      </div>

      {/* Status (dropdown) */}
      <div className="relative flex-shrink-0" style={{ zIndex: open ? 50 : 'auto' }}>
        <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium" style={{ background: cfg.bg, color: cfg.color }} disabled={mutation.isPending}>
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: cfg.dot }} />
          {cfg.label}
          <ChevronDown className="h-3 w-3 opacity-60" />
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="gl-modal absolute right-0 top-full mt-1 z-50 w-36 rounded-xl shadow-lg overflow-hidden" style={{ background: 'var(--gl-surface)', border: '1px solid var(--gl-line)' }}>
              {(Object.entries(APPOINTMENT_STATUS_CONFIG) as [AppointmentStatus, typeof cfg][]).map(([key, s]) => (
                <button key={key} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-left transition-colors"
                  style={{ color: key === a.status ? s.color : 'var(--gl-ink)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--gl-support-tint)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                  onClick={() => mutation.mutate(key)} disabled={mutation.isPending}>
                  <span className="h-2 w-2 rounded-full" style={{ background: s.dot }} />
                  {s.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Modal de agendamento ───────────────────────────────────────────────── */
const WORK_START = 8;
const WORK_END = 18;
const SLOT_MIN = 30;

function buildSlots(day: Date): Date[] {
  const out: Date[] = [];
  for (let h = WORK_START; h < WORK_END; h++) {
    for (let m = 0; m < 60; m += SLOT_MIN) {
      const d = new Date(day);
      d.setHours(h, m, 0, 0);
      out.push(d);
    }
  }
  return out;
}

function ScheduleModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [leadId, setLeadId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [type, setType] = useState<AppointmentType>('primeira');
  const [notes, setNotes] = useState('');
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);

  const { data: leads } = useQuery<Lead[]>({ queryKey: ['avaliacoes'], queryFn: () => api('/anamnese') });
  const { data: doctors } = useQuery<Assignee[]>({ queryKey: ['assignees'], queryFn: () => api('/appointments/assignees') });
  const { data: appointments } = useQuery<Appointment[]>({ queryKey: ['appointments'], queryFn: () => api('/appointments') });

  const dayKey = selectedDay ? format(selectedDay, 'yyyy-MM-dd') : '';
  const { data: avail } = useQuery<{ connected: boolean; busy: { start: string; end: string }[] }>({
    queryKey: ['freebusy', doctorId, dayKey],
    queryFn: () => {
      const from = new Date(`${dayKey}T00:00:00`).toISOString();
      const to = new Date(`${dayKey}T23:59:59`).toISOString();
      return api(`/integrations/google/freebusy?doctorId=${doctorId}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
    },
    enabled: Boolean(doctorId && dayKey),
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  const eligibleLeads = (leads ?? []).filter((l) => l.eligible && l.leadStatus !== 'convertido' && l.leadStatus !== 'descartado');

  // Intervalos ocupados = Google freebusy + consultas Go Lev do mesmo médico no dia.
  const busyIntervals = [
    ...(avail?.busy ?? []).map((b) => ({ start: new Date(b.start), end: new Date(b.end) })),
    ...(appointments ?? [])
      .filter((a) => a.doctor?.id === doctorId && a.status !== 'cancelada' && selectedDay && isSameDay(new Date(a.scheduledAt), selectedDay))
      .map((a) => ({ start: new Date(a.scheduledAt), end: new Date(+new Date(a.scheduledAt) + a.durationMin * 60_000) })),
  ];

  function slotBusy(slot: Date): boolean {
    const end = new Date(+slot + SLOT_MIN * 60_000);
    return busyIntervals.some((b) => slot < b.end && end > b.start);
  }

  const slots = selectedDay ? buildSlots(selectedDay) : [];
  const monthDays = eachDayOfInterval({ start: startOfWeek(startOfMonth(month)), end: endOfWeek(endOfMonth(month)) });
  const today = startOfDay(new Date());

  const mutation = useMutation({
    mutationFn: () => {
      if (!selectedSlot) throw new Error('Selecione um horário');
      return api('/appointments', {
        method: 'POST',
        body: JSON.stringify({ anamneseId: leadId, scheduledAt: selectedSlot.toISOString(), doctorId: doctorId || undefined, type, notes: notes || undefined }),
      });
    },
    onSuccess: () => { toast.success('Consulta agendada'); onSaved(); onClose(); },
    onError: (e: Error) => toast.error(e.message || 'Erro ao agendar'),
  });

  function confirm() {
    if (!leadId) return toast.error('Selecione o lead');
    if (!doctorId) return toast.error('Selecione o médico');
    if (!selectedSlot) return toast.error('Selecione um horário');
    mutation.mutate();
  }

  const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  return (
    <div className="gl-overlay fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(30,36,38,0.55)', backdropFilter: 'blur(2px)' }} onClick={onClose}>
      <div className="gl-modal w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden" style={{ background: 'var(--gl-paper)', border: '1px solid var(--gl-line)' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--gl-line)' }}>
          <h2 className="text-lg font-bold" style={{ color: 'var(--gl-ink)' }}>Agendar consulta</h2>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors" style={{ color: 'var(--gl-ink-3)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--gl-line)')} onMouseLeave={(e) => (e.currentTarget.style.background = '')}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-5 overflow-y-auto">
          {/* Seleções */}
          <div className="grid sm:grid-cols-3 gap-3">
            <FieldL label="Lead">
              <Select
                value={leadId}
                onChange={setLeadId}
                placeholder="Selecione…"
                options={eligibleLeads.map((l) => ({ value: l.id, label: l.nome }))}
              />
            </FieldL>
            <FieldL label="Médico">
              <Select
                value={doctorId}
                onChange={(v) => { setDoctorId(v); setSelectedSlot(null); }}
                placeholder="Selecione…"
                options={(doctors ?? []).map((d) => ({ value: d.id, label: d.name }))}
              />
            </FieldL>
            <FieldL label="Tipo">
              <Select
                value={type}
                onChange={(v) => setType(v as AppointmentType)}
                options={[{ value: 'primeira', label: 'Primeira consulta' }, { value: 'retorno', label: 'Retorno' }]}
              />
            </FieldL>
          </div>

          {/* Booker: calendário + horários */}
          <div>
            <p className="text-xs font-medium mb-2" style={{ color: 'var(--gl-ink-2)' }}>Selecione data e horário</p>
            <div className="grid md:grid-cols-[260px_1fr] gap-5 rounded-xl p-4" style={{ background: 'var(--gl-surface)', border: '1px solid var(--gl-line)' }}>
              {/* Calendário */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold capitalize" style={{ color: 'var(--gl-ink)' }}>
                    {format(month, 'MMMM yyyy', { locale: ptBR })}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => setMonth(addMonths(month, -1))} className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors" style={{ color: 'var(--gl-ink-2)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--gl-support-tint)')} onMouseLeave={(e) => (e.currentTarget.style.background = '')}>
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button onClick={() => setMonth(addMonths(month, 1))} className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors" style={{ color: 'var(--gl-ink-2)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--gl-support-tint)')} onMouseLeave={(e) => (e.currentTarget.style.background = '')}>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {WEEKDAYS.map((w, i) => (
                    <span key={i} className="text-center text-[10px] font-semibold" style={{ color: 'var(--gl-ink-3)' }}>{w}</span>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {monthDays.map((day) => {
                    const past = isBefore(startOfDay(day), today);
                    const outside = !isSameMonth(day, month);
                    const selected = selectedDay && isSameDay(day, selectedDay);
                    const isCurrentDay = isSameDay(day, new Date());
                    return (
                      <button
                        key={day.toISOString()}
                        disabled={past}
                        onClick={() => { setSelectedDay(day); setSelectedSlot(null); }}
                        className="aspect-square flex items-center justify-center rounded-full text-xs transition-colors"
                        style={{
                          background: selected ? 'var(--gl-primary)' : 'transparent',
                          color: selected ? 'var(--gl-paper)' : past ? 'var(--gl-ink-3)' : outside ? 'var(--gl-ink-3)' : 'var(--gl-ink)',
                          fontWeight: isCurrentDay ? 700 : 400,
                          opacity: past ? 0.4 : outside ? 0.5 : 1,
                          cursor: past ? 'not-allowed' : 'pointer',
                          border: isCurrentDay && !selected ? '1px solid var(--gl-primary)' : '1px solid transparent',
                        }}
                        onMouseEnter={(e) => { if (!selected && !past) e.currentTarget.style.background = 'var(--gl-support-tint)'; }}
                        onMouseLeave={(e) => { if (!selected) e.currentTarget.style.background = 'transparent'; }}
                      >
                        {format(day, 'd')}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Horários */}
              <div className="md:border-l md:pl-5 min-h-[260px]" style={{ borderColor: 'var(--gl-line)' }}>
                {!doctorId ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-sm text-center" style={{ color: 'var(--gl-ink-3)' }}>Selecione um médico<br />para ver os horários</p>
                  </div>
                ) : !selectedDay ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-sm text-center" style={{ color: 'var(--gl-ink-3)' }}>Escolha um dia<br />para ver os horários</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold capitalize" style={{ color: 'var(--gl-ink)' }}>
                        {format(selectedDay, "EEE, d 'de' MMM", { locale: ptBR })}
                      </span>
                      {doctorId && avail && !avail.connected && (
                        <span className="text-[10px]" style={{ color: 'var(--gl-ink-3)' }}>agenda não conectada</span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[220px] overflow-y-auto pr-1">
                      {slots.map((slot) => {
                        const busy = slotBusy(slot) || isBefore(slot, new Date());
                        const sel = selectedSlot && +selectedSlot === +slot;
                        return (
                          <button
                            key={slot.toISOString()}
                            disabled={busy}
                            onClick={() => setSelectedSlot(slot)}
                            className="rounded-lg py-2 text-xs font-medium transition-colors"
                            style={{
                              background: sel ? 'var(--gl-primary)' : busy ? 'transparent' : 'var(--gl-paper)',
                              color: sel ? 'var(--gl-paper)' : busy ? 'var(--gl-ink-3)' : 'var(--gl-primary)',
                              border: `1px solid ${sel ? 'var(--gl-primary)' : 'var(--gl-line)'}`,
                              opacity: busy ? 0.4 : 1,
                              textDecoration: busy ? 'line-through' : 'none',
                              cursor: busy ? 'not-allowed' : 'pointer',
                            }}
                            onMouseEnter={(e) => { if (!sel && !busy) e.currentTarget.style.background = 'var(--gl-support-tint)'; }}
                            onMouseLeave={(e) => { if (!sel && !busy) e.currentTarget.style.background = 'var(--gl-paper)'; }}
                          >
                            {format(slot, 'HH:mm')}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Notas */}
          <FieldL label="Notas (opcional)">
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="gl-select resize-none" placeholder="Observações…" />
          </FieldL>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderTop: '1px solid var(--gl-line)' }}>
          <span className="text-xs" style={{ color: 'var(--gl-ink-2)' }}>
            {selectedSlot
              ? <>Agendando para <strong style={{ color: 'var(--gl-ink)' }}>{format(selectedSlot, "d 'de' MMM 'às' HH:mm", { locale: ptBR })}</strong></>
              : 'Selecione um horário disponível'}
          </span>
          <button onClick={confirm} disabled={mutation.isPending || !leadId || !doctorId || !selectedSlot}
            className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-40"
            style={{ background: 'var(--gl-primary)', color: 'var(--gl-paper)' }}>
            <Check className="h-4 w-4" /> {mutation.isPending ? 'Agendando…' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}

function FieldL({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium mb-1.5" style={{ color: 'var(--gl-ink-2)' }}>{label}</span>
      {children}
    </label>
  );
}

function Centered({ text }: { text: string }) {
  return <div className="flex h-40 items-center justify-center"><p className="text-sm" style={{ color: 'var(--gl-ink-3)' }}>{text}</p></div>;
}
