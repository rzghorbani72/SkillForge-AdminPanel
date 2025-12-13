'use client';

import { useEffect, useRef } from 'react';
import { useUserStore } from '@/lib/store';
import { useCategoriesStore } from '@/lib/store';

/**
 * Hook to initialize user and categories data on first render
 * Should be called once at the dashboard level
 */
export function useInitializeStores() {
  const { fetchUser, user, isInitialized: userInitialized } = useUserStore();
  const {
    fetchCategories,
    categories,
    isLoading: categoriesLoading
  } = useCategoriesStore();
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Only initialize once
    if (hasInitialized.current) return;

    const initialize = async () => {
      hasInitialized.current = true;

      // Fetch user if not already initialized
      if (!userInitialized || !user) {
        await fetchUser();
      }

      // Fetch categories if not already loaded
      if (categories.length === 0 && !categoriesLoading) {
        await fetchCategories();
      }
    };

    initialize();
  }, [
    fetchUser,
    fetchCategories,
    user,
    userInitialized,
    categories.length,
    categoriesLoading
  ]);

  return {
    userInitialized,
    categoriesLoaded: categories.length > 0
  };
}
