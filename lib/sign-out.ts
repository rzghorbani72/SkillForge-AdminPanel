'use client';

import { apiClient } from './api';

/** UI preferences are not user data, so they survive sign-out. */
const KEEP_KEYS = ['preferred_language', 'theme'];

function wipeBrowserStorage(): void {
  for (const store of [window.localStorage, window.sessionStorage]) {
    try {
      for (const key of Object.keys(store)) {
        if (!KEEP_KEYS.includes(key)) store.removeItem(key);
      }
    } catch {
      // Storage can be blocked (private mode); the redirect below still applies.
    }
  }
}

/**
 * The one way to sign out. The browser call is what revokes the refresh token
 * and expires the auth cookies — a server action cannot, because it sends none
 * of the browser's cookies. The redirect is a full page load so the Next router
 * cache, which holds pages prefetched for the signed-in user, is dropped too.
 */
export async function signOut(redirectTo = '/login'): Promise<void> {
  await apiClient.logout().catch(() => undefined);

  const { logout } = await import('@/app/actions/auth');
  await logout().catch(() => undefined);

  if (typeof window === 'undefined') return;

  wipeBrowserStorage();

  const { useUserStore, useCategoriesStore } = await import('@/lib/store');
  useUserStore.getState().reset();
  useCategoriesStore.getState().reset();

  window.location.replace(redirectTo);
}
