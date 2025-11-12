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
          const payload = coursesResponse.value as any;
          const list = Array.isArray(payload?.courses)
            ? (payload.courses as Course[])
            : Array.isArray(payload)
              ? (payload as Course[])
              : [];
          setCourses(list);
        } else {
          console.error('Failed to fetch courses:', coursesResponse.reason);
          setCourses([]);
        }

        if (enrollmentsResponse.status === 'fulfilled') {
          const payload = enrollmentsResponse.value as any;
          const list = Array.isArray(payload)
            ? (payload as Enrollment[])
            : Array.isArray(payload?.data)
              ? (payload.data as Enrollment[])
              : [];
          setEnrollments(list);
        } else {
          console.error(
            'Failed to fetch enrollments:',
            enrollmentsResponse.reason
          );
          setEnrollments([]);
        }

        if (paymentsResponse.status === 'fulfilled') {
          const payload = paymentsResponse.value as any;
          const list = Array.isArray(payload)
            ? (payload as Payment[])
            : Array.isArray(payload?.data)
              ? (payload.data as Payment[])
              : [];
          setPayments(list);
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
