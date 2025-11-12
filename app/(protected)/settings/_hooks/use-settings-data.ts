'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { User, School } from '@/types/api';

interface SettingsSnapshot {
  user: User | null;
  school: School | null;
  isLoading: boolean;
  refresh: () => void;
}

export function useSettingsData(): SettingsSnapshot {
  const [user, setUser] = useState<User | null>(null);
  const [school, setSchool] = useState<School | null>(null);
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

        const [userResult, schoolResult] = await Promise.allSettled([
          apiClient.getCurrentUser(),
          apiClient.getMySchools()
        ]);

        if (!isMounted) return;

        if (userResult.status === 'fulfilled') {
          setUser(userResult.value ?? null);
        } else {
          console.error('Failed to load current user', userResult.reason);
          setUser(null);
        }

        if (schoolResult.status === 'fulfilled') {
          const raw = schoolResult.value as any;
          const payload = raw?.data;

          let schools: School[] = [];

          if (payload?.status === 'ok' && Array.isArray(payload?.data)) {
            schools = payload.data as School[];
          } else if (Array.isArray(payload)) {
            schools = payload as School[];
          } else if (Array.isArray(raw)) {
            schools = raw as School[];
          }

          setSchool(schools.length > 0 ? schools[0] : null);
        } else {
          console.error('Failed to load schools', schoolResult.reason);
          setSchool(null);
        }
      } catch (error) {
        console.error('Error loading settings data', error);
        ErrorHandler.handleApiError(error);
        if (isMounted) {
          setUser(null);
          setSchool(null);
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
      school,
      isLoading,
      refresh
    }),
    [user, school, isLoading, refresh]
  );
}
