'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import type { Academy } from '@/types/api';
import { apiClient } from '@/lib/api';
import {
  getSelectedAcademyId,
  setSelectedAcademyId,
  getCachedAcademies,
  setCachedAcademies,
  clearAcademyData,
  validateAcademyCurrencyFields,
  autoSelectAcademy,
} from '@/lib/store-utils';
import { useAuthUser } from '@/components/providers/user-provider';
import { useSessionAcademyRescope } from '@/hooks/use-session-academy-rescope';
import { isApiResponseError, resolveApiErrorMessage } from '@/lib/api-error';
import { currentLanguage } from '@/lib/current-language';
import { isStudentRankSeat } from '@/components/academies/academy-helpers';
import { setLogContext } from '@/lib/logging/browser-context';
import { logger } from '@/lib/logging/app-logger';
import { errorFields } from '@/lib/logging/error-fields';

interface StoreContextValue {
  academies: Academy[];
  selectedAcademy: Academy | null;
  isLoading: boolean;
  error: string | null;
  refreshAcademies: () => Promise<void>;
  selectAcademy: (academyId: string) => void;
  clearAcademies: () => void;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

/** Survives React Strict Mode remounts so we never fire two parallel GETs. */
let academiesInFlight: Promise<Academy[]> | null = null;

function parseAcademiesResponse(data: unknown): Academy[] | null {
  if (
    data &&
    typeof data === 'object' &&
    (data as { status?: string }).status === 'ok' &&
    Array.isArray((data as { data?: unknown }).data)
  ) {
    return (data as { data: Academy[] }).data;
  }
  if (Array.isArray(data)) {
    return data;
  }
  return null;
}

/** Panel UI never lists a student/public seat, even from a stale cache. */
function panelVisibleAcademies(list: Academy[], isPlatformStaff: boolean): Academy[] {
  if (isPlatformStaff) return list;
  return list.filter((academy) => !isStudentRankSeat(academy));
}

async function requestAcademies(): Promise<Academy[]> {
  if (academiesInFlight) return academiesInFlight;

  academiesInFlight = (async () => {
    const response = await apiClient.getMyAcademies();
    const list = parseAcademiesResponse(response.data);
    if (!list) {
      throw new Error('Invalid response structure from server');
    }
    setCachedAcademies(list);
    return list;
  })().finally(() => {
    academiesInFlight = null;
  });

  return academiesInFlight;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthUser();
  const [academies, setAcademies] = useState<Academy[]>([]);
  const [selectedAcademy, setSelectedAcademy] = useState<Academy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);

  const preferredAcademyId = user?.academyId ?? user?.profile?.academy_id ?? null;

  useEffect(() => {
    setLogContext({
      user_id: user?.id,
      academy_id: selectedAcademy?.id ?? preferredAcademyId,
      role: user?.role,
    });
  }, [user?.id, user?.role, selectedAcademy?.id, preferredAcademyId]);

  const isPlatformStaff =
    !!user?.isAdminProfile ||
    !!user?.platformLevel ||
    user?.role === 'PLATFORM_OWNER' ||
    user?.role === 'ADMIN' ||
    user?.canManagePlatform === true;

  const fetchFreshAcademies = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setIsLoading(true);
        setError(null);

        const list = await requestAcademies();

        if (process.env.NODE_ENV === 'development') {
          list.forEach((a) => {
            if (!a.currency && !a.currency_symbol) {
              logger.warn('Academies', 'MissingCurrencyFields', { academy_id: String(a.id) });
            }
          });
        }

        const visible = panelVisibleAcademies(list, isPlatformStaff);
        setCachedAcademies(visible);
        setAcademies(visible);
      } catch (err) {
        logger.error('Academies', 'FetchingAcademiesFailed', errorFields(err));
        setError(resolveApiErrorMessage(err, currentLanguage()));

        if (isApiResponseError(err) && err.error.status === 401) {
          clearAcademyData();
          router.push('/login');
        }
      } finally {
        setIsLoading(false);
        hasFetchedRef.current = true;
      }
    },
    [router, isPlatformStaff],
  );

  const loadAcademies = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const cached = getCachedAcademies();

      if (cached.length > 0 && validateAcademyCurrencyFields(cached)) {
        setAcademies(panelVisibleAcademies(cached, isPlatformStaff));
        setIsLoading(false);
        hasFetchedRef.current = true;
        // Paint from cache, then correct it. Serving the cache alone let a newly
        // created academy stay invisible for the whole cache window.
        void fetchFreshAcademies(true);
        return;
      }

      await fetchFreshAcademies();
    } catch (err) {
      logger.error('Academies', 'LoadingAcademiesFailed', errorFields(err));
      setError('Failed to load academies');
      setIsLoading(false);
    }
  }, [fetchFreshAcademies, isPlatformStaff]);

  useEffect(() => {
    if (!hasFetchedRef.current) {
      void loadAcademies();
    }
  }, [loadAcademies]);

  // Academy staff whose token carries no academy cannot read any academy data,
  // so the session is re-scoped instead of letting every request 401/403.
  useSessionAcademyRescope({
    enabled: !!user && !isPlatformStaff && !preferredAcademyId,
    academies,
  });

  useEffect(() => {
    // Platform staff (admin + support) default to Platform mode (no academy),
    // but honor an explicit academy selection persisted from the mode switcher.
    if (user && isPlatformStaff && !preferredAcademyId) {
      const selectedId = getSelectedAcademyId();
      const chosen = selectedId ? (academies.find((a) => a.id === selectedId) ?? null) : null;
      setSelectedAcademy(chosen);
      return;
    }

    if (academies.length > 0) {
      setSelectedAcademy(autoSelectAcademy(academies, preferredAcademyId));
    } else {
      setSelectedAcademy(null);
    }
  }, [academies, preferredAcademyId, user, isPlatformStaff]);

  const refreshAcademies = useCallback(async () => {
    await fetchFreshAcademies();
  }, [fetchFreshAcademies]);

  const selectAcademy = useCallback(
    (academyId: string) => {
      const found = academies.find((a) => a.id === academyId);
      if (found) {
        // Drop the previous academy's cached responses before the new one
        // renders, so no view can read another tenant's data from the cache.
        queryClient.clear();
        setSelectedAcademyId(academyId);
        setSelectedAcademy(found);
      }
    },
    [academies, queryClient],
  );

  const clearAcademies = useCallback(() => {
    queryClient.clear();
    clearAcademyData();
    setAcademies([]);
    setSelectedAcademy(null);
    setError(null);
    hasFetchedRef.current = false;
  }, [queryClient]);

  const value = useMemo<StoreContextValue>(
    () => ({
      academies,
      selectedAcademy,
      isLoading,
      error,
      refreshAcademies,
      selectAcademy,
      clearAcademies,
    }),
    [academies, selectedAcademy, isLoading, error, refreshAcademies, selectAcademy, clearAcademies],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
