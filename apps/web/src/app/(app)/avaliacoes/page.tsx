'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  CheckCircle2, XCircle, Phone, Mail, Scale,
  X, User, Activity, ClipboardCheck, Target, ChevronDown, UserPlus, Copy, CreditCard,
} from 'lucide-react';
import {
  type LeadStatus,
  LEAD_STATUS_CONFIG,
  OBJETIVO_LABELS,
  COMORBIDADE_LABELS,
  CONTRAINDICACAO_LABELS,
  TENTATIVA_LABELS,
  MEDICACAO_LABELS,
  SEX_LABELS,
  REASON_LABELS,
  formatWhatsapp,
  imcClass,
} from '@/lib/anamnese';
import { Select } from '@/components/ui/select';
import { FilterBar, FilterSlot } from '@/components/ui/filter-bar';
import { toast } from 'sonner';
import { copyToClipboard } from '@/lib/clipboard';

interface Avaliacao {
  id: string;
  leadStatus: LeadStatus;
  nome: string;
  email: string;
  whatsapp: string;
  imc: string;
  eligible: boolean;
  idade: number;
  pesoKg: string;
  alturaCm: number;
  sexo: string;
  objetivos: string[];
  comorbidades: string[];
  contraindicacoes: string[];
  tentativas: string;
  tratamentoPrevio: string;
  medicacoes: string[];
  gravidaOuAmamentando: boolean | null;
  reasons: string[];
  consentAt: string;
  checkoutStartedAt: string | null;
  createdAt: string;
}

