import { create } from 'zustand';
import type { AuthResponse } from '@golev/shared';

export type AuthUser = AuthResponse['user'];

// Os tokens vivem em cookies httpOnly setados pela API (JS não os lê → imune a
// roubo por XSS). O store guarda só o `user` (para a UI). O cookie `gl_role`
// (legível, p/ middleware/UI) também é setado pela API.

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
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem('auth_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('auth_user');
  }
}

function deleteCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}

interface AuthState {
  user: AuthUser | null;
  /** Após login/refresh: guarda o usuário (os tokens já vieram como cookies). */
  setSession: (user: AuthUser) => void;
  setUser: (user: AuthUser | null) => void;
  /** Atualiza campos do usuário em memória + storage (ex.: mustResetPassword). */
  patchUser: (patch: Partial<AuthUser>) => void;
  /** Limpeza LOCAL. Os cookies httpOnly são limpos pela API em /auth/logout. */
  logout: () => void;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: readStoredUser(),

  setSession: (user) => {
    persistUser(user);
    set({ user });
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
    persistUser(null);
    // best-effort (cookie legível); os httpOnly são limpos pela API.
    deleteCookie('gl_role');
    set({ user: null });
  },
}));
