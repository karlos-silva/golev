'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAuth, type AuthUser } from '@/stores/auth';
import {
  isPatientRole,
  isStaffRole,
  permissionForPath,
  hasPermission,
  portalHome,
} from '@golev/shared';
import type {
  AuthResponse,
  LoginInput,
  RegisterInput,
  ChangePasswordInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from '@golev/shared';

// Áreas do app: paciente → cliente, equipe → portal. Mantidas em sincronia com
// o middleware. Servem para não mandar um role para a área do outro via ?redirect.
const PORTAL_PREFIXES = [
  '/dashboard',
  '/avaliacoes',
  '/clients',
  '/appointments',
  '/settings',
  '/billing',
  '/solicitacoes',
];
const CLIENT_PREFIXES = ['/inicio', '/evolucao', '/consultas', '/plano', '/conta'];

function startsWithAny(path: string, prefixes: string[]): boolean {
  return prefixes.some((p) => path === p || path.startsWith(`${p}/`));
}

/** Para onde mandar o usuário logado, conforme role e estado da conta. */
function destinationFor(user: AuthUser): string {
  if (user.mustResetPassword) return '/definir-senha';
  if (isPatientRole(user.role)) return '/inicio';
  // Home do portal pela capability: admin → /dashboard, doctor → /clients.
  return portalHome(user.role);
}

function safeRedirectParam(): string | null {
  if (typeof window === 'undefined') return null;
  const raw = new URLSearchParams(window.location.search).get('redirect');
  if (!raw) return null;
  try {
    // Resolve contra a origem atual e só aceita se permanecer na MESMA origem —
    // cobre //evil.com, /\evil.com e variantes codificadas (evita open redirect).
    const url = new URL(raw, window.location.origin);
    if (url.origin === window.location.origin) {
      return `${url.pathname}${url.search}`;
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * O `?redirect` só é honrado se pertencer à ÁREA do role. Um paciente nunca é
 * mandado para uma rota do portal (e vice-versa) — cai na home do próprio role.
 */
function redirectForRole(user: AuthUser): string | null {
  const redirect = safeRedirectParam();
  if (!redirect) return null;
  if (isPatientRole(user.role) && startsWithAny(redirect, PORTAL_PREFIXES)) {
    return null;
  }
  if (isStaffRole(user.role) && startsWithAny(redirect, CLIENT_PREFIXES)) {
    return null;
  }
  // Staff sem a capability da área de destino não é levado a ela via ?redirect.
  const required = permissionForPath(redirect);
  if (isStaffRole(user.role) && required && !hasPermission(user.role, required)) {
    return null;
  }
  return redirect;
}

export function useLogin() {
  const router = useRouter();
  const { setSession } = useAuth();

  return useMutation({
    mutationFn: (data: LoginInput) =>
      api<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: (data) => {
      setSession(data.user);
      const firstName = data.user.name.split(' ')[0];
      toast.success(`Que bom te ver, ${firstName}.`);
      // 1º acesso tem prioridade; senão respeita o ?redirect SE for da área do
      // role (paciente nunca vai pro portal); senão a home do role.
      const dest = data.user.mustResetPassword
        ? '/definir-senha'
        : (redirectForRole(data.user) ?? destinationFor(data.user));
      router.push(dest);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Credenciais inválidas');
    },
  });
}

export function useRegister() {
  const router = useRouter();
  const { setSession } = useAuth();

  return useMutation({
    mutationFn: (data: RegisterInput) =>
      api<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: (data) => {
      setSession(data.user);
      toast.success('Conta criada com sucesso!');
      router.push(destinationFor(data.user));
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao criar conta');
    },
  });
}

/**
 * Troca de senha (e definição no 1º acesso). Ao concluir, baixa
 * `mustResetPassword` no estado e, se `redirectTo` for informado, navega.
 */
export function useChangePassword(redirectTo?: string) {
  const router = useRouter();
  const { setSession } = useAuth();

  return useMutation({
    mutationFn: (data: ChangePasswordInput) =>
      api<AuthResponse>('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: (data) => {
      // Backend revogou as sessões antigas e emitiu um par novo (sem a flag de
      // 1º acesso) — atualizamos a sessão para o app seguir sem interrupção.
      setSession(data.user);
      toast.success('Senha definida. Tudo pronto.');
      if (redirectTo) router.push(redirectTo);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Não foi possível atualizar a senha');
    },
  });
}

/** "Esqueci a senha": dispara o e-mail. A UI mostra sempre uma mensagem neutra. */
export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: ForgotPasswordInput) =>
      api<{ message: string }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onError: (error: Error) =>
      toast.error(error.message || 'Não foi possível enviar o e-mail'),
  });
}

/** Define a nova senha via token (link do e-mail) e já faz auto-login. */
export function useResetPassword() {
  const router = useRouter();
  const { setSession } = useAuth();

  return useMutation({
    mutationFn: (data: ResetPasswordInput) =>
      api<AuthResponse>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: (data) => {
      setSession(data.user);
      toast.success('Senha definida. Tudo pronto.');
      router.push(destinationFor(data.user));
    },
    onError: (error: Error) =>
      toast.error(error.message || 'Link inválido ou expirado'),
  });
}

export function useLogout() {
  const router = useRouter();
  const { logout } = useAuth();

  return useMutation({
    // O cookie httpOnly autentica e a API limpa os cookies de sessão.
    mutationFn: () => api('/auth/logout', { method: 'POST' }),
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
