import { useCategoriesStore } from '@/lib/store';

export const useCategories = () => {
  const { categories, isLoading, error } = useCategoriesStore();

  return {
    categories,
    isLoading,
    error,
    // Helper functions
    getCategoryById: (id: number) => categories.find((cat) => cat.id === id),
    getCategoriesByType: (type: 'COURSE' | 'ARTICLE' | 'BLOG' | 'NEWS') =>
      categories.filter((cat) => cat.type === type),
    getActiveCategories: () => categories.filter((cat) => cat.is_active)
  };
};
