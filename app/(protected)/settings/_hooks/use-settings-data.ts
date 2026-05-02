'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { Academy, User } from '@/types/api';

interface SettingsSnapshot {
  user: User | null;
  academy: Academy | null;
  isLoading: boolean;
  refresh: () => void;
}

export function useSettingsData(): SettingsSnapshot {
  const [user, setUser] = useState<User | null>(null);
  const [academy, setAcademy] = useState<Academy | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshToken, setRefreshToken] = useState<number>(0);

  const refresh = useCallback(() => {
    setRefreshToken(Date.now());
  }, []);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setIsLoading(true);

        const [userResult, academiesResult] = await Promise.allSettled([
          apiClient.getCurrentUser(),
          apiClient.getMyAcademies()
        ]);

        if (!isMounted) return;

        if (userResult.status === 'fulfilled') {
          setUser(((userResult.value as any)?.data as User) ?? null);
        } else {
          console.error('Failed to load current user', userResult.reason);
          setUser(null);
        }

        if (academiesResult.status === 'fulfilled') {
          const raw = academiesResult.value as any;
          const payload = raw?.data;

          let academies: Academy[] = [];

          if (payload?.status === 'ok' && Array.isArray(payload?.data)) {
            academies = payload.data as Academy[];
          } else if (Array.isArray(payload)) {
            academies = payload as Academy[];
          } else if (Array.isArray(raw)) {
            academies = raw as Academy[];
          }

          setAcademy(academies.length > 0 ? academies[0] : null);
        } else {
          console.error('Failed to load academies', academiesResult.reason);
          setAcademy(null);
        }
      } catch (error) {
        console.error('Error loading settings data', error);
        ErrorHandler.handleApiError(error);
        if (isMounted) {
          setUser(null);
          setAcademy(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [refreshToken]);

  return useMemo(
    () => ({
      user,
      academy,
      isLoading,
      refresh
    }),
    [user, academy, isLoading, refresh]
  );
}
