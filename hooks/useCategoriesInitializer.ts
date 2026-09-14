import { useEffect, useRef } from 'react';
import { useCategoriesStore } from '@/lib/store';

export const useCategoriesInitializer = () => {
  const fetchCategories = useCategoriesStore((state) => state.fetchCategories);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories: useCategoriesStore((state) => state.categories),
    isLoading: useCategoriesStore((state) => state.isLoading),
  };
};
