'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useStore } from '@/hooks/useStore';
import { Academy, User } from '@/types/api';

interface SettingsSnapshot {
  user: User | null;
  academy: Academy | null;
  isLoading: boolean;
  refresh: () => void;
}

export function useSettingsData(): SettingsSnapshot {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [refreshToken, setRefreshToken] = useState(0);
  const {
    selectedAcademy,
    academies,
    isLoading: isLoadingAcademies,
    refreshAcademies,
  } = useStore();

  const refresh = useCallback(() => {
    setRefreshToken(Date.now());
    void refreshAcademies();
  }, [refreshAcademies]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setIsLoadingUser(true);
        const userResult = await apiClient.getCurrentUser();
        if (!isMounted) return;
        setUser(((userResult as { data?: User })?.data as User) ?? null);
      } catch (error) {
        console.error('Failed to load current user', error);
        ErrorHandler.handleApiError(error);
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setIsLoadingUser(false);
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, [refreshToken]);

  const academy = selectedAcademy ?? academies[0] ?? null;

  return useMemo(
    () => ({
      user,
      academy,
      isLoading: isLoadingUser || isLoadingAcademies,
      refresh,
    }),
    [user, academy, isLoadingUser, isLoadingAcademies, refresh],
  );
}
