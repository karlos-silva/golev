import { useAuth } from '@/stores/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333';

type FetchOptions = RequestInit & {
  params?: Record<string, string>;
};

// Singleton: garante que múltiplas requisições com 401 simultâneas
// só disparam um refresh, as outras aguardam o resultado.
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken =
    typeof window !== 'undefined'
      ? localStorage.getItem('refresh_token')
      : null;

  if (!refreshToken) throw new Error('no refresh token');

  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) throw new Error('refresh failed');

  const data = (await res.json()) as {
    tokens: { accessToken: string; refreshToken: string };
  };

  useAuth.getState().setAccessToken(data.tokens.accessToken);
  localStorage.setItem('refresh_token', data.tokens.refreshToken);

  return data.tokens.accessToken;
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

  function buildHeaders(token: string | null): HeadersInit {
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    };
  }

  function getStoredToken(): string | null {
    return typeof window !== 'undefined'
      ? localStorage.getItem('access_token')
      : null;
  }

  let response = await fetch(url.toString(), {
    headers: buildHeaders(getStoredToken()),
    ...rest,
  });

  // Token expirado → tenta refresh uma vez
  if (response.status === 401 && typeof window !== 'undefined') {
    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(
          () => { refreshPromise = null; },
        );
      }
      const newToken = await refreshPromise;
      response = await fetch(url.toString(), {
        headers: buildHeaders(newToken),
        ...rest,
      });
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
