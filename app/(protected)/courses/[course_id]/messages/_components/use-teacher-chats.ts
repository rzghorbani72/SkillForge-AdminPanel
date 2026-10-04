'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';

export type TeacherChatParent =
  | { course_id: string; student_profile_id: string }
  | { engagement_id: string };

export interface TeacherChatThread {
  thread_id: string;
  parent: TeacherChatParent;
  class_title: string | null;
  message_count: number;
  pending_grades: number;
  last_message: { body: string; created_at: string; from_student: boolean } | null;
}

export interface StudentTeacherChats {
  student: { id: string; display_name: string | null };
  last_activity_at: string;
  threads: TeacherChatThread[];
}

export function useTeacherChats(courseId: string) {
  const [students, setStudents] = useState<StudentTeacherChats[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    setFailed(false);
    try {
      setStudents(await apiClient.getCourseTeacherChats<StudentTeacherChats[]>(courseId));
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { students, loading, failed, reload: load };
}
