'use client';

import { useCallback, useEffect, useState } from 'react';

import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import type { Course } from '@/types/api';
import type {
  CourseTopic,
  TutoringGroup,
  TutoringOffer
} from '@/types/learning-operations';

export interface LiveCourseData {
  course: Course | null;
  topics: CourseTopic[];
  offers: TutoringOffer[];
  groups: TutoringGroup[];
}

const EMPTY: LiveCourseData = {
  course: null,
  topics: [],
  offers: [],
  groups: []
};

/**
 * Everything the live course page edits, loaded in one pass. The four calls are
 * independent, so one failing list never blanks the whole page.
 */
export function useLiveCourse(courseId: string) {
  const [data, setData] = useState<LiveCourseData>(EMPTY);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!courseId) return;
    setIsLoading(true);
    try {
      const [course, topics, offers, groups] = await Promise.all([
        apiClient.getCourse(courseId),
        apiClient.getCourseTopics(courseId).catch(() => []),
        apiClient.getTutoringOffers({ course_id: courseId }).catch(() => []),
        apiClient.getTutoringGroups({ course_id: courseId }).catch(() => [])
      ]);
      setData({ course: course ?? null, topics, offers, groups });
    } catch (err) {
      ErrorHandler.handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    void load();
  }, [load]);

  const patch = useCallback(
    (next: Partial<LiveCourseData>) =>
      setData((current) => ({ ...current, ...next })),
    []
  );

  return { ...data, isLoading, reload: load, patch };
}
