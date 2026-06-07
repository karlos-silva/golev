'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { resetPasswordSchema } from '@golev/shared';
import { useResetPassword } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

export default function RedefinirSenhaPage() {
  const reset = useResetPassword();
  // undefined = ainda lendo a URL; '' = sem token; string = token presente
  const [token, setToken] = useState<string | undefined>(undefined);
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get('token') ?? '');
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fieldErrors: Record<string, string> = {};
    if (next !== confirm) fieldErrors.confirm = 'As senhas não coincidem';
    const parsed = resetPasswordSchema.safeParse({
      token: token ?? '',
      newPassword: next,
    });
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        if (issue.path[0] === 'newPassword') fieldErrors.next = issue.message;
        if (issue.path[0] === 'token') fieldErrors.token = 'Link inválido';
      }
    }
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    reset.mutate({ token: token as string, newPassword: next });
  }

  if (token === undefined) {
    return (
      <div className="flex justify-center py-10">
        <Spinner className="h-5 w-5" />
      </div>
    );
  }

  if (token === '') {
    return (
      <div className="gl-in">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--gl-ink)' }}>
          Link inválido
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed" style={{ color: 'var(--gl-ink-2)' }}>
          Este link de senha está incompleto ou expirou. Peça um novo na tela de recuperação.
        </p>
        <Link
          href="/forgot-password"
          className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
          style={{ color: 'var(--gl-primary)' }}
        >
          Pedir um novo link
        </Link>
      </div>
    );
  }

  return (
    <div className="gl-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--gl-ink)' }}>
          Crie sua senha
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed" style={{ color: 'var(--gl-ink-2)' }}>
          Escolha uma senha só sua para acessar seu acompanhamento.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="next">Nova senha</Label>
          <Input
            id="next"
            type="password"
            autoComplete="new-password"
            autoFocus
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
          {errors.token && <p className="text-xs text-destructive">{errors.token}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={reset.isPending}>
          {reset.isPending ? <Spinner /> : null}
          Salvar e entrar
        </Button>
      </form>
    </div>
  );
}
