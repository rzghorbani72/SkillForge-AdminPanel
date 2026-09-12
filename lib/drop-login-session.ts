'use client';

import { apiClient } from './api';
import { wipeNonPlatformClient } from './wipe-non-platform-storage';

async function resetClientStores(): Promise<void> {
  const { useUserStore, useCategoriesStore } = await import('@/lib/store');
  useUserStore.getState().reset();
  useCategoriesStore.getState().reset();
}

/**
 * Drop leftover HttpOnly cookies, academy/person storage, and in-memory
 * session stores. Platform language/theme/sidebar config stays.
 */
export async function resetAnonymousAuthClient(): Promise<void> {
  wipeNonPlatformClient();
  await apiClient.logout().catch(() => undefined);
  const { logout } = await import('@/app/actions/auth');
  await logout().catch(() => undefined);
  wipeNonPlatformClient();
  await resetClientStores().catch(() => undefined);
  apiClient.resumeRequests();
}
