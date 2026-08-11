'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import type { Enrollment } from '@/types/api';
import type { ApiPagination } from '@/types/learning-operations';

export type EnrollmentStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';

export type EnrollmentStatusFilter = 'all' | EnrollmentStatus;

interface UseEnrollmentsParams {
  page: number;
  limit: number;
  status: EnrollmentStatusFilter;
  search: string;
}

interface UseEnrollmentsResult {
  enrollments: Enrollment[];
  pagination: ApiPagination | null;
  isLoading: boolean;
  refresh: () => void;
}

/**
 * Single source of enrolment data for the people hub: the enrolments tab and
 * the progress tab read the same list, so they must not drift apart.
 */
export function useEnrollments({
  page,
  limit,
  status,
  search
}: UseEnrollmentsParams): UseEnrollmentsResult {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [pagination, setPagination] = useState<ApiPagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEnrollments = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.getEnrollments({
        page,
        limit,
        status: status === 'all' ? undefined : status,
        search: search || undefined
      });
      setEnrollments(response.enrollments ?? []);
      setPagination(response.pagination ?? null);
    } catch (error) {
      ErrorHandler.handleApiError(error);
      setEnrollments([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, status, search]);

  useEffect(() => {
    void fetchEnrollments();
  }, [fetchEnrollments]);

  return { enrollments, pagination, isLoading, refresh: fetchEnrollments };
}

/**
 * Totals per status, each asked of the server as a one-row page. Counting the
 * loaded page instead would report "3 active" when the academy has hundreds.
 */
export function useEnrollmentTotals(): Record<
  'all' | EnrollmentStatus,
  number
> {
  const [totals, setTotals] = useState({
    all: 0,
    ACTIVE: 0,
    COMPLETED: 0,
    CANCELLED: 0,
    EXPIRED: 0
  });

  useEffect(() => {
    void (async () => {
      const totalOf = async (status?: EnrollmentStatus) => {
        const data = await apiClient.getEnrollments({ limit: 1, status });
        return data.pagination?.total ?? data.enrollments?.length ?? 0;
      };
      try {
        const [all, active, completed, cancelled, expired] = await Promise.all([
          totalOf(),
          totalOf('ACTIVE'),
          totalOf('COMPLETED'),
          totalOf('CANCELLED'),
          totalOf('EXPIRED')
        ]);
        setTotals({
          all,
          ACTIVE: active,
          COMPLETED: completed,
          CANCELLED: cancelled,
          EXPIRED: expired
        });
      } catch {
        // Non-critical: the list still renders without the header counts.
      }
    })();
  }, []);

  return totals;
}

/** Debounces raw typing so every keystroke does not hit the API. */
export function useDebouncedValue(value: string, delay = 400): string {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value.trim()), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
