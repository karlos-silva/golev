'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { ArrowLeft, Scale, TrendingDown, Activity, Plus, Salad } from 'lucide-react';
import { WeightChart } from '@/components/app/weight-chart';
import {
  type PatientStatus,
  PATIENT_STATUS_CONFIG,
  OBJETIVO_LABELS,
  COMORBIDADE_LABELS,
  formatWhatsapp,
  imcClass,
} from '@/lib/anamnese';

interface WeightLog {
  id: string;
  weightKg: string;
  measuredAt: string;
  source: string;
  notes: string | null;
}
interface PatientDetail {
  id: string;
  status: PatientStatus;
  startedAt: string;
  notes: string | null;
  user: { id: string; name: string; email: string; isActive: boolean };
  anamnese: {
    id: string;
    pesoKg: string;
    alturaCm: number;
    imc: string;
    idade: number;
    sexo: string;
    objetivos: string[];
    comorbidades: string[];
    whatsapp: string;
  } | null;
  weightLogs: WeightLog[];
}

export default function PatientDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery<PatientDetail>({
    queryKey: ['patient', id],
    queryFn: () => api(`/patients/${id}`),
  });

  if (isLoading) return <Centered text="Carregando…" />;
  if (error || !data) return <Centered text="Paciente não encontrado." />;

  const a = data.anamnese;
  const altura = a ? a.alturaCm / 100 : null;
  const pesoInicial = a ? parseFloat(a.pesoKg) : null;
  const logs = [...data.weightLogs].sort((x, y) => +new Date(x.measuredAt) - +new Date(y.measuredAt));
  const lastLog = logs[logs.length - 1];
  const pesoAtual = lastLog ? parseFloat(lastLog.weightKg) : pesoInicial;
  // Variação assinada: negativa = perdeu peso (bom). Evita ambiguidade do "perdido".
  const variacao = pesoInicial !== null && pesoAtual !== null ? pesoAtual - pesoInicial : null;
  const pctVariacao = variacao !== null && pesoInicial ? (variacao / pesoInicial) * 100 : null;
  const imcAtual = altura && pesoAtual ? pesoAtual / (altura * altura) : null;
  const signed = (n: number, unit: string) => `${n > 0 ? '+' : n < 0 ? '−' : ''}${Math.abs(n).toFixed(1)}${unit}`;

  // Pontos do gráfico: peso inicial (na anamnese) + cada pesagem registrada.
  const chartPoints = [
    ...(pesoInicial !== null ? [{ t: +new Date(data.startedAt), w: pesoInicial }] : []),
    ...logs.map((l) => ({ t: +new Date(l.measuredAt), w: parseFloat(l.weightKg) })),
  ].sort((x, y) => x.t - y.t);

  return (
    <div className="flex flex-col flex-1 gap-6">
      {/* Voltar + cabeçalho */}
      <div className="gl-in flex-shrink-0">
        <Link href="/clients" className="inline-flex items-center gap-1.5 text-xs font-medium mb-3 transition-opacity hover:opacity-70" style={{ color: 'var(--gl-ink-3)' }}>
          <ArrowLeft className="h-3.5 w-3.5" /> Clientes
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--gl-ink)' }}>{data.user.name}</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--gl-ink-3)' }}>
              {data.user.email}
              {a && <> · {formatWhatsapp(a.whatsapp)}</>}
              {' · '}Início em {format(new Date(data.startedAt), "d 'de' MMM yyyy", { locale: ptBR })}
            </p>
          </div>
          <StatusSelector id={id} current={data.status} />
        </div>
      </div>

      {/* Métricas de evolução */}
      <div className="gl-in grid gap-4 grid-cols-2 xl:grid-cols-4 flex-shrink-0" style={{ animationDelay: '60ms' }}>
        <Metric label="Peso inicial" value={pesoInicial !== null ? `${pesoInicial.toFixed(1)} kg` : '—'} icon={<Scale className="h-3.5 w-3.5" />} />
        <Metric label="Peso atual" value={pesoAtual !== null ? `${pesoAtual.toFixed(1)} kg` : '—'} icon={<Scale className="h-3.5 w-3.5" />} accent />
        <Metric
          label="Variação de peso"
          value={variacao !== null ? signed(variacao, ' kg') : '—'}
          sub={pctVariacao !== null ? `${signed(pctVariacao, '%')} do inicial` : undefined}
          icon={<TrendingDown className="h-3.5 w-3.5" />}
          accent
        />
        <Metric label="IMC atual" value={imcAtual !== null ? imcAtual.toFixed(1) : '—'} sub={imcAtual !== null ? imcClass(imcAtual) : undefined} icon={<Activity className="h-3.5 w-3.5" />} />
      </div>

      {/* Gráfico + coluna lateral */}
      <div className="gl-in grid gap-4 lg:grid-cols-3 flex-1 min-h-0" style={{ animationDelay: '120ms' }}>
        {/* Esquerda: gráfico + registrar pesagem */}
        <div className="lg:col-span-2 flex flex-col gap-4 min-h-0">
          <Card title="Evolução de peso">
            <div className="p-4">
              <WeightChart points={chartPoints} />
            </div>
          </Card>
          <WeighInForm patientId={id} onSaved={() => { void qc.invalidateQueries({ queryKey: ['patient', id] }); }} logs={logs} />
        </div>

        {/* Direita: dados clínicos + notas */}
        <div className="flex flex-col gap-4 min-h-0">
          {a && (
            <Card title="Perfil clínico">
              <div className="space-y-3 px-4 py-3">
                <Row label="Altura" value={`${a.alturaCm} cm`} />
                <Row label="Idade" value={`${a.idade} anos`} />
                <Row label="Objetivos" value={
                  <div className="flex flex-wrap gap-1 justify-end">
                    {a.objetivos.map((o) => <Tag key={o} label={OBJETIVO_LABELS[o] ?? o} />)}
                  </div>
                } />
                {a.comorbidades.filter((c) => c !== 'nenhuma').length > 0 && (
                  <Row label="Comorbidades" value={
                    <div className="flex flex-wrap gap-1 justify-end">
                      {a.comorbidades.filter((c) => c !== 'nenhuma').map((c) => <Tag key={c} label={COMORBIDADE_LABELS[c] ?? c} accent />)}
                    </div>
                  } />
                )}
              </div>
            </Card>
          )}
          <NotesCard id={id} initial={data.notes ?? ''} />
        </div>
      </div>

      <DietPlanEditor id={id} />
    </div>
  );
}

