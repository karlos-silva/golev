'use client';

import { useState } from 'react';
import { changePasswordSchema } from '@golev/shared';
import { useChangePassword } from '@/hooks/use-auth';
import { useAuth } from '@/stores/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

export default function DefinirSenhaPage() {
  const change = useChangePassword('/inicio');
  const user = useAuth((s) => s.user);
  const firstName = user?.name?.split(' ')[0];
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fieldErrors: Record<string, string> = {};
    if (next !== confirm) fieldErrors.confirm = 'As senhas não coincidem';
    const parsed = changePasswordSchema.safeParse({
      currentPassword: current,
      newPassword: next,
    });
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
    change.mutate({ currentPassword: current, newPassword: next });
  }

  return (
    <div className="gl-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--gl-ink)' }}>
          {firstName ? `Bem-vindo(a), ${firstName}` : 'Quase lá'}
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed" style={{ color: 'var(--gl-ink-2)' }}>
          Para sua segurança, crie uma senha só sua. Use a senha temporária que você recebeu para confirmar.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="current">Senha temporária</Label>
          <Input
            id="current"
            type="password"
            autoComplete="current-password"
            autoFocus
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            placeholder="A senha que você recebeu"
          />
          {errors.current && <p className="text-xs text-destructive">{errors.current}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="next">Nova senha</Label>
          <Input
            id="next"
            type="password"
            autoComplete="new-password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            placeholder="Ao menos 8 caracteres"
          />
          {errors.next && <p className="text-xs text-destructive">{errors.next}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirm">Confirme a nova senha</Label>
          <Input
            id="confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repita a nova senha"
          />
          {errors.confirm && <p className="text-xs text-destructive">{errors.confirm}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={change.isPending}>
          {change.isPending ? <Spinner /> : null}
          Criar minha senha
        </Button>
      </form>
    </div>
  );
}
