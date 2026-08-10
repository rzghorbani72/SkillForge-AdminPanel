'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import type { CourseEnrollment, CoursePayment } from './types';

function unwrapList<T>(data: unknown, key: string): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>;
    const nested = record[key] ?? record.data;
    if (Array.isArray(nested)) return nested as T[];
  }
  return [];
}

/**
 * Overview-only data. The course itself comes from the course layout via
 * `useCourseWorkspace`, so it is not refetched on every tab switch.
 */
export function useCourseDetail(courseId: string) {
  const [payments, setPayments] = useState<CoursePayment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);

  useEffect(() => {
    if (!courseId) return;
    const load = async () => {
      setPaymentsLoading(true);
      try {
        const data = await apiClient.getPayments({
          course_id: courseId,
          status: 'PAID',
          limit: 500
        });
        setPayments(unwrapList<CoursePayment>(data, 'payments'));
      } catch {
        setPayments([]);
      } finally {
        setPaymentsLoading(false);
      }
    };
    void load();
  }, [courseId]);

  useEffect(() => {
    if (!courseId) return;
    const load = async () => {
      try {
        const data = await apiClient.getEnrollments({
          course_id: courseId,
          limit: 10
        });
        setEnrollments(unwrapList<CourseEnrollment>(data, 'enrollments'));
      } catch {
        setEnrollments([]);
      }
    };
    void load();
  }, [courseId]);

  return { payments, paymentsLoading, enrollments };
}
