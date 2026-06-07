'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAuth } from '@/stores/auth';
import type {
  AnamneseInput,
  AuthResponse,
  CheckoutResponse,
  SubscriptionResponse,
} from '@golev/shared';

export function useSubscription(options?: {
  enabled?: boolean;
  refetchInterval?: number | false;
}) {
  return useQuery<SubscriptionResponse>({
    queryKey: ['subscription'],
    queryFn: () => api<SubscriptionResponse>('/billing/subscription'),
    enabled: options?.enabled,
    refetchInterval: options?.refetchInterval,
  });
}

/** Abre o Stripe Billing Portal (gerenciar/cancelar assinatura). */
export function usePortal() {
  return useMutation({
    mutationFn: () =>
      api<CheckoutResponse>('/billing/portal', { method: 'POST' }),
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Não foi possível abrir o portal.');
    },
  });
}

type SubscribeVars = {
  anamnese: AnamneseInput;
  name: string;
  email: string;
  password: string;
};

/**
 * Fluxo self-service do funil: grava o lead elegível → cria conta (ou faz login
 * se o e-mail já existe) → abre o Stripe Checkout. O token recém-salvo autentica
 * a chamada de checkout (api() lê o access_token do localStorage).
 */
export function useSubscribeFlow() {
  const { setAccessToken } = useAuth();

  return useMutation({
    mutationFn: async ({ anamnese, name, email, password }: SubscribeVars) => {
      await api('/anamnese', {
        method: 'POST',
        body: JSON.stringify(anamnese),
      });

      let auth: AuthResponse;
      try {
        auth = await api<AuthResponse>('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ name, email, password }),
        });
      } catch {
        // E-mail já cadastrado: tenta logar com as credenciais informadas.
        auth = await api<AuthResponse>('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
      }

      setAccessToken(auth.tokens.accessToken);
      localStorage.setItem('refresh_token', auth.tokens.refreshToken);

      return api<CheckoutResponse>('/billing/checkout', {
        method: 'POST',
        body: JSON.stringify({}),
      });
    },
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
    onError: (error: Error) => {
      toast.error(
        error.message || 'Não foi possível iniciar o pagamento. Tente novamente.',
      );
    },
  });
}
