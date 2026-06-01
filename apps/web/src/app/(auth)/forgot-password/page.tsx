'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

export default function ForgotPasswordPage() {
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
      setError(result.error.issues[0]?.message ?? 'Email inválido');
      return;
    }

    setSent(true);
    toast.success('Email de recuperação enviado!');
  }

  if (sent) {
    return (
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <span className="text-xl">✉️</span>
          </div>
          <CardTitle className="text-2xl">Email enviado</CardTitle>
          <CardDescription>
            Se o email estiver cadastrado, você receberá um link para redefinir sua senha.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Link href="/login" className="w-full">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para login
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Recuperar senha</CardTitle>
        <CardDescription>
          Informe seu email e enviaremos um link para redefinir sua senha
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
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
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <Button type="submit" className="w-full">
            Enviar link de recuperação
          </Button>
          <Link
            href="/login"
            className="flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Voltar para login
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
