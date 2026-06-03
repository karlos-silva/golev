'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAuth } from '@/stores/auth';
import type { AuthResponse, LoginInput, RegisterInput } from '@golev/shared';

export function useLogin() {
  const router = useRouter();
  const { setAccessToken } = useAuth();

  return useMutation({
    mutationFn: (data: LoginInput) =>
      api<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: (data) => {
      setAccessToken(data.tokens.accessToken);
      localStorage.setItem('refresh_token', data.tokens.refreshToken);
      toast.success(`Bem-vindo, ${data.user.name}!`);
      router.push('/dashboard');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Credenciais inválidas');
    },
  });
}

export function useRegister() {
  const router = useRouter();
  const { setAccessToken } = useAuth();

  return useMutation({
    mutationFn: (data: RegisterInput) =>
      api<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: (data) => {
      setAccessToken(data.tokens.accessToken);
      localStorage.setItem('refresh_token', data.tokens.refreshToken);
      toast.success('Conta criada com sucesso!');
      router.push('/dashboard');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao criar conta');
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const { logout, accessToken } = useAuth();

  return useMutation({
    mutationFn: () =>
      api('/auth/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    onSuccess: () => {
      logout();
      toast.success('Até logo!');
      router.push('/login');
    },
    onError: () => {
      logout();
      router.push('/login');
    },
  });
}
