'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { UserRound, Lock, Stethoscope, LogOut } from 'lucide-react';
import {
  PageHeader,
  SectionCard,
  Field,
  CenteredMessage,
} from '@/components/client/primitives';
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

  if (isLoading) return <CenteredMessage>Carregando…</CenteredMessage>;
  if (error || !data) return <CenteredMessage>Não conseguimos carregar agora.</CenteredMessage>;

  const p = data.profile;
  const statusCfg = PATIENT_STATUS_CONFIG[p.status as PatientStatus];

  return (
    <>
      <PageHeader kicker="Minha conta" title="Seus dados" subtitle="Suas informações e o acesso à sua conta." />

      <div className="gl-in grid gap-5 lg:grid-cols-2">
        <SectionCard title="Perfil" icon={<UserRound className="h-4 w-4" />}>
          <dl className="space-y-3.5">
            <Row label="Nome" value={p.name} />
            <Row label="E-mail" value={p.email} />
            {p.sexo && <Row label="Sexo" value={SEX_LABELS[p.sexo] ?? p.sexo} />}
            {p.idade != null && <Row label="Idade" value={`${p.idade} anos`} />}
            {p.alturaCm != null && <Row label="Altura" value={`${p.alturaCm} cm`} />}
            <Row
              label="Início"
              value={format(new Date(p.startedAt), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
            />
            {statusCfg && (
              <Row
                label="Acompanhamento"
                value={
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{ background: statusCfg.bg, color: statusCfg.color }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: statusCfg.dot }} />
                    {statusCfg.label}
                  </span>
                }
              />
            )}
          </dl>

          {p.objetivos.length > 0 && (
            <div className="mt-4 border-t pt-4" style={{ borderColor: 'var(--gl-line)' }}>
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

          {p.doctor && (
            <div
              className="mt-4 flex items-center gap-3 rounded-xl px-4 py-3"
              style={{ background: 'var(--gl-support-tint)' }}
            >
              <Stethoscope className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--gl-primary)' }} />
              <div>
                <p className="text-xs" style={{ color: 'var(--gl-ink-3)' }}>
                  Quem acompanha você
                </p>
                <p className="text-sm font-semibold" style={{ color: 'var(--gl-ink)' }}>
                  {p.doctor.name}
                </p>
              </div>
            </div>
          )}
        </SectionCard>

        <ChangePasswordCard />
      </div>

      <button
        onClick={() => logout.mutate()}
        disabled={logout.isPending}
        className="gl-in flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ border: '1px solid var(--gl-line)', background: 'var(--gl-surface)', color: 'var(--gl-ink-2)' }}
      >
        <LogOut className="h-4 w-4" />
        Sair da conta
      </button>
    </>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-xs flex-shrink-0" style={{ color: 'var(--gl-ink-3)' }}>
        {label}
      </dt>
      <dd className="text-sm font-medium text-right" style={{ color: 'var(--gl-ink)' }}>
        {value}
      </dd>
    </div>
  );
}

function ChangePasswordCard() {
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
        },
      },
    );
  }

  return (
    <SectionCard title="Senha e acesso" icon={<Lock className="h-4 w-4" />}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Senha atual" htmlFor="current" error={errors.current}>
          <input
            id="current"
            type="password"
            autoComplete="current-password"
            className="gl-input"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
        </Field>
        <Field label="Nova senha" htmlFor="next" error={errors.next} hint="Ao menos 8 caracteres.">
          <input
            id="next"
            type="password"
            autoComplete="new-password"
            className="gl-input"
            value={next}
            onChange={(e) => setNext(e.target.value)}
          />
        </Field>
        <Field label="Confirme a nova senha" htmlFor="confirm" error={errors.confirm}>
          <input
            id="confirm"
            type="password"
            autoComplete="new-password"
            className="gl-input"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
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
    </SectionCard>
  );
}
