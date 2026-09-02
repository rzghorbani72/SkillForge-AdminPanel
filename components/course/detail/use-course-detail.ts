'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import type {
  CourseTopic,
  TutoringGroup,
  TutoringOffer
} from '@/types/learning-operations';
import type { CourseEnrollment, CoursePayment } from './types';

interface LiveOverviewData {
  topics: CourseTopic[];
  offers: TutoringOffer[];
  groups: TutoringGroup[];
  loading: boolean;
}

const EMPTY_LIVE: LiveOverviewData = {
  topics: [],
  offers: [],
  groups: [],
  // Starts true so a live course never flashes an empty "nothing set up yet"
  // before its first response lands.
  loading: true
};

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
export function useCourseDetail(courseId: string, isLive = false) {
  const [live, setLive] = useState<LiveOverviewData>(EMPTY_LIVE);
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

  // Only a live course has a timetable to summarise, so a recorded course never
  // pays for these three calls.
  useEffect(() => {
    if (!courseId || !isLive) {
      setLive({ ...EMPTY_LIVE, loading: false });
      return;
    }
    const load = async () => {
      setLive((current) => ({ ...current, loading: true }));
      const [topics, offers, groups] = await Promise.all([
        apiClient.getCourseTopics(courseId).catch(() => []),
        apiClient.getTutoringOffers({ course_id: courseId }).catch(() => []),
        apiClient.getTutoringGroups({ course_id: courseId }).catch(() => [])
      ]);
      setLive({ topics, offers, groups, loading: false });
    };
    void load();
  }, [courseId, isLive]);

  return { payments, paymentsLoading, enrollments, live };
}