/* ── Plano alimentar (editor da equipe; o paciente lê na área dele) ──────── */
interface DietPlan {
  id: string;
  title: string;
  content: string;
  fileUrl: string | null;
  status: string;
  updatedAt: string;
}

function DietPlanEditor({ id }: { id: string }) {
  const qc = useQueryClient();
  const { data: plan } = useQuery<DietPlan | null>({
    queryKey: ['patient-diet', id],
    queryFn: () => api(`/patients/${id}/diet-plan`),
  });

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [fileUrl, setFileUrl] = useState('');

  useEffect(() => {
    if (plan) {
      setTitle(plan.title);
      setContent(plan.content);
      setFileUrl(plan.fileUrl ?? '');
    } else if (plan === null) {
      setTitle('Plano alimentar');
    }
  }, [plan]);

  const mutation = useMutation({
    mutationFn: () =>
      api(`/patients/${id}/diet-plan`, {
        method: 'PUT',
        body: JSON.stringify({
          title: title.trim() || 'Plano alimentar',
          content,
          fileUrl: fileUrl.trim() || null,
        }),
      }),
    onSuccess: () => {
      toast.success('Plano salvo — já visível para o paciente');
      void qc.invalidateQueries({ queryKey: ['patient-diet', id] });
    },
    onError: (e: Error) => toast.error(e.message || 'Erro ao salvar plano'),
  });

  return (
    <div className="gl-in flex-shrink-0" style={{ animationDelay: '160ms' }}>
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--gl-surface)', border: '1px solid var(--gl-line)' }}>
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--gl-line)' }}>
          <div className="flex items-center gap-2">
            <Salad className="h-4 w-4" style={{ color: 'var(--gl-primary)' }} />
            <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--gl-ink-2)' }}>
              Plano alimentar
            </h2>
          </div>
          <span className="text-xs" style={{ color: 'var(--gl-ink-3)' }}>
            {plan ? `Atualizado em ${format(new Date(plan.updatedAt), "d MMM", { locale: ptBR })}` : 'Ainda não criado'}
          </span>
        </div>
        <div className="p-4 space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título do plano"
            className="w-full rounded-lg px-3 py-2 text-sm font-medium outline-none"
            style={{ border: '1px solid var(--gl-line)', background: 'var(--gl-paper)', color: 'var(--gl-ink)' }}
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Escreva o plano (suporta markdown: ## título, - itens, > observação). O paciente lê este conteúdo na área dele."
            className="w-full resize-none rounded-lg p-3 text-sm outline-none min-h-48"
            style={{ border: '1px solid var(--gl-line)', background: 'var(--gl-paper)', color: 'var(--gl-ink)' }}
          />
          <input
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
            placeholder="Link de um PDF anexo (opcional)"
            className="w-full rounded-lg px-3 py-2 text-sm outline-none"
            style={{ border: '1px solid var(--gl-line)', background: 'var(--gl-paper)', color: 'var(--gl-ink)' }}
          />
          <div className="flex justify-end">
            <button
              onClick={() => {
                const link = fileUrl.trim();
                if (link && !/^https?:\/\//i.test(link)) {
                  toast.error('O link do PDF precisa começar com http(s)');
                  return;
                }
                mutation.mutate();
              }}
              disabled={mutation.isPending}
              className="rounded-lg px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: 'var(--gl-primary)', color: 'var(--gl-paper)' }}
            >
              {mutation.isPending ? 'Salvando…' : 'Salvar plano'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Registrar pesagem ──────────────────────────────────────────────────── */
function WeighInForm({ patientId, onSaved, logs }: { patientId: string; onSaved: () => void; logs: WeightLog[] }) {
  const [weight, setWeight] = useState('');

  const mutation = useMutation({
    mutationFn: (weightKg: number) =>
      api(`/patients/${patientId}/weight-logs`, { method: 'POST', body: JSON.stringify({ weightKg }) }),
    onSuccess: () => {
      setWeight('');
      toast.success('Pesagem registrada');
      onSaved();
    },
    onError: (e: Error) => toast.error(e.message || 'Erro ao registrar'),
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const n = parseFloat(weight.replace(',', '.'));
    if (!Number.isFinite(n) || n <= 0) {
      toast.error('Informe um peso válido');
      return;
    }
    mutation.mutate(n);
  }

  return (
    <Card title="Pesagens" className="flex-1 min-h-0 flex flex-col">
      <form onSubmit={submit} className="flex items-center gap-2 px-4 py-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--gl-line)' }}>
        <div className="relative flex-1">
          <input
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            inputMode="decimal"
            placeholder="Peso em kg"
            className="w-full rounded-lg px-3 py-2 text-sm outline-none"
            style={{ border: '1px solid var(--gl-line)', background: 'var(--gl-paper)', color: 'var(--gl-ink)' }}
          />
        </div>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-50 whitespace-nowrap"
          style={{ background: 'var(--gl-primary)', color: 'var(--gl-paper)' }}
        >
          <Plus className="h-4 w-4" /> Registrar
        </button>
      </form>
      <div className="flex-1 overflow-y-auto">
        {logs.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: 'var(--gl-ink-3)' }}>Nenhuma pesagem ainda</p>
        ) : (
          <ul className="divide-y" style={{ borderColor: 'var(--gl-line)' }}>
            {[...logs].reverse().map((l, i, arr) => {
              const prev = arr[i + 1];
              const delta = prev ? parseFloat(l.weightKg) - parseFloat(prev.weightKg) : 0;
              return (
                <li key={l.id} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-sm font-medium" style={{ color: 'var(--gl-ink)', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
                    {parseFloat(l.weightKg).toFixed(1)} kg
                  </span>
                  <div className="flex items-center gap-3">
                    {prev && delta !== 0 && (
                      <span className="text-xs font-medium" style={{ color: delta < 0 ? 'var(--gl-primary)' : 'var(--gl-accent-strong)' }}>
                        {delta < 0 ? '−' : '+'}{Math.abs(delta).toFixed(1)} kg
                      </span>
                    )}
                    <span className="text-xs" style={{ color: 'var(--gl-ink-3)' }}>
                      {format(new Date(l.measuredAt), "d MMM", { locale: ptBR })}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Card>
  );
}

/* ── Notas internas ─────────────────────────────────────────────────────── */
function NotesCard({ id, initial }: { id: string; initial: string }) {
  const [notes, setNotes] = useState(initial);
  const dirty = notes !== initial;

  const mutation = useMutation({
    mutationFn: () => api(`/patients/${id}`, { method: 'PATCH', body: JSON.stringify({ notes }) }),
    onSuccess: () => toast.success('Notas salvas'),
    onError: (e: Error) => toast.error(e.message || 'Erro ao salvar'),
  });

  return (
    <Card title="Notas internas" className="flex-1 min-h-0 flex flex-col">
      <div className="flex flex-col flex-1 p-4 gap-3 min-h-0">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Observações da equipe sobre este paciente…"
          className="flex-1 resize-none rounded-lg p-3 text-sm outline-none min-h-24"
          style={{ border: '1px solid var(--gl-line)', background: 'var(--gl-paper)', color: 'var(--gl-ink)' }}
        />
        <button
          onClick={() => mutation.mutate()}
          disabled={!dirty || mutation.isPending}
          className="self-end rounded-lg px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-40"
          style={{ background: 'var(--gl-primary)', color: 'var(--gl-paper)' }}
        >
          Salvar notas
        </button>
      </div>
    </Card>
  );
}

/* ── Seletor de status ──────────────────────────────────────────────────── */
function StatusSelector({ id, current }: { id: string; current: PatientStatus }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<PatientStatus>(current);
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: (s: PatientStatus) => api(`/patients/${id}`, { method: 'PATCH', body: JSON.stringify({ status: s }) }),
    onSuccess: (_d, s) => {
      setStatus(s);
      setOpen(false);
      void qc.invalidateQueries({ queryKey: ['patients'] });
      void qc.invalidateQueries({ queryKey: ['patient', id] });
    },
  });

  const cfg = PATIENT_STATUS_CONFIG[status];

  return (
    <div className="relative" style={{ zIndex: open ? 50 : 'auto' }}>
      <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium" style={{ background: cfg.bg, color: cfg.color }}>
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: cfg.dot }} />
        {cfg.label}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="gl-modal absolute right-0 top-full mt-1 z-50 w-40 rounded-xl shadow-lg overflow-hidden" style={{ background: 'var(--gl-surface)', border: '1px solid var(--gl-line)' }}>
            {(Object.entries(PATIENT_STATUS_CONFIG) as [PatientStatus, typeof cfg][]).map(([key, s]) => (
              <button key={key} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-left transition-colors"
                style={{ color: key === status ? s.color : 'var(--gl-ink)' }}
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
  );
}

/* ── Primitivos ─────────────────────────────────────────────────────────── */
function Card({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl overflow-hidden ${className ?? ''}`} style={{ background: 'var(--gl-surface)', border: '1px solid var(--gl-line)' }}>
      <div className="px-4 py-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--gl-line)' }}>
        <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--gl-ink-2)' }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Metric({ label, value, sub, icon, accent }: { label: string; value: string; sub?: string; icon: React.ReactNode; accent?: boolean }) {
  return (
    <div className="rounded-xl p-5 flex flex-col gap-4" style={{ background: 'var(--gl-surface)', border: '1px solid var(--gl-line)', borderTop: `3px solid ${accent ? 'var(--gl-accent)' : 'var(--gl-primary)'}` }}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--gl-ink-3)' }}>{label}</span>
        <div className="flex h-7 w-7 items-center justify-center rounded-md" style={{ background: accent ? 'var(--gl-accent-tint)' : 'var(--gl-support-tint)', color: accent ? 'var(--gl-accent-strong)' : 'var(--gl-primary)' }}>
          {icon}
        </div>
      </div>
      <div>
        <div className="text-3xl tracking-tight" style={{ color: 'var(--gl-ink)', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 500 }}>{value}</div>
        {sub && <p className="mt-1 text-xs" style={{ color: 'var(--gl-ink-3)' }}>{sub}</p>}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-xs flex-shrink-0" style={{ color: 'var(--gl-ink-3)' }}>{label}</span>
      <div className="text-sm font-medium text-right" style={{ color: 'var(--gl-ink)' }}>{value}</div>
    </div>
  );
}

function Tag({ label, accent }: { label: string; accent?: boolean }) {
  return (
    <span className="text-xs rounded-md px-2 py-0.5 font-medium" style={{ background: accent ? 'var(--gl-accent-tint)' : 'var(--gl-support-tint)', color: accent ? 'var(--gl-accent-strong)' : 'var(--gl-primary)' }}>{label}</span>
  );
}

function Centered({ text }: { text: string }) {
  return <div className="flex flex-1 items-center justify-center"><p className="text-sm" style={{ color: 'var(--gl-ink-3)' }}>{text}</p></div>;
}
