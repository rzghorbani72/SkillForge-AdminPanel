'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Academy } from '@/types/api';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import {
  getSelectedAcademyId,
  setSelectedAcademyId,
  getCachedAcademies,
  setCachedAcademies,
  clearAcademyData,
  validateAcademyCurrencyFields,
  autoSelectAcademy
} from '@/lib/store-utils';
import { useAuthUser } from './useAuthUser';

interface UseStoreReturn {
  academies: Academy[];
  selectedAcademy: Academy | null;
  isLoading: boolean;
  error: string | null;
  refreshAcademies: () => Promise<void>;
  selectAcademy: (academyId: number) => void;
  clearAcademies: () => void;
}

export function useStore(): UseStoreReturn {
  const router = useRouter();
  const { user } = useAuthUser();
  const [academies, setAcademies] = useState<Academy[]>([]);
  const [selectedAcademy, setSelectedAcademy] = useState<Academy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const preferredAcademyId = user
    ? ((user as any)?.academyId ??
      (user as any)?.profile?.academyId ??
      (user as any)?.profile?.academy_id ??
      (user as any)?.profile?.Academy?.id ??
      null)
    : null;

  useEffect(() => {
    loadAcademies();
  }, []);

  useEffect(() => {
    if (user && user.role === 'ADMIN' && preferredAcademyId === null) {
      setSelectedAcademy(null);
      return;
    }

    if (academies.length > 0) {
      const valid = autoSelectAcademy(academies, preferredAcademyId);
      setSelectedAcademy(valid);
    } else {
      setSelectedAcademy(null);
    }
  }, [academies, preferredAcademyId, user]);

  const loadAcademies = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const cached = getCachedAcademies();

      if (cached.length > 0 && validateAcademyCurrencyFields(cached)) {
        setAcademies(cached);
        setIsLoading(false);
        return;
      }

      await fetchFreshAcademies();
    } catch (err) {
      console.error('Error loading academies:', err);
      setError('Failed to load academies');
      setIsLoading(false);
    }
  }, []);

  const fetchFreshAcademies = useCallback(async () => {
    try {
      const response = await apiClient.getMyAcademies();

      let list: Academy[] = [];

      if (
        response.data &&
        (response.data as any).status === 'ok' &&
        (response.data as any).data
      ) {
        list = (response.data as any).data;
      } else if (Array.isArray(response.data)) {
        list = response.data;
      } else {
        console.error('Unexpected response structure:', response.data);
        setError('Invalid response structure from server');
        return;
      }

      if (process.env.NODE_ENV === 'development') {
        list.forEach((a) => {
          if (!a.currency && !a.currency_symbol) {
            console.warn(`Academy ${a.id} (${a.name}) missing currency fields`);
          }
        });
      }

      setAcademies(list);
      setCachedAcademies(list);
    } catch (err) {
      console.error('Error fetching academies:', err);
      setError('Failed to fetch academies');

      if (err instanceof Error && err.message.includes('401')) {
        clearAcademyData();
        router.push('/login');
      }
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const refreshAcademies = useCallback(async () => {
    await fetchFreshAcademies();
  }, [fetchFreshAcademies]);

  const selectAcademy = useCallback(
    (academyId: number) => {
      const found = academies.find((a) => a.id === academyId);
      if (found) {
        setSelectedAcademyId(academyId);
        setSelectedAcademy(found);
      }
    },
    [academies]
  );

  const clearAcademies = useCallback(() => {
    clearAcademyData();
    setAcademies([]);
    setSelectedAcademy(null);
    setError(null);
  }, []);

  return {
    academies,
    selectedAcademy,
    isLoading,
    error,
    refreshAcademies,
    selectAcademy,
    clearAcademies
  };
}

export function useSelectedAcademyId(): number | null {
  const [academyId, setAcademyId] = useState<number | null>(null);

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
