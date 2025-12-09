'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { User, Store } from '@/types/api';

interface SettingsSnapshot {
  user: User | null;
  store: Store | null;
  isLoading: boolean;
  refresh: () => void;
}

export function useSettingsData(): SettingsSnapshot {
  const [user, setUser] = useState<User | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshToken, setRefreshToken] = useState<number>(0);

  const refresh = useCallback(() => {
    setRefreshToken(Date.now());
  }, []);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setIsLoading(true);

        const [userResult, storeResult] = await Promise.allSettled([
          apiClient.getCurrentUser(),
          apiClient.getMyStores()
        ]);

        if (!isMounted) return;

        if (userResult.status === 'fulfilled') {
          setUser(((userResult.value as any)?.data as User) ?? null);
        } else {
          console.error('Failed to load current user', userResult.reason);
          setUser(null);
        }

        if (storeResult.status === 'fulfilled') {
          const raw = storeResult.value as any;
          const payload = raw?.data;

          let stores: Store[] = [];

          if (payload?.status === 'ok' && Array.isArray(payload?.data)) {
            stores = payload.data as Store[];
          } else if (Array.isArray(payload)) {
            stores = payload as Store[];
          } else if (Array.isArray(raw)) {
            stores = raw as Store[];
          }

          setStore(stores.length > 0 ? stores[0] : null);
        } else {
          console.error('Failed to load stores', storeResult.reason);
          setStore(null);
        }
      } catch (error) {
        console.error('Error loading settings data', error);
        ErrorHandler.handleApiError(error);
        if (isMounted) {
          setUser(null);
          setStore(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [refreshToken]);

  return useMemo(
    () => ({
      user,
      store,
      isLoading,
      refresh
    }),
    [user, store, isLoading, refresh]
  );
}