/* ── Status Dropdown ─────────────────────────────────────────────────── */
function StatusDropdown({ id, current, onUpdated }: {
  id: string;
  current: LeadStatus;
  onUpdated: (next: LeadStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: (status: LeadStatus) =>
      api(`/anamnese/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    onSuccess: (_data, status) => {
      qc.setQueryData<Avaliacao[]>(['avaliacoes'], (old) =>
        old?.map(a => a.id === id ? { ...a, leadStatus: status } : a) ?? old
      );
      onUpdated(status);
      setOpen(false);
    },
  });

  const cfg = LEAD_STATUS_CONFIG[current];

  return (
    <div className="relative" style={{ zIndex: open ? 50 : 'auto' }} onClick={e => e.stopPropagation()}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-opacity hover:opacity-80 whitespace-nowrap"
        style={{ background: cfg.bg, color: cfg.color }}
        disabled={mutation.isPending}
      >
        <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
        {cfg.label}
        <ChevronDown className="h-3 w-3 opacity-60" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="gl-modal absolute right-0 top-full mt-1 z-50 w-44 rounded-xl shadow-lg overflow-hidden"
            style={{ background: 'var(--gl-surface)', border: '1px solid var(--gl-line)' }}
          >
            {(Object.entries(LEAD_STATUS_CONFIG) as [LeadStatus, typeof cfg][])
              .filter(([key, s]) => !s.terminal || key === current)
              .map(([key, s]) => (
              <button
                key={key}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-left transition-colors"
                style={{ color: key === current ? s.color : 'var(--gl-ink)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--gl-support-tint)')}
                onMouseLeave={e => (e.currentTarget.style.background = '')}
                onClick={() => !s.terminal && mutation.mutate(key)}
                disabled={mutation.isPending || !!s.terminal}
              >
                <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: s.dot }} />
                {s.label}
                {key === current && <span className="ml-auto text-[10px] opacity-50">atual</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Modal ────────────────────────────────────────────────────────────── */
function AvaliacaoModal({ a, onClose }: { a: Avaliacao; onClose: () => void }) {
  const [leadStatus, setLeadStatus] = useState<LeadStatus>(a.leadStatus);
  const [convertResult, setConvertResult] = useState<{ email: string; tempPassword: string | null; isNewAccount: boolean } | null>(null);
  const qc = useQueryClient();

  const convertMutation = useMutation({
    mutationFn: () =>
      api<{ email: string; tempPassword: string | null; isNewAccount: boolean }>(
        '/patients/convert',
        { method: 'POST', body: JSON.stringify({ anamneseId: a.id }) },
      ),
    onSuccess: (data) => {
      setConvertResult(data);
      setLeadStatus('convertido');
      qc.setQueryData<Avaliacao[]>(['avaliacoes'], (old) =>
        old?.map(av => av.id === a.id ? { ...av, leadStatus: 'convertido' } : av) ?? old,
      );
      void qc.invalidateQueries({ queryKey: ['patients'] });
    },
  });

  // Recuperação de checkout: gera um link de pagamento (mesmo endpoint do funil,
  // a partir do anamneseId existente) para a equipe enviar no WhatsApp.
  const [payUrl, setPayUrl] = useState<string | null>(null);
  const payLinkMutation = useMutation({
    mutationFn: () =>
      api<{ url: string }>('/billing/checkout', {
        method: 'POST',
        body: JSON.stringify({ anamneseId: a.id }),
      }),
    onSuccess: ({ url }) => setPayUrl(url),
  });

  const comorbidades = a.comorbidades.filter(c => c !== 'nenhuma');
  const contraindicacoes = a.contraindicacoes.filter(c => c !== 'nenhuma');
  const imc = parseFloat(a.imc);

  // ESC fecha o modal + trava o scroll do body enquanto aberto.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      className="gl-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(30,36,38,0.55)', backdropFilter: 'blur(2px)' }}
      onClick={onClose}
    >
      <div
        className="gl-modal relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
        style={{ background: 'var(--gl-paper)', border: '1px solid var(--gl-line)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Topo */}
        <div
          className="sticky top-0 flex items-start justify-between px-6 pt-5 pb-4 z-10"
          style={{ background: 'var(--gl-paper)', borderBottom: '1px solid var(--gl-line)' }}
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: 'var(--gl-ink-3)' }}>
              Ficha de Avaliação
            </p>
            <h2 className="text-xl font-bold" style={{ color: 'var(--gl-ink)' }}>{a.nome}</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--gl-ink-3)' }}>
              Submetida em {format(new Date(a.createdAt), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span
              className="flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1.5"
              style={a.eligible
                ? { background: 'var(--gl-support-tint)', color: 'var(--gl-primary)' }
                : { background: 'var(--gl-line)', color: 'var(--gl-ink-3)' }}
            >
              {a.eligible
                ? <><CheckCircle2 className="h-3.5 w-3.5" /> Elegível</>
                : <><XCircle className="h-3.5 w-3.5" /> Inelegível</>}
            </span>
            {a.eligible && (
              <StatusDropdown id={a.id} current={leadStatus} onUpdated={setLeadStatus} />
            )}
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors"
              style={{ color: 'var(--gl-ink-3)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--gl-line)')}
              onMouseLeave={e => (e.currentTarget.style.background = '')}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Contato */}
          <Section icon={<User className="h-4 w-4" />} title="Contato">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Email" value={
                <a href={`mailto:${a.email}`} className="hover:underline" style={{ color: 'var(--gl-primary)' }}>{a.email}</a>
              } />
              <Field label="WhatsApp" value={
                <a href={`https://wa.me/55${a.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="hover:underline" style={{ color: 'var(--gl-primary)' }}>
                  {formatWhatsapp(a.whatsapp)}
                </a>
              } />
              <Field label="Idade" value={`${a.idade} anos`} />
              <Field label="Sexo" value={SEX_LABELS[a.sexo] ?? a.sexo} />
            </div>
          </Section>

          {/* Indicadores clínicos */}
          <Section icon={<Activity className="h-4 w-4" />} title="Indicadores Clínicos">
            <div className="grid grid-cols-3 gap-3">
              <MetricCard label="IMC" value={imc.toFixed(1)} sub={imcClass(imc)} accent={imc >= 25} />
              <MetricCard label="Peso" value={`${parseFloat(a.pesoKg).toFixed(1)} kg`} />
              <MetricCard label="Altura" value={`${a.alturaCm} cm`} />
            </div>
          </Section>

          {/* Histórico */}
          <Section icon={<ClipboardCheck className="h-4 w-4" />} title="Histórico Clínico">
            <div className="space-y-3">
              <Field label="Tentativas de emagrecimento" value={TENTATIVA_LABELS[a.tentativas] ?? a.tentativas} />
              <Field label="Tratamento medicamentoso prévio" value={a.tratamentoPrevio === 'sim' ? 'Sim' : 'Não'} />
              {a.tratamentoPrevio === 'sim' && a.medicacoes.length > 0 && (
                <Field label="Medicações anteriores" value={
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {a.medicacoes.map(m => <Tag key={m} label={MEDICACAO_LABELS[m] ?? m} />)}
                  </div>
                } />
              )}
              <Field label="Comorbidades" value={
                comorbidades.length > 0
                  ? <div className="flex flex-wrap gap-1 mt-0.5">{comorbidades.map(c => <Tag key={c} label={COMORBIDADE_LABELS[c] ?? c} accent />)}</div>
                  : 'Nenhuma'
              } />
              {contraindicacoes.length > 0 && (
                <Field label="Contraindicações" value={
                  <div className="flex flex-wrap gap-1 mt-0.5">{contraindicacoes.map(c => <Tag key={c} label={CONTRAINDICACAO_LABELS[c] ?? c} warning />)}</div>
                } />
              )}
              {a.sexo === 'feminino' && a.gravidaOuAmamentando !== null && (
                <Field label="Grávida ou amamentando" value={a.gravidaOuAmamentando ? 'Sim' : 'Não'} />
              )}
            </div>
          </Section>

          {/* Objetivos */}
          <Section icon={<Target className="h-4 w-4" />} title="Objetivos">
            <div className="flex flex-wrap gap-1.5">
              {a.objetivos.map(o => <Tag key={o} label={OBJETIVO_LABELS[o] ?? o} />)}
            </div>
          </Section>

          {/* Converter para paciente */}
          {a.eligible && leadStatus === 'aprovado' && !convertResult && (
            <div className="rounded-xl p-4 flex items-center justify-between"
              style={{ background: 'var(--gl-accent-tint)', border: '1px solid var(--gl-accent)' }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--gl-accent-strong)' }}>
                  Pronto para iniciar tratamento
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--gl-ink-2)' }}>
                  Cria a conta do paciente e move para a aba Clientes.
                </p>
              </div>
              <button
                onClick={() => convertMutation.mutate()}
                disabled={convertMutation.isPending}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-50 whitespace-nowrap ml-4"
                style={{ background: 'var(--gl-primary-strong)', color: 'var(--gl-paper)' }}
              >
                <UserPlus className="h-4 w-4" />
                {convertMutation.isPending ? 'Convertendo…' : 'Converter para paciente'}
              </button>
            </div>
          )}

          {/* Resultado da conversão */}
          {convertResult && (
            <div className="rounded-xl p-4 space-y-3"
              style={{ background: 'var(--gl-support-tint)', border: '1px solid var(--gl-line)' }}>
              <p className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--gl-primary)' }}>
                <CheckCircle2 className="h-4 w-4" /> Paciente criado com sucesso
              </p>
              {convertResult.isNewAccount && convertResult.tempPassword && (
                <div className="rounded-lg p-3 space-y-1" style={{ background: 'var(--gl-surface)', border: '1px solid var(--gl-line)' }}>
                  <p className="text-xs font-medium" style={{ color: 'var(--gl-ink-2)' }}>
                    Credenciais para enviar ao paciente:
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono" style={{ color: 'var(--gl-ink)' }}>
                      {convertResult.email} / {convertResult.tempPassword}
                    </span>
                    <button
                      onClick={() => {
                        void copyToClipboard(`Login: ${convertResult.email}\nSenha temporária: ${convertResult.tempPassword}`).then((ok) =>
                          ok ? toast.success('Copiado!') : toast.error('Não foi possível copiar.'),
                        );
                      }}
                      className="flex items-center gap-1 text-xs rounded px-2 py-1 transition-colors"
                      style={{ color: 'var(--gl-primary)' }}
                    >
                      <Copy className="h-3 w-3" /> Copiar
                    </button>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--gl-ink-3)' }}>
                    Peça ao paciente para alterar a senha no primeiro acesso.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Gerar link de pagamento (recuperação de checkout abandonado) */}
          {a.eligible && leadStatus !== 'convertido' && leadStatus !== 'descartado' && (
            <div className="rounded-xl p-4 space-y-3"
              style={{ background: 'var(--gl-support-tint)', border: '1px solid var(--gl-line)' }}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--gl-primary)' }}>
                    Link de pagamento
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--gl-ink-2)' }}>
                    {a.checkoutStartedAt
                      ? 'Já chegou ao pagamento e não concluiu — bom alvo para recuperar no WhatsApp.'
                      : 'Gere o link de cobrança e mande no WhatsApp — ele paga sem preencher de novo.'}
                  </p>
                </div>
                <button
                  onClick={() => payLinkMutation.mutate()}
                  disabled={payLinkMutation.isPending}
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-50 whitespace-nowrap ml-4"
                  style={{ background: 'var(--gl-primary)', color: 'var(--gl-paper)' }}
                >
                  <CreditCard className="h-4 w-4" />
                  {payLinkMutation.isPending ? 'Gerando…' : 'Gerar link de pagamento'}
                </button>
              </div>
              {payLinkMutation.isError && (
                <p className="text-xs" style={{ color: 'var(--color-destructive)' }}>
                  {payLinkMutation.error?.message ?? 'Não foi possível gerar o link.'}
                </p>
              )}
              {payUrl && (
                <div className="rounded-lg p-3 flex items-center justify-between gap-2"
                  style={{ background: 'var(--gl-surface)', border: '1px solid var(--gl-line)' }}>
                  <span className="text-xs font-mono truncate" style={{ color: 'var(--gl-ink)' }}>{payUrl}</span>
                  <button
                    onClick={() => {
                      void copyToClipboard(payUrl).then((ok) =>
                        ok ? toast.success('Link copiado!') : toast.error('Selecione e copie manualmente.'),
                      );
                    }}
                    className="flex items-center gap-1 text-xs rounded px-2 py-1 flex-shrink-0 transition-colors"
                    style={{ color: 'var(--gl-primary)' }}
                  >
                    <Copy className="h-3 w-3" /> Copiar link
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Motivo inelegibilidade */}
          {!a.eligible && a.reasons.length > 0 && (
            <div
              className="rounded-xl p-4"
              style={{ background: '#F2E1DD', border: '1px solid var(--gl-line)' }}
            >
              <p className="text-xs font-semibold mb-1" style={{ color: '#BC4B3C' }}>
                Motivo da inelegibilidade
              </p>
              {a.reasons.map(r => (
                <p key={r} className="text-sm" style={{ color: 'var(--gl-ink-2)' }}>
                  {REASON_LABELS[r] ?? r}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Sub-componentes ────────────────────────────────────────────────────── */
function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--gl-surface)', border: '1px solid var(--gl-line)' }}>
      <div className="flex items-center gap-2 mb-3">
        <span style={{ color: 'var(--gl-primary)' }}>{icon}</span>
        <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--gl-ink-2)' }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs mb-0.5" style={{ color: 'var(--gl-ink-3)' }}>{label}</p>
      <div className="text-sm font-medium" style={{ color: 'var(--gl-ink)' }}>{value}</div>
    </div>
  );
}

function MetricCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className="rounded-lg p-3 text-center" style={{
      background: accent ? 'var(--gl-support-tint)' : 'var(--gl-paper)',
      border: '1px solid var(--gl-line)',
    }}>
      <p className="text-xs mb-1" style={{ color: 'var(--gl-ink-3)' }}>{label}</p>
      <p className="text-xl font-bold" style={{
        color: accent ? 'var(--gl-primary)' : 'var(--gl-ink)',
        fontFamily: 'var(--font-serif)',
        fontStyle: 'italic',
      }}>{value}</p>
      {sub && <p className="text-xs mt-0.5" style={{ color: 'var(--gl-ink-3)' }}>{sub}</p>}
    </div>
  );
}

function Tag({ label, accent, warning }: { label: string; accent?: boolean; warning?: boolean }) {
  return (
    <span className="text-xs rounded-md px-2 py-1 font-medium" style={{
      background: warning ? '#F2E1DD' : accent ? 'var(--gl-accent-tint)' : 'var(--gl-support-tint)',
      color: warning ? '#BC4B3C' : accent ? 'var(--gl-accent-strong)' : 'var(--gl-primary)',
    }}>
      {label}
    </span>
  );
}

/* ── Página principal ────────────────────────────────────────────────────── */
export default function AvaliacoesPage() {
  const [selected, setSelected] = useState<Avaliacao | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [eligFilter, setEligFilter] = useState('');

  const { data, isLoading, error } = useQuery<Avaliacao[]>({
    queryKey: ['avaliacoes'],
    queryFn: () => api('/anamnese'),
  });

  const elegíveis = data?.filter(a => a.eligible).length ?? 0;
  const total = data?.length ?? 0;

  const q = search.trim().toLowerCase();
  const filtered = (data ?? []).filter((a) => {
    if (q && !a.nome.toLowerCase().includes(q) && !a.email.toLowerCase().includes(q)) return false;
    if (statusFilter && a.leadStatus !== statusFilter) return false;
    if (eligFilter === 'elegivel' && !a.eligible) return false;
    if (eligFilter === 'inelegivel' && a.eligible) return false;
    return true;
  });
  const hasFilters = Boolean(q || statusFilter || eligFilter);

  const statusOptions = [
    { value: '', label: 'Todos os status' },
    ...(Object.entries(LEAD_STATUS_CONFIG) as [LeadStatus, { label: string }][]).map(([k, v]) => ({ value: k, label: v.label })),
  ];

  return (
    <>
      {selected && <AvaliacaoModal a={selected} onClose={() => setSelected(null)} />}

      <div className="flex flex-col flex-1 gap-6">
        {/* Cabeçalho */}
        <div className="gl-in flex items-end justify-between flex-shrink-0">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest mb-1" style={{ color: 'var(--gl-ink-3)' }}>Pré-anamnese</p>
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--gl-ink)' }}>Avaliações</h1>
          </div>
          {!isLoading && (
            <div className="flex items-center gap-3">
              <Pill label={`${elegíveis} elegíveis`} color="var(--gl-primary)" bg="var(--gl-support-tint)" />
              <Pill label={`${total - elegíveis} inelegíveis`} color="var(--gl-ink-2)" bg="var(--gl-line)" />
            </div>
          )}
        </div>

        {/* Filtros */}
        <FilterBar search={search} onSearch={setSearch} searchPlaceholder="Buscar por nome ou email…">
          <FilterSlot>
            <Select value={statusFilter} onChange={setStatusFilter} options={statusOptions} placeholder="Todos os status" />
          </FilterSlot>
          <FilterSlot className="w-full sm:w-44">
            <Select value={eligFilter} onChange={setEligFilter} placeholder="Elegibilidade"
              options={[{ value: '', label: 'Todas' }, { value: 'elegivel', label: 'Elegíveis' }, { value: 'inelegivel', label: 'Inelegíveis' }]} />
          </FilterSlot>
        </FilterBar>

        {/* Tabela */}
        <div className="gl-in rounded-xl flex-1 min-h-0 overflow-hidden flex flex-col"
          style={{ background: 'var(--gl-surface)', border: '1px solid var(--gl-line)', animationDelay: '80ms' }}>

          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-3 text-xs font-semibold uppercase tracking-wider flex-shrink-0"
            style={{ borderBottom: '1px solid var(--gl-line)', color: 'var(--gl-ink-3)' }}>
            <span>Paciente</span>
            <span className="w-20 text-center">IMC</span>
            <span className="w-32">WhatsApp</span>
            <span className="w-28">Data</span>
            <span className="w-36 text-right">Pipeline</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y" style={{ borderColor: 'var(--gl-line)' }}>
            {isLoading && (
              <div className="flex items-center justify-center py-16">
                <p className="text-sm" style={{ color: 'var(--gl-ink-3)' }}>Carregando…</p>
              </div>
            )}
            {error && (
              <div className="flex items-center justify-center py-16">
                <p className="text-sm text-destructive">Erro ao carregar avaliações.</p>
              </div>
            )}
            {filtered.map((a, i) => (
              <div key={a.id}
                className="gl-in grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-3.5 items-center cursor-pointer transition-colors"
                style={{ animationDelay: `${Math.min(i, 12) * 35}ms` }}
                onClick={() => setSelected(a)}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--gl-support-tint)')}
                onMouseLeave={e => (e.currentTarget.style.background = '')}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--gl-ink)' }}>{a.nome}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--gl-ink-3)' }}>
                      <Mail className="h-3 w-3" />{a.email}
                    </span>
                    {a.comorbidades.filter(c => c !== 'nenhuma').length > 0 && (
                      <span className="flex gap-1">
                        {a.comorbidades.filter(c => c !== 'nenhuma').map(c => (
                          <span key={c} className="text-xs rounded px-1.5 py-0.5"
                            style={{ background: 'var(--gl-accent-tint)', color: 'var(--gl-accent-strong)' }}>
                            {COMORBIDADE_LABELS[c] ?? c}
                          </span>
                        ))}
                      </span>
                    )}
                  </div>
                </div>

                <div className="w-20 text-center">
                  <span className="inline-flex items-center gap-1 text-sm font-semibold rounded-lg px-2 py-1"
                    style={{
                      background: parseFloat(a.imc) >= 25 ? 'var(--gl-support-tint)' : 'var(--gl-line)',
                      color: parseFloat(a.imc) >= 25 ? 'var(--gl-primary)' : 'var(--gl-ink-3)',
                    }}>
                    <Scale className="h-3 w-3" />{parseFloat(a.imc).toFixed(1)}
                  </span>
                </div>

                <div className="w-32">
                  <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--gl-ink-2)' }}>
                    <Phone className="h-3 w-3 flex-shrink-0" />{formatWhatsapp(a.whatsapp)}
                  </span>
                </div>

                <div className="w-28">
                  <span className="text-xs" style={{ color: 'var(--gl-ink-3)' }}>
                    {format(new Date(a.createdAt), "d 'de' MMM", { locale: ptBR })}
                  </span>
                </div>

                <div className="w-36 flex justify-end">
                  {a.eligible
                    ? <StatusDropdown id={a.id} current={a.leadStatus} onUpdated={() => {}} />
                    : <span className="flex items-center gap-1 text-xs font-medium rounded-full px-2.5 py-1"
                        style={{ background: 'var(--gl-line)', color: 'var(--gl-ink-3)' }}>
                        <XCircle className="h-3 w-3" /> Inelegível
                      </span>
                  }
                </div>
              </div>
            ))}
            {!isLoading && !error && filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <p className="text-sm" style={{ color: 'var(--gl-ink-3)' }}>
                  {hasFilters ? 'Nenhuma avaliação para os filtros.' : 'Nenhuma avaliação ainda.'}
                </p>
                {hasFilters && (
                  <button
                    onClick={() => { setSearch(''); setStatusFilter(''); setEligFilter(''); }}
                    className="text-xs font-medium"
                    style={{ color: 'var(--gl-primary)' }}
                  >
                    Limpar filtros
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function Pill({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span className="text-xs font-medium rounded-full px-3 py-1.5" style={{ background: bg, color }}>{label}</span>
  );
}
