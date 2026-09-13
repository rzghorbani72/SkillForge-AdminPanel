'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import type { TutoringEngagement } from '@/types/learning-operations';

export function useTutoringPage() {
  const [engagements, setEngagements] = useState<TutoringEngagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [courseFilter, setCourseFilter] = useState('');
  const [engagementForm, setEngagementForm] = useState({
    course_id: '',
    student_profile_id: '',
    tutor_profile_id: '',
    ends_at: ''
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

  return {
    engagements,
    loading,
    saving,
    courseFilter,
    setCourseFilter,
    engagementForm,
    setEngagementForm,
    loadData,
    createEngagement
  };
}
