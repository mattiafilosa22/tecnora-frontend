import { afterEach, describe, expect, it, vi } from 'vitest';
import { API_URL, ApiError, DEFAULT_API_URL, apiFetch, resolveApiUrl } from './api';

describe('resolveApiUrl', () => {
  it('usa il default se il valore manca', () => {
    expect(resolveApiUrl(undefined)).toBe('http://localhost:8000/api');
  });

  it('usa il default se il valore è vuoto o solo spazi', () => {
    expect(resolveApiUrl('')).toBe(DEFAULT_API_URL);
    expect(resolveApiUrl('   ')).toBe(DEFAULT_API_URL);
  });

  it('rimuove lo slash finale', () => {
    expect(resolveApiUrl('https://api.tecnora.it/api/')).toBe('https://api.tecnora.it/api');
  });
});

describe('apiFetch', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('compone URL e header e restituisce il JSON', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(apiFetch('/health')).resolves.toEqual({ ok: true });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${API_URL}/health`);
    expect(new Headers(init.headers).get('Accept')).toBe('application/json');
  });

  it('lancia ApiError con lo status se la risposta non è ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('nope', { status: 404, statusText: 'Not Found' })),
    );

    const request = apiFetch('missing');
    await expect(request).rejects.toBeInstanceOf(ApiError);
    await expect(request).rejects.toMatchObject({ status: 404 });
  });

  it('restituisce undefined su 204', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })));

    await expect(apiFetch('empty')).resolves.toBeUndefined();
  });
});
