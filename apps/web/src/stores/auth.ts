import { create } from 'zustand';

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}

interface AuthState {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  accessToken:
    typeof window !== 'undefined'
      ? localStorage.getItem('access_token')
      : null,
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
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    deleteCookie('access_token');
    set({ accessToken: null });
  },
}));
