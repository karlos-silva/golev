'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Lock, Stethoscope, LogOut, ChevronRight, ShieldCheck } from 'lucide-react';
import {
  SectionCard,
  Field,
  Modal,
  StatusPill,
  CenteredMessage,
} from '@/components/client/primitives';
import { AccountAvatar } from '@/components/client/account-avatar';
import { useMeOverview } from '@/hooks/use-me';
import { useChangePassword, useLogout } from '@/hooks/use-auth';
import { changePasswordSchema } from '@golev/shared';
import {
  OBJETIVO_LABELS,
  SEX_LABELS,
  PATIENT_STATUS_CONFIG,
  type PatientStatus,
} from '@/lib/anamnese';

export default function ContaPage() {
  const { data, isLoading, error } = useMeOverview();
  const logout = useLogout();
  const [pwOpen, setPwOpen] = useState(false);

  if (isLoading) return <CenteredMessage>Carregando…</CenteredMessage>;
  if (error || !data) return <CenteredMessage>Não conseguimos carregar agora.</CenteredMessage>;

  const p = data.profile;
  const statusCfg = PATIENT_STATUS_CONFIG[p.status as PatientStatus];

  return (
    <div className="mx-auto w-full max-w-xl space-y-5">
      {/* Cabeçalho de perfil */}
      <div className="gl-in flex flex-col items-center gap-3 pt-1 text-center">
        <AccountAvatar name={p.name} avatarUrl={p.avatarUrl} />
        <div>
          <h1 className="text-2xl" style={{ fontFamily: 'var(--font-serif)', color: 'var(--gl-ink)' }}>
            {p.name}
          </h1>
          <p className="mt-0.5 text-sm" style={{ color: 'var(--gl-ink-3)' }}>
            {p.email}
          </p>
        </div>
        {statusCfg && (
          <StatusPill
            label={`${statusCfg.label} · ${data.journey.daysInProgram} dias`}
            bg={statusCfg.bg}
            color={statusCfg.color}
            dot={statusCfg.dot}
          />
        )}
      </div>

      {/* Seus dados */}
      <div className="gl-in" style={{ animationDelay: '40ms' }}>
        <SectionCard title="Seus dados" bodyClassName="p-0">
          <dl>
            {p.sexo && <DataRow label="Sexo" value={SEX_LABELS[p.sexo] ?? p.sexo} />}
            {p.idade != null && <DataRow label="Idade" value={`${p.idade} anos`} />}
            {p.alturaCm != null && <DataRow label="Altura" value={`${p.alturaCm} cm`} />}
            <DataRow
              label="Início"
              value={format(new Date(p.startedAt), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              last={p.objetivos.length === 0}
            />
          </dl>

          {p.objetivos.length > 0 && (
            <div className="px-5 py-4" style={{ borderTop: '1px solid var(--gl-line)' }}>
              <p className="mb-2 text-xs" style={{ color: 'var(--gl-ink-3)' }}>
                Seus objetivos
              </p>
              <div className="flex flex-wrap gap-1.5">
                {p.objetivos.map((o) => (
                  <span
                    key={o}
                    className="rounded-md px-2 py-0.5 text-xs font-medium"
                    style={{ background: 'var(--gl-support-tint)', color: 'var(--gl-primary)' }}
                  >
                    {OBJETIVO_LABELS[o] ?? o}
                  </span>
                ))}
              </div>
            </div>
          )}
        </SectionCard>
      </div>

      {/* Quem cuida de você */}
      {p.doctor && (
        <div
          className="gl-in flex items-center gap-3 rounded-2xl px-5 py-4"
          style={{ background: 'var(--gl-support-tint)', animationDelay: '70ms' }}
        >
          <Stethoscope className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--gl-primary)' }} />
          <div>
            <p className="text-xs" style={{ color: 'var(--gl-ink-3)' }}>
              Quem cuida de você
            </p>
            <p className="text-sm font-semibold" style={{ color: 'var(--gl-ink)' }}>
              {p.doctor.name}
            </p>
          </div>
        </div>
      )}

      {/* Senha e acesso — escondido atrás de um toque */}
      <div className="gl-in" style={{ animationDelay: '100ms' }}>
        <SectionCard title="Acesso" bodyClassName="p-0">
          <button
            onClick={() => setPwOpen(true)}
            className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-[var(--gl-support-tint)]"
          >
            <span
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px]"
              style={{ background: 'var(--gl-support-tint)', color: 'var(--gl-primary)' }}
            >
              <Lock className="h-[18px] w-[18px]" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm" style={{ color: 'var(--gl-ink)' }}>
                Senha e acesso
              </span>
              <span className="mt-0.5 block text-xs" style={{ color: 'var(--gl-ink-3)' }}>
                Altere sua senha quando quiser
              </span>
            </span>
            <ChevronRight className="h-[18px] w-[18px] flex-shrink-0" style={{ color: 'var(--gl-ink-3)' }} />
          </button>
        </SectionCard>
      </div>

      {/* Sair */}
      <button
        onClick={() => logout.mutate()}
        disabled={logout.isPending}
        className="gl-in flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ border: '1px solid var(--gl-line)', background: 'var(--gl-surface)', color: 'var(--gl-ink-2)', animationDelay: '130ms' }}
      >
        <LogOut className="h-4 w-4" />
        Sair da conta
      </button>

      <Modal open={pwOpen} onClose={() => setPwOpen(false)} title="Senha e acesso">
        <ChangePasswordForm onDone={() => setPwOpen(false)} />
      </Modal>
    </div>
  );
}

