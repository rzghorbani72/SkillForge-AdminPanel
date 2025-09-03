import { useEffect } from 'react';
import { useCategoriesStore } from '@/lib/store';
import { apiClient } from '@/lib/api';

export const useCategoriesInitializer = () => {
  const { categories, setCategories, setLoading, setError, clearError } =
    useCategoriesStore();

  useEffect(() => {
    const initializeCategories = async () => {
      // Only fetch if categories are not already loaded
      if (categories.length === 0) {
        try {
          setLoading(true);
          clearError();
          const response = await apiClient.getCategories();

          let categoriesData: any[] = [];
          if (response && typeof response === 'object') {
            if (Array.isArray(response.data)) {
              categoriesData = response.data;
            } else if (
              response.data &&
              typeof response.data === 'object' &&
              Array.isArray((response.data as any).data)
            ) {
              categoriesData = (response.data as any).data;
            } else if (
              response.data &&
              typeof response.data === 'object' &&
              Array.isArray((response.data as any).categories)
            ) {
              categoriesData = (response.data as any).categories;
            } else {
              categoriesData = [];
            }
          } else {
            categoriesData = [];
          }

          setCategories(categoriesData);
        } catch (error) {
          console.error('Error initializing categories:', error);
          setError('Failed to load categories');
        } finally {
          setLoading(false);
        }
      }
    };

    initializeCategories();
  }, [categories.length, setCategories, setLoading, setError, clearError]);

  return {
    categories,
    isLoading: useCategoriesStore((state) => state.isLoading)
  };
};
