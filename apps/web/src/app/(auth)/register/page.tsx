'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { registerSchema } from '@trianox/shared';
import { useRegister } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

export default function RegisterPage() {
  const register = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const raw = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      tenantName: formData.get('tenantName') as string,
    };

    const result = registerSchema.safeParse(raw);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (field) fieldErrors[String(field)] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    register.mutate(result.data);
  }

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Criar sua conta</CardTitle>
        <CardDescription>
          Preencha os dados para começar a usar a plataforma
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Seu nome"
                autoComplete="name"
                autoFocus
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="tenantName">Organização</Label>
              <Input
                id="tenantName"
                name="tenantName"
                type="text"
                placeholder="Minha Empresa"
                autoComplete="organization"
              />
              {errors.tenantName && (
                <p className="text-xs text-destructive">{errors.tenantName}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="seu@email.com"
              autoComplete="email"
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <Button type="submit" className="w-full" disabled={register.isPending}>
            {register.isPending ? <Spinner /> : null}
            Criar conta
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Já tem uma conta?{' '}
            <Link href="/login" className="font-medium text-foreground hover:underline">
              Entrar
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
