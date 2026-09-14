'use client';

import { useCallback, useEffect, useState } from 'react';

import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import type {
  ClassSession,
  CourseTopic,
  TutoringAttendanceStatus,
  TutoringEngagement,
} from '@/types/learning-operations';

/**
 * One 1:1 engagement as its tutor runs it: the student, the timetable and the
 * syllabus in one load. Every write reloads the timetable so the rows the
 * student will see are the rows the teacher sees.
 */
export function useEngagementClass(engagementId: string) {
  const { t } = useTranslation();
  const [engagement, setEngagement] = useState<TutoringEngagement | null>(null);
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [topics, setTopics] = useState<CourseTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadSessions = useCallback(async () => {
    setSessions(await apiClient.getEngagementSessions(engagementId));
  }, [engagementId]);

  useEffect(() => {
    if (!engagementId) return;
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      try {
        const all = await apiClient.getTutoringEngagements();
        const found = all.find((row) => row.id === engagementId) ?? null;
        if (cancelled) return;
        setEngagement(found);
        if (!found) return;
        const [rows, courseTopics] = await Promise.all([
          apiClient.getEngagementSessions(engagementId),
          apiClient.getCourseTopics(found.course_id),
        ]);
        if (cancelled) return;
        setSessions(rows);
        setTopics(courseTopics);
      } catch (error) {
        ErrorHandler.handleApiError(error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [engagementId]);

  const replaceSession = useCallback(
    (updated: ClassSession) =>
      setSessions((rows) => rows.map((row) => (row.id === updated.id ? updated : row))),
    [],
  );

  const run = useCallback(
    async (action: () => Promise<void>) => {
      setSaving(true);
      try {
        await action();
        await loadSessions();
      } catch (error) {
        ErrorHandler.handleApiError(error);
      } finally {
        setSaving(false);
      }
    },
    [loadSessions],
  );

  const schedule = (form: {
    starts_at: string;
    ends_at: string;
    timezone: string;
    meeting_url: string;
    notes: string;
  }) =>
    run(async () => {
      await apiClient.scheduleTutoringSession({
        engagement_id: engagementId,
        starts_at: new Date(form.starts_at).toISOString(),
        ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : undefined,
        timezone: form.timezone,
        meeting_url: form.meeting_url || undefined,
        notes: form.notes || undefined,
      });
    });

  const cancelSession = (session: ClassSession) =>
    run(async () => {
      await apiClient.cancelTutoringSession(session.id, {
        reason: t('tutoring.cancelReasonDefault'),
      });
    });

  const markAttendance = (session: ClassSession, status: TutoringAttendanceStatus) =>
    run(async () => {
      if (!engagement) return;
      await apiClient.markTutoringAttendance(session.id, {
        profile_id: engagement.student_profile_id,
        status,
      });
    });

  return {
    engagement,
    sessions,
    topics,
    isLoading,
    saving,
    replaceSession,
    schedule,
    cancelSession,
    markAttendance,
  };
}
