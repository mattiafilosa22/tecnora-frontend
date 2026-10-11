export const DEFAULT_API_URL = 'http://localhost:8000/api';

export function resolveApiUrl(value: string | undefined): string {
  return (value?.trim() || DEFAULT_API_URL).replace(/\/+$/, '');
}

export const API_URL = resolveApiUrl(import.meta.env.VITE_API_URL);

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }
  if (init.body !== undefined && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_URL}/${path.replace(/^\/+/, '')}`, { ...init, headers });
  if (!response.ok) {
    throw new ApiError(response.status, `${response.status} ${response.statusText}`.trim());
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}
