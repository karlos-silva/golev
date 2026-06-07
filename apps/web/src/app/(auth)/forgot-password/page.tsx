'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MailCheck } from 'lucide-react';
import { forgotPasswordSchema } from '@golev/shared';
import { useForgotPassword } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

export default function ForgotPasswordPage() {
  const forgot = useForgotPassword();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const formData = new FormData(e.currentTarget);
    const result = forgotPasswordSchema.safeParse({
      email: formData.get('email'),
    });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'E-mail inválido');
      return;
    }
    forgot.mutate(result.data, { onSuccess: () => setSent(true) });
  }

  if (sent) {
    return (
      <div className="gl-in">
        <div
          className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl"
          style={{ background: 'var(--gl-support-tint)', color: 'var(--gl-primary)' }}
        >
          <MailCheck className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--gl-ink)' }}>
          Confira seu e-mail
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed" style={{ color: 'var(--gl-ink-2)' }}>
          Se houver uma conta com esse e-mail, enviamos um link para você criar uma nova senha. Pode levar alguns minutinhos para chegar.
        </p>
        <Link
          href="/login"
          className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
          style={{ color: 'var(--gl-primary)' }}
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar para entrar
        </Link>
      </div>
    );
  }

  return (
    <div className="gl-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--gl-ink)' }}>
          Esqueceu a senha?
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed" style={{ color: 'var(--gl-ink-2)' }}>
          Sem problema. Informe seu e-mail e a gente envia um link para você criar uma nova.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="seu@email.com"
            autoComplete="email"
            autoFocus
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={forgot.isPending}>
          {forgot.isPending ? <Spinner /> : null}
          Enviar link
        </Button>

        <Link
          href="/login"
          className="flex items-center justify-center gap-1.5 text-sm transition-colors"
          style={{ color: 'var(--gl-ink-3)' }}
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar para entrar
        </Link>
      </form>
    </div>
  );
}
