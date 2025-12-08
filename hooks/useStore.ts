'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Store } from '@/types/api';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import {
  getSelectedStoreId,
  setSelectedStoreId,
  getCachedStores,
  setCachedStores,
  getSelectedStore,
  clearStoreData,
  validateStoreSelection,
  autoSelectStore,
  validateStoreCurrencyFields
} from '@/lib/store-utils';

interface UseStoreReturn {
  stores: Store[];
  selectedStore: Store | null;
  isLoading: boolean;
  error: string | null;
  refreshStores: () => Promise<void>;
  selectStore: (storeId: number) => void;
  clearStores: () => void;
}

export function useStore(): UseStoreReturn {
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load stores on mount
  useEffect(() => {
    loadStores();
  }, []);

  // Update selected store when stores change
  useEffect(() => {
    if (stores.length > 0) {
      const validStore = autoSelectStore(stores);
      setSelectedStore(validStore);
    } else {
      setSelectedStore(null);
    }
  }, [stores]);

  const loadStores = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Try to load from cache first
      const cachedStores = getCachedStores();

      // If cached stores don't have currency fields, force refresh
      if (
        cachedStores.length > 0 &&
        validateStoreCurrencyFields(cachedStores)
      ) {
        setStores(cachedStores);
        setIsLoading(false);
        return;
      }

      // No cache or missing currency fields, fetch from API
      await fetchFreshStores();
    } catch (error) {
      console.error('Error loading stores:', error);
      setError('Failed to load stores');
      setIsLoading(false);
    }
  }, []);

  const fetchFreshStores = useCallback(async () => {
    try {
      const response = await apiClient.getMyStores();

      // Handle the API response format: { message, status: "ok", data: [...] }
      let storesData: Store[] = [];

      if (
        response.data &&
        (response.data as any).status === 'ok' &&
        (response.data as any).data
      ) {
        storesData = (response.data as any).data;
      } else if (Array.isArray(response.data)) {
        // Fallback for direct array response
        storesData = response.data;
      } else {
        console.error('Unexpected response structure:', response.data);
        setError('Invalid response structure from server');
        return;
      }

      // Validate that stores have currency fields, log warning if missing
      if (process.env.NODE_ENV === 'development') {
        storesData.forEach((store) => {
          if (!store.currency && !store.currency_symbol) {
            console.warn(
              `Store ${store.id} (${store.name}) missing currency fields`
            );
          }
        });
      }

      setStores(storesData);
      setCachedStores(storesData);
    } catch (error) {
      console.error('Error fetching stores:', error);
      setError('Failed to fetch stores');

      // If it's an authentication error, redirect to login
      if (error instanceof Error && error.message.includes('401')) {
        clearStoreData();
        router.push('/login');
      }
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const refreshStores = useCallback(async () => {
    await fetchFreshStores();
  }, [fetchFreshStores]);

  const selectStore = useCallback(
    (storeId: number) => {
      const store = stores.find((s) => s.id === storeId);
      if (store) {
        setSelectedStoreId(storeId);
        setSelectedStore(store);
      }
    },
    [stores]
  );

  const clearStores = useCallback(() => {
    clearStoreData();
    setStores([]);
    setSelectedStore(null);
    setError(null);
  }, []);

  return {
    stores,
    selectedStore,
    isLoading,
    error,
    refreshStores,
    selectStore,
    clearStores
  };
}

/**
 * Hook to get the current selected store ID
 */
export function useSelectedStoreId(): number | null {
  const [storeId, setStoreId] = useState<number | null>(null);

  useEffect(() => {
    setStoreId(getSelectedStoreId());
  }, []);

  return storeId;
}

/**
 * Hook to check if user has store access
 */
export function useStoreAccess(): {
  hasAccess: boolean;
  isLoading: boolean;
  error: string | null;
} {
  const { stores, isLoading, error } = useStore();

  return {
    hasAccess: stores.length > 0,
    isLoading,
    error
  };
}
