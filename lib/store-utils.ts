'use client';

import { Store } from '@/types/api';

// Store management utilities
const STORE_STORAGE_KEYS = {
  SELECTED_STORE_ID: 'skillforge_selected_store_id',
  STORES_CACHE: 'skillforge_stores_cache',
  LAST_FETCH: 'skillforge_stores_last_fetch'
};

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

/**
 * Get the currently selected store ID from localStorage
 */
export function getSelectedStoreId(): number | null {
  if (typeof window === 'undefined') return null;

  const storeId = localStorage.getItem(STORE_STORAGE_KEYS.SELECTED_STORE_ID);
  return storeId ? parseInt(storeId) : null;
}

/**
 * Set the selected store ID in localStorage
 */
export function setSelectedStoreId(storeId: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(
    STORE_STORAGE_KEYS.SELECTED_STORE_ID,
    storeId.toString()
  );
}

/**
 * Get cached stores from localStorage
 */
export function getCachedStores(): Store[] {
  if (typeof window === 'undefined') return [];

  try {
    const cached = localStorage.getItem(STORE_STORAGE_KEYS.STORES_CACHE);
    const lastFetch = localStorage.getItem(STORE_STORAGE_KEYS.LAST_FETCH);

    if (cached && lastFetch) {
      const lastFetchTime = parseInt(lastFetch);
      const now = Date.now();

      if (now - lastFetchTime < CACHE_DURATION) {
        return JSON.parse(cached);
      }
    }
  } catch (error) {
    console.error('Error reading cached stores:', error);
  }

  return [];
}

/**
 * Cache stores in localStorage
 */
export function setCachedStores(stores: Store[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(
      STORE_STORAGE_KEYS.STORES_CACHE,
      JSON.stringify(stores)
    );
    localStorage.setItem(STORE_STORAGE_KEYS.LAST_FETCH, Date.now().toString());
  } catch (error) {
    console.error('Error caching stores:', error);
  }
}

/**
 * Get the selected store from a list of stores
 */
export function getSelectedStore(stores: Store[]): Store | null {
  const selectedId = getSelectedStoreId();
  if (!selectedId) return stores[0] || null;

  return stores.find((store) => store.id === selectedId) || stores[0] || null;
}

/**
 * Clear all store-related data from localStorage
 */
export function clearStoreData(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORE_STORAGE_KEYS.SELECTED_STORE_ID);
    localStorage.removeItem(STORE_STORAGE_KEYS.STORES_CACHE);
    localStorage.removeItem(STORE_STORAGE_KEYS.LAST_FETCH);
  } catch (error) {
    console.error('Error clearing store data:', error);
  }
}

/**
 * Check if cached stores have currency fields
 * Returns true if all stores have currency config, false otherwise
 */
export function validateStoreCurrencyFields(stores: Store[]): boolean {
  return stores.every((store) => store.currency || store.currency_symbol);
}

/**
 * Check if user has access to a specific store
 */
export function hasStoreAccess(storeId: number, stores: Store[]): boolean {
  return stores.some((store) => store.id === storeId);
}

/**
 * Get store by ID from a list of stores
 */
export function getStoreById(storeId: number, stores: Store[]): Store | null {
  return stores.find((store) => store.id === storeId) || null;
}

/**
 * Validate if the current store selection is still valid
 */
export function validateStoreSelection(stores: Store[]): boolean {
  const selectedId = getSelectedStoreId();
  if (!selectedId) return stores.length > 0;

  return stores.some((store) => store.id === selectedId);
}

/**
 * Auto-select a store if none is selected or current selection is invalid
 * @param stores - List of available stores
 * @param preferredStoreId - Preferred store ID from /me endpoint (optional)
 */
export function autoSelectStore(
  stores: Store[],
  preferredStoreId?: number | null
): Store | null {
  if (stores.length === 0) return null;

  // First priority: Use preferred store ID from /me endpoint if provided and valid
  // This ensures the dashboard shows the store from the API response
  if (preferredStoreId) {
    const preferredStore = stores.find(
      (store) => store.id === preferredStoreId
    );
    if (preferredStore) {
      // If localStorage has a different store, update it to match /me response
      const currentSelectedId = getSelectedStoreId();
      if (currentSelectedId !== preferredStoreId) {
        setSelectedStoreId(preferredStoreId);
      }
      return preferredStore;
    }
    // If preferred store is not in the list, clear invalid localStorage selection
    const currentSelectedId = getSelectedStoreId();
    if (currentSelectedId === preferredStoreId) {
      // Clear invalid selection
      localStorage.removeItem('skillforge_selected_store_id');
    }
  }

  // Second priority: Use stored selection from localStorage (if it's valid)
  const selectedId = getSelectedStoreId();
  const selectedStore = stores.find((store) => store.id === selectedId);

  if (selectedStore) {
    return selectedStore;
  }

  // Last resort: Select the first store
  const firstStore = stores[0];
  setSelectedStoreId(firstStore.id);
  return firstStore;
}

/**
 * Extract and format the first part of domain (before the dot)
 */
export function extractDomainPart(domain: string): string {
  if (!domain) return '';
  const cleanDomain = domain
    .replace(/\.skillforge\.com$/i, '')
    .replace(/\./g, '');

  if (!cleanDomain) return '';
  return cleanDomain
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Convert domain to standard format (lowercase, kebab-case)
 */
export function formatDomain(domain: string): string {
  if (!domain) return '';
  return domain
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
