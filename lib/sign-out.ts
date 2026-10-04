'use client';

import { apiClient } from './api';
import { wipeNonPlatformClient } from './wipe-non-platform-storage';

async function clearLocalSession(): Promise<void> {
  wipeNonPlatformClient();
  const { useUserStore, useCategoriesStore } = await import('@/lib/store');
  useUserStore.getState().reset();
  useCategoriesStore.getState().reset();
}

/**
 * The one way to sign out. The browser call is what revokes the refresh token
 * and expires the auth cookies — a server action cannot, because it sends none
 * of the browser's cookies.
 * With `navigate` the user leaves at once (local data is wiped first, the server
 * revoke finishes in the background). Without it, a full page load drops the
 * Next router cache, which holds pages prefetched for the signed-in user.
 */
export async function signOut(
  redirectTo = '/login',
  navigate?: (path: string) => void,
): Promise<void> {
  if (navigate) {
    await clearLocalSession();
    navigate(redirectTo);
  }

  await apiClient.logout().catch(() => undefined);

  const { logout } = await import('@/app/actions/auth');
  await logout().catch(() => undefined);

  if (typeof window === 'undefined') return;
  if (navigate) return;

  await clearLocalSession();
  window.location.replace(redirectTo);
}
