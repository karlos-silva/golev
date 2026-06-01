const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333';

type FetchOptions = RequestInit & {
  params?: Record<string, string>;
};

export async function api<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const { params, headers, ...rest } = options;

  const url = new URL(endpoint, API_URL);
  if (params) {
    Object.entries(params).forEach(([key, value]) =>
      url.searchParams.set(key, value),
    );
  }

  const accessToken =
    typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  const response = await fetch(url.toString(), {
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
    ...rest,
  });

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
