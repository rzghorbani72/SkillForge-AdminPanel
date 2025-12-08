'use client';

import { useStore } from './useStore';

/**
 * Hook to get the current selected store ID
 * Returns null if no store is selected or if there are no stores
 */
export function useCurrentStoreId(): number | null {
  const { selectedStore } = useStore();
  return selectedStore?.id || null;
}

/**
 * Hook to get the current selected store
 * Returns null if no store is selected
 */
export function useCurrentStore() {
  const { selectedStore } = useStore();
  return selectedStore;
}

/**
 * Hook to check if user has store access
 */
export function useHasStoreAccess(): boolean {
  const { stores } = useStore();
  return stores.length > 0;
}
