'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAuth } from '@/stores/auth';
import type {
  AnamneseInput,
  AnamneseResponse,
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

/** Abre o Stripe Billing Portal (gerenciar/cancelar assinatura). Autenticado. */
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

/**
 * Fluxo self-service ANÔNIMO do funil: grava o lead elegível → inicia o Stripe
 * Checkout a partir do anamneseId. A conta do paciente só nasce no pagamento
 * (webhook / session-from-payment).
 */
export function useStartCheckout() {
  return useMutation({
    mutationFn: async ({
      anamnese,
      couponCode,
    }: {
      anamnese: AnamneseInput;
      couponCode?: string;
    }) => {
      const lead = await api<AnamneseResponse>('/anamnese', {
        method: 'POST',
        body: JSON.stringify(anamnese),
      });
      if (!lead.id) {
        throw new Error('Sua avaliação não é elegível para assinatura.');
      }
      return api<CheckoutResponse>('/billing/checkout', {
        method: 'POST',
        body: JSON.stringify({
          anamneseId: lead.id,
          ...(couponCode ? { couponCode } : {}),
        }),
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

/**
 * Pós-pagamento "entra direto": troca a sessão paga por uma sessão autenticada.
 * Retorna 409 enquanto o pagamento não confirma (Pix) — a tela de processamento
 * faz polling.
 */
export function useSessionFromPayment() {
  const { setSession } = useAuth();
  return useMutation({
    mutationFn: (sessionId: string) =>
      api<AuthResponse>('/billing/session-from-payment', {
        method: 'POST',
        body: JSON.stringify({ sessionId }),
      }),
    onSuccess: (data) => {
      // Tokens vêm como cookies httpOnly setados pela API; guardamos só o user.
      setSession(data.user);
    },
  });
}
