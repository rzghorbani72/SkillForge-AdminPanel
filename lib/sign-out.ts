'use client';

import { apiClient } from './api';
import { wipeNonPlatformClient } from './wipe-non-platform-storage';

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

  wipeNonPlatformClient();

  const { useUserStore, useCategoriesStore } = await import('@/lib/store');
  useUserStore.getState().reset();
  useCategoriesStore.getState().reset();

  window.location.replace(redirectTo);
}
