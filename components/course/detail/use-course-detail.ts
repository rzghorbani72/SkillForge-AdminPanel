'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import type { CourseDetail, CourseEnrollment, CoursePayment } from './types';

function unwrapList<T>(data: unknown, key: string): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>;
    const nested = record[key] ?? record.data;
    if (Array.isArray(nested)) return nested as T[];
  }
  return [];
}

export function useCourseDetail(courseId: string) {
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [courseLoading, setCourseLoading] = useState(true);
  const [payments, setPayments] = useState<CoursePayment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);

  const loadCourse = useCallback(async () => {
    try {
      const data = (await apiClient.getCourse(courseId)) as CourseDetail | null;
      setCourse(data);
    } catch {
      setCourse(null);
    } finally {
      setCourseLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (courseId) void loadCourse();
  }, [courseId, loadCourse]);

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

  return {
    course,
    courseLoading,
    payments,
    paymentsLoading,
    enrollments,
    refreshCourse: loadCourse
  };
}
