import { create } from 'zustand';
import type { AuthResponse } from '@golev/shared';

export type AuthUser = AuthResponse['user'];

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}

function readStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('auth_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function persistUser(user: AuthUser | null) {
  if (user) {
    localStorage.setItem('auth_user', JSON.stringify(user));
    // Cookie só com o role — o middleware usa para separar app do cliente x portal.
    setCookie('gl_role', user.role, 7);
  } else {
    localStorage.removeItem('auth_user');
    deleteCookie('gl_role');
  }
}

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  /** Login: grava token + usuário (localStorage + cookies lidos pelo middleware). */
  setSession: (session: { user: AuthUser; accessToken: string }) => void;
  /** Atualiza só o access token (usado no refresh em lib/api.ts). */
  setAccessToken: (token: string | null) => void;
  setUser: (user: AuthUser | null) => void;
  /** Atualiza campos do usuário em memória + storage (ex.: mustResetPassword). */
  patchUser: (patch: Partial<AuthUser>) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>((set, get) => ({
  accessToken:
    typeof window !== 'undefined'
      ? localStorage.getItem('access_token')
      : null,
  user: readStoredUser(),

  setSession: ({ user, accessToken }) => {
    localStorage.setItem('access_token', accessToken);
    setCookie('access_token', accessToken, 1);
    persistUser(user);
    set({ accessToken, user });
  },

  setAccessToken: (token) => {
    if (token) {
      localStorage.setItem('access_token', token);
      setCookie('access_token', token, 1);
    } else {
      localStorage.removeItem('access_token');
      deleteCookie('access_token');
    }
    set({ accessToken: token });
  },

  setUser: (user) => {
    persistUser(user);
    set({ user });
  },

  patchUser: (patch) => {
    const current = get().user;
    if (!current) return;
    const next = { ...current, ...patch };
    persistUser(next);
    set({ user: next });
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('auth_user');
    deleteCookie('access_token');
    deleteCookie('gl_role');
    set({ accessToken: null, user: null });
  },
}));
