'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react';
import { apiClient } from '@/lib/api';
import type { CourseDetail } from './types';

type CourseWorkspaceValue = {
  courseId: string;
  course: CourseDetail | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

const CourseWorkspaceContext = createContext<CourseWorkspaceValue | null>(null);

/**
 * The course is fetched once in the course layout so the header, the tabs and
 * every child page read the same object. Without this the header and the page
 * would each request the same course on every tab switch.
 */
export function useCourseWorkspace(): CourseWorkspaceValue {
  const value = useContext(CourseWorkspaceContext);
  if (!value) {
    throw new Error('useCourseWorkspace must be used inside a course layout');
  }
  return value;
}

type CourseWorkspaceProviderProps = {
  courseId: string;
  children: ReactNode;
};

export function CourseWorkspaceProvider({
  courseId,
  children
}: CourseWorkspaceProviderProps) {
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = (await apiClient.getCourse(courseId)) as CourseDetail | null;
      setCourse(data);
    } catch {
      setCourse(null);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (courseId) void refresh();
  }, [courseId, refresh]);

  const value = useMemo(
    () => ({ courseId, course, loading, refresh }),
    [courseId, course, loading, refresh]
  );

  return (
    <CourseWorkspaceContext.Provider value={value}>
      {children}
    </CourseWorkspaceContext.Provider>
  );
}
