'use client';

import { useCategoriesInitializer } from '@/hooks/useCategoriesInitializer';

export const CategoriesInitializer = () => {
  // This component just initializes categories, no UI needed
  useCategoriesInitializer();

  return null;
};
