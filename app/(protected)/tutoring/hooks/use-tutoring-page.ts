'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import type {
  TutoringAttendanceStatus,
  TutoringEngagement,
  TutoringSession
} from '@/types/learning-operations';

export function useTutoringPage() {
  const { t } = useTranslation();
  const [engagements, setEngagements] = useState<TutoringEngagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [courseFilter, setCourseFilter] = useState('');
  const [lastSession, setLastSession] = useState<TutoringSession | null>(null);

  const [engagementForm, setEngagementForm] = useState({
    course_id: '',
    student_profile_id: '',
    tutor_profile_id: '',
    ends_at: ''
  });

  const [sessionForm, setSessionForm] = useState({
    engagement_id: '',
    starts_at: '',
    ends_at: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    meeting_url: '',
    notes: ''
  });

  const [rescheduleForm, setRescheduleForm] = useState({
    session_id: '',
    starts_at: '',
    ends_at: '',
    meeting_url: '',
    regenerate: false
  });

  const [attendanceForm, setAttendanceForm] = useState({
    session_id: '',
    profile_id: '',
    status: 'PRESENT' as TutoringAttendanceStatus
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const engagementsResponse = await apiClient.getTutoringEngagements(
        courseFilter ? { course_id: courseFilter } : undefined
      );
      setEngagements(engagementsResponse);
    } catch (error) {
      ErrorHandler.handleApiError(error);
      setEngagements([]);
    } finally {
      setLoading(false);
    }
  }, [courseFilter]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const activeEngagements = useMemo(
    () => engagements.filter((item) => item.status === 'ACTIVE'),
    [engagements]
  );

  const createEngagement = useCallback(async () => {
    if (
      !engagementForm.course_id ||
      !engagementForm.student_profile_id ||
      !engagementForm.tutor_profile_id
    ) {
      return;
    }
    setSaving(true);
    try {
      await apiClient.createTutoringEngagement({
        course_id: engagementForm.course_id,
        student_profile_id: engagementForm.student_profile_id,
        tutor_profile_id: engagementForm.tutor_profile_id,
        ends_at: engagementForm.ends_at || undefined
      });
      setEngagementForm({
        course_id: '',
        student_profile_id: '',
        tutor_profile_id: '',
        ends_at: ''
      });
      await loadData();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setSaving(false);
    }
  }, [engagementForm, loadData]);

  const scheduleSession = useCallback(async () => {
    if (!sessionForm.engagement_id || !sessionForm.starts_at) return;
    setSaving(true);
    try {
      const session = await apiClient.scheduleTutoringSession({
        engagement_id: sessionForm.engagement_id,
        starts_at: new Date(sessionForm.starts_at).toISOString(),
        ends_at: sessionForm.ends_at
          ? new Date(sessionForm.ends_at).toISOString()
          : undefined,
        timezone: sessionForm.timezone,
        meeting_url: sessionForm.meeting_url || undefined,
        notes: sessionForm.notes || undefined
      });
      setLastSession(session);
      setSessionForm((prev) => ({
        ...prev,
        starts_at: '',
        ends_at: '',
        meeting_url: '',
        notes: ''
      }));
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setSaving(false);
    }
  }, [sessionForm]);

  const rescheduleSession = useCallback(async () => {
    if (!rescheduleForm.session_id || !rescheduleForm.starts_at) return;
    setSaving(true);
    try {
      const session = await apiClient.rescheduleTutoringSession(
        rescheduleForm.session_id,
        {
          starts_at: new Date(rescheduleForm.starts_at).toISOString(),
          ends_at: rescheduleForm.ends_at
            ? new Date(rescheduleForm.ends_at).toISOString()
            : undefined,
          meeting_url: rescheduleForm.meeting_url || undefined,
          regenerate: rescheduleForm.regenerate
        }
      );
      setLastSession(session);
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setSaving(false);
    }
  }, [rescheduleForm]);

  const cancelSession = useCallback(
    async (sessionId: string) => {
      if (!sessionId) return;
      setSaving(true);
      try {
        const session = await apiClient.cancelTutoringSession(sessionId, {
          reason: t('tutoring.cancelReasonDefault')
        });
        setLastSession(session);
      } catch (error) {
        ErrorHandler.handleApiError(error);
      } finally {
        setSaving(false);
      }
    },
    [t]
  );

  const markAttendance = useCallback(async () => {
    if (!attendanceForm.session_id || !attendanceForm.profile_id) return;
    setSaving(true);
    try {
      await apiClient.markTutoringAttendance(attendanceForm.session_id, {
        profile_id: attendanceForm.profile_id,
        status: attendanceForm.status
      });
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setSaving(false);
    }
  }, [attendanceForm]);

  const setAttendanceSessionId = useCallback(async (sessionId: string) => {
    setAttendanceForm((prev) => ({ ...prev, session_id: sessionId }));

    if (!sessionId) {
      return;
    }

    try {
      const sessions = await apiClient.listTutoringSessions({
        search: sessionId,
        limit: 5
      });
      const match = sessions.find((session) => session.id === sessionId);
      if (match?.Student?.id) {
        setAttendanceForm((prev) => ({
          ...prev,
          session_id: sessionId,
          profile_id: match.Student?.id ?? prev.profile_id
        }));
      }
    } catch {
      // Keep session id even if profile pre-fill fails.
    }
  }, []);

  return {
    engagements,
    loading,
    saving,
    courseFilter,
    setCourseFilter,
    lastSession,
    engagementForm,
    setEngagementForm,
    sessionForm,
    setSessionForm,
    rescheduleForm,
    setRescheduleForm,
    attendanceForm,
    setAttendanceForm,
    activeEngagements,
    loadData,
    createEngagement,
    scheduleSession,
    rescheduleSession,
    cancelSession,
    markAttendance,
    setAttendanceSessionId
  };
}
