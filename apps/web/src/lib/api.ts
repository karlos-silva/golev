import { useAuth, type AuthUser } from '@/stores/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333';

type FetchOptions = RequestInit & {
  params?: Record<string, string>;
};

// Singleton: múltiplos 401 simultâneos só disparam um refresh.
let refreshPromise: Promise<void> | null = null;

async function refreshSession(): Promise<void> {
  // O refresh token vem do cookie httpOnly; a API seta novos cookies na resposta
  // (o JS nunca toca nos tokens).
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('refresh failed');
  try {
    const data = (await res.json()) as { user?: AuthUser };
    if (data.user) useAuth.getState().setSession(data.user);
  } catch {
    /* sem corpo de user — tudo bem, os cookies já foram renovados */
  }
}

function clearSessionAndRedirect() {
  useAuth.getState().logout();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

export async function api<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const { params, headers, ...rest } = options;

  const url = new URL(endpoint, API_URL);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  // credentials:'include' envia/recebe os cookies httpOnly de sessão.
  const doFetch = () =>
    fetch(url.toString(), {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...headers },
      ...rest,
    });

  let response = await doFetch();

  // Access token expirado → tenta refresh (cookie) uma vez e repete.
  if (response.status === 401 && typeof window !== 'undefined') {
    try {
      if (!refreshPromise) {
        refreshPromise = refreshSession().finally(() => {
          refreshPromise = null;
        });
      }
      await refreshPromise;
      response = await doFetch();
    } catch {
      clearSessionAndRedirect();
      throw new Error('Sessão expirada. Faça login novamente.');
    }
  }

  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const body: unknown = await response.json();
      if (
        body !== null &&
        typeof body === 'object' &&
        'message' in body &&
        typeof (body as { message: unknown }).message === 'string'
      ) {
        message = (body as { message: string }).message;
      }
    } catch {
      message = 'An unexpected error occurred';
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}
