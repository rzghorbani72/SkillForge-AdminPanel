'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { School } from '@/types/api';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import {
  getSelectedSchoolId,
  setSelectedSchoolId,
  getCachedSchools,
  setCachedSchools,
  getSelectedSchool,
  clearSchoolData,
  validateSchoolSelection,
  autoSelectSchool
} from '@/lib/school-utils';

interface UseSchoolReturn {
  schools: School[];
  selectedSchool: School | null;
  isLoading: boolean;
  error: string | null;
  refreshSchools: () => Promise<void>;
  selectSchool: (schoolId: number) => void;
  clearSchools: () => void;
}

export function useSchool(): UseSchoolReturn {
  const router = useRouter();
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load schools on mount
  useEffect(() => {
    loadSchools();
  }, []);

  // Update selected school when schools change
  useEffect(() => {
    if (schools.length > 0) {
      const validSchool = autoSelectSchool(schools);
      setSelectedSchool(validSchool);
    } else {
      setSelectedSchool(null);
    }
  }, [schools]);

  const loadSchools = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Try to load from cache first
      const cachedSchools = getCachedSchools();

      if (cachedSchools.length > 0) {
        setSchools(cachedSchools);
        setIsLoading(false);

        // Still fetch fresh data in background
        fetchFreshSchools();
        return;
      }

      // No cache, fetch from API
      await fetchFreshSchools();
    } catch (error) {
      console.error('Error loading schools:', error);
      setError('Failed to load schools');
      setIsLoading(false);
    }
  }, []);

  const fetchFreshSchools = useCallback(async () => {
    try {
      const response = await apiClient.getMySchools();

      // Handle the API response format: { message, status: "ok", data: [...] }
      if (
        response.data &&
        (response.data as any).status === 'ok' &&
        (response.data as any).data
      ) {
        const schoolsData: School[] = (response.data as any).data;
        setSchools(schoolsData);
        setCachedSchools(schoolsData);
      } else if (Array.isArray(response.data)) {
        // Fallback for direct array response
        const schoolsData: School[] = response.data;
        setSchools(schoolsData);
        setCachedSchools(schoolsData);
      } else {
        console.error('Unexpected response structure:', response.data);
        setError('Invalid response structure from server');
        return;
      }
    } catch (error) {
      console.error('Error fetching schools:', error);
      setError('Failed to fetch schools');

      // If it's an authentication error, redirect to login
      if (error instanceof Error && error.message.includes('401')) {
        clearSchoolData();
        router.push('/login');
      }
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const refreshSchools = useCallback(async () => {
    await fetchFreshSchools();
  }, [fetchFreshSchools]);

  const selectSchool = useCallback(
    (schoolId: number) => {
      const school = schools.find((s) => s.id === schoolId);
      if (school) {
        setSelectedSchoolId(schoolId);
        setSelectedSchool(school);
      }
    },
    [schools]
  );

  const clearSchools = useCallback(() => {
    clearSchoolData();
    setSchools([]);
    setSelectedSchool(null);
    setError(null);
  }, []);

  return {
    schools,
    selectedSchool,
    isLoading,
    error,
    refreshSchools,
    selectSchool,
    clearSchools
  };
}

/**
 * Hook to get the current selected school ID
 */
export function useSelectedSchoolId(): number | null {
  const [schoolId, setSchoolId] = useState<number | null>(null);

  useEffect(() => {
    setSchoolId(getSelectedSchoolId());
  }, []);

  return schoolId;
}

/**
 * Hook to check if user has school access
 */
export function useSchoolAccess(): {
  hasAccess: boolean;
  isLoading: boolean;
  error: string | null;
} {
  const { schools, isLoading, error } = useSchool();

  return {
    hasAccess: schools.length > 0,
    isLoading,
    error
  };
}
