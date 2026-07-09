'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/lib/api';
import { Course, Enrollment, Payment } from '@/types/api';
import { ErrorHandler } from '@/lib/error-handler';

export interface AnalyticsSnapshots {
  courses: Course[];
  enrollments: Enrollment[];
  payments: Payment[];
  isLoading: boolean;
  refresh: () => void;
}

function normalizeList<T>(payload: unknown, key?: string): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (typeof payload !== 'object' || payload === null) return [];

  if (key && key in payload) {
    const keyedValue = (payload as Record<string, unknown>)[key];
    return Array.isArray(keyedValue) ? (keyedValue as T[]) : [];
  }

  if ('data' in payload) {
    const data = (payload as Record<string, unknown>).data;
    return Array.isArray(data) ? (data as T[]) : [];
  }

  return [];
}

export function useAnalyticsData(): AnalyticsSnapshots {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshToken, setRefreshToken] = useState<number>(0);

  const refresh = useCallback(() => {
    setRefreshToken(Date.now());
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setIsLoading(true);

        const [coursesResponse, enrollmentsResponse, paymentsResponse] =
          await Promise.allSettled([
            apiClient.getCourses(),
            apiClient.getRecentEnrollments(),
            apiClient.getRecentPayments()
          ]);

        if (!isMounted) return;

        if (coursesResponse.status === 'fulfilled') {
          setCourses(normalizeList<Course>(coursesResponse.value, 'courses'));
        } else {
          console.error('Failed to fetch courses:', coursesResponse.reason);
          setCourses([]);
        }

        if (enrollmentsResponse.status === 'fulfilled') {
          setEnrollments(
            normalizeList<Enrollment>(enrollmentsResponse.value, 'enrollments')
          );
        } else {
          console.error(
            'Failed to fetch enrollments:',
            enrollmentsResponse.reason
          );
          setEnrollments([]);
        }

        if (paymentsResponse.status === 'fulfilled') {
          setPayments(
            normalizeList<Payment>(paymentsResponse.value, 'payments')
          );
        } else {
          console.error('Failed to fetch payments:', paymentsResponse.reason);
          setPayments([]);
        }
      } catch (error) {
        console.error('Error loading analytics data:', error);
        ErrorHandler.handleApiError(error);
        if (isMounted) {
          setCourses([]);
          setEnrollments([]);
          setPayments([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [refreshToken]);

  return useMemo(
    () => ({
      courses,
      enrollments,
      payments,
      isLoading,
      refresh
    }),
    [courses, enrollments, payments, isLoading, refresh]
  );
}
