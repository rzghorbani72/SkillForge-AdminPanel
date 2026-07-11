'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import type { OpsQueueResponse } from '@/types/learning-operations';
import { toast } from 'react-toastify';

const EMPTY_QUEUE: OpsQueueResponse = {
  overdue_grading: [],
  inactivity: [],
  low_scores: [],
  missed_classes: [],
  unanswered_threads: []
};

export function useOpsQueue(featureEnabled: boolean | null) {
  const { t } = useTranslation();
  const [queue, setQueue] = useState<OpsQueueResponse>(EMPTY_QUEUE);
  const [loading, setLoading] = useState(false);
  const [courseId, setCourseId] = useState('');
  const [inactiveDays, setInactiveDays] = useState('14');
  const [lowScoreThreshold, setLowScoreThreshold] = useState('50');
  const [noteProfileId, setNoteProfileId] = useState('');
  const [noteText, setNoteText] = useState('');
  const [followUpAt, setFollowUpAt] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const isFetchingRef = useRef(false);

  const loadQueue = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setLoading(true);
    try {
      const data = await apiClient.getLearningOpsQueue({
        course_id: courseId.trim() || undefined,
        inactive_days: Number(inactiveDays) || undefined,
        low_score_threshold: Number(lowScoreThreshold) || undefined
      });
      setQueue({
        ...EMPTY_QUEUE,
        ...data,
        unanswered_threads: data.unanswered_threads ?? []
      });
    } catch (error) {
      ErrorHandler.handleApiError(error);
      setQueue(EMPTY_QUEUE);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [courseId, inactiveDays, lowScoreThreshold]);

  useEffect(() => {
    if (featureEnabled) {
      void loadQueue();
    }
  }, [featureEnabled, loadQueue]);

  const saveInterventionNote = useCallback(async () => {
    if (!noteProfileId.trim() || !noteText.trim()) {
      toast.error(t('opsQueue.noteRequired'));
      return;
    }
    setSavingNote(true);
    try {
      await apiClient.createInterventionNote({
        profile_id: noteProfileId.trim(),
        note: noteText.trim(),
        follow_up_at: followUpAt
          ? new Date(followUpAt).toISOString()
          : undefined,
        course_id: courseId.trim() || undefined
      });
      toast.success(t('opsQueue.noteSaved'));
      setNoteText('');
      setFollowUpAt('');
      await loadQueue();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setSavingNote(false);
    }
  }, [courseId, followUpAt, loadQueue, noteProfileId, noteText, t]);

  return {
    queue,
    loading,
    courseId,
    setCourseId,
    inactiveDays,
    setInactiveDays,
    lowScoreThreshold,
    setLowScoreThreshold,
    noteProfileId,
    setNoteProfileId,
    noteText,
    setNoteText,
    followUpAt,
    setFollowUpAt,
    savingNote,
    loadQueue,
    saveInterventionNote
  };
}
