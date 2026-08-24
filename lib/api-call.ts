import { getBrowserApiBaseUrl } from './api-base-url';
import { browserRequestHeaders } from './browser-request-headers';

/** Cookie-authenticated JSON fetch shared by the standalone API modules. */
export async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const method = init?.method ?? 'GET';
  const res = await fetch(`${getBrowserApiBaseUrl()}${path}`, {
    credentials: 'include',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...browserRequestHeaders(method),
      ...(init?.headers ?? {})
    }
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new Error(data?.message ?? `Request failed: ${res.status}`);
  }
  return data as T;
}