function DataRow({ label, value, last }: { label: string; value: React.ReactNode; last?: boolean }) {
  return (
    <div
      className="flex items-center justify-between gap-3 px-5 py-3.5"
      style={last ? undefined : { borderBottom: '1px solid var(--gl-line)' }}
    >
      <dt className="flex-shrink-0 text-xs" style={{ color: 'var(--gl-ink-3)' }}>
        {label}
      </dt>
      <dd className="text-right text-sm font-medium" style={{ color: 'var(--gl-ink)' }}>
        {value}
      </dd>
    </div>
  );
}

function ChangePasswordForm({ onDone }: { onDone: () => void }) {
  const change = useChangePassword();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const fieldErrors: Record<string, string> = {};
    if (next !== confirm) fieldErrors.confirm = 'As senhas não coincidem';
    const parsed = changePasswordSchema.safeParse({ currentPassword: current, newPassword: next });
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (field === 'newPassword') fieldErrors.next = issue.message;
        if (field === 'currentPassword') fieldErrors.current = issue.message;
      }
    }
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    change.mutate(
      { currentPassword: current, newPassword: next },
      {
        onSuccess: () => {
          setCurrent('');
          setNext('');
          setConfirm('');
          onDone();
        },
      },
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex items-start gap-2 text-xs" style={{ color: 'var(--gl-ink-3)' }}>
        <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: 'var(--gl-primary)' }} />
        Por segurança, você precisa da senha atual para definir uma nova.
      </div>
      <Field label="Senha atual" htmlFor="current" error={errors.current}>
        <input id="current" type="password" autoComplete="current-password" className="gl-input" value={current} onChange={(e) => setCurrent(e.target.value)} />
      </Field>
      <Field label="Nova senha" htmlFor="next" error={errors.next} hint="Ao menos 8 caracteres.">
        <input id="next" type="password" autoComplete="new-password" className="gl-input" value={next} onChange={(e) => setNext(e.target.value)} />
      </Field>
      <Field label="Confirme a nova senha" htmlFor="confirm" error={errors.confirm}>
        <input id="confirm" type="password" autoComplete="new-password" className="gl-input" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      </Field>
      <button
        type="submit"
        disabled={change.isPending}
        className="w-full rounded-lg px-4 py-3 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ background: 'var(--gl-primary)', color: 'var(--gl-paper)' }}
      >
        {change.isPending ? 'Salvando…' : 'Atualizar senha'}
      </button>
    </form>
  );
}
