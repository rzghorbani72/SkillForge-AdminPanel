'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { useTranslation } from '@/lib/i18n/hooks';
import type { Enrollment } from '@/types/api';
import type {
  AssignmentSubmission,
  LearningActivity,
  LearningSummaryEnrollment
} from '@/types/learning-operations';
import { StudentLearningPanel } from './student-learning-panel';

/**
 * Self-contained learning block for the user details page.
 * Failures here must not blank the profile above — soft-fail to empty state.
 */
export function StudentLearningSection({ profileId }: { profileId: string }) {
  const { t } = useTranslation();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [summaryEnrollments, setSummaryEnrollments] = useState<
    LearningSummaryEnrollment[]
  >([]);
  const [timeline, setTimeline] = useState<LearningActivity[]>([]);
  const [learningUnavailable, setLearningUnavailable] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!profileId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const enrollmentResponse = await apiClient.getEnrollments({
        profile_id: profileId,
        page: 1,
        limit: 100
      });
      const studentEnrollments = enrollmentResponse.enrollments ?? [];
      setEnrollments(studentEnrollments);

      const submissionResults = await Promise.allSettled(
        studentEnrollments.map((enrollment) =>
          apiClient.getSubmissions({
            enrollment_id: Number(enrollment.id),
            page: 1,
            limit: 100
          })
        )
      );
      setSubmissions(
        submissionResults.flatMap((result) =>
          result.status === 'fulfilled' ? result.value.submissions : []
        )
      );

      const [summaryResult, timelineResult] = await Promise.allSettled([
        apiClient.getLearningSummary({ profile_id: profileId }),
        apiClient.getLearningTimeline({
          profile_id: profileId,
          page: 1,
          limit: 30
        })
      ]);

      if (summaryResult.status === 'fulfilled') {
        setSummaryEnrollments(summaryResult.value.enrollments ?? []);
        setLearningUnavailable(false);
      } else {
        setSummaryEnrollments([]);
        setLearningUnavailable(true);
      }

      if (timelineResult.status === 'fulfilled') {
        setTimeline(timelineResult.value.activities ?? []);
      } else {
        setTimeline([]);
        setLearningUnavailable(true);
      }
    } catch {
      setEnrollments([]);
      setSubmissions([]);
      setSummaryEnrollments([]);
      setTimeline([]);
      setLearningUnavailable(true);
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex min-h-32 items-center justify-center rounded-xl border bg-card">
        <span className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">
        {t('learningOperations.workspace')}
      </h2>
      <StudentLearningPanel
        enrollments={enrollments}
        submissions={submissions}
        summaryEnrollments={summaryEnrollments}
        timeline={timeline}
        learningUnavailable={learningUnavailable}
      />
    </div>
  );
}
