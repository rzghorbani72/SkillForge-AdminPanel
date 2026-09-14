'use server';

import { cookies } from 'next/headers';
import { buildTrustedBackendUrl } from '@/lib/security/ssrf';

const AUTH_COOKIES = ['jwt', 'refresh_token', 'csrf-token'];

/**
 * Server-side half of sign-out: it deletes the auth cookies this app owns and
 * asks the backend to revoke the refresh token. Cookies must be forwarded by
 * hand — a server fetch sends none of the browser's cookies on its own, so
 * `credentials: 'include'` here would be a no-op.
 */
export async function logout(): Promise<{ success: boolean; error?: string }> {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join('; ');

    if (cookieStore.get('jwt') ?? cookieStore.get('refresh_token')) {
      try {
        await fetch(buildTrustedBackendUrl('/auth/logout'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Cookie: cookieHeader,
            'x-csrf-token': cookieStore.get('csrf-token')?.value ?? '',
          },
          cache: 'no-store',
          signal: AbortSignal.timeout(3000),
        });
      } catch {
        // Cookie deletion below is the source of truth — backend call is best-effort
      }
    }

    for (const name of AUTH_COOKIES) cookieStore.delete(name);

    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Logout failed',
    };
  }
}
