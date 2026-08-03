'use client';

import { useState, useEffect } from 'react';
import { getSelectedAcademyId } from '@/lib/store-utils';
import { useStore } from '@/components/providers/store-provider';

/**
 * Re-export useStore from StoreProvider so every consumer shares one
 * academies fetch instead of calling /v1/academies on each mount.
 */
export { useStore };

export function useSelectedAcademyId(): string | null {
  const [academyId, setAcademyId] = useState<string | null>(null);

  useEffect(() => {
    setAcademyId(getSelectedAcademyId());
  }, []);

  return academyId;
}

export function useStoreAccess(): {
  hasAccess: boolean;
  isLoading: boolean;
  error: string | null;
} {
  const { academies, isLoading, error } = useStore();

  return {
    hasAccess: academies.length > 0,
    isLoading,
    error
  };
}
