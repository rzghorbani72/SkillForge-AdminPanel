'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { useTranslation } from '@/lib/i18n/hooks';
import type { Enrollment, User } from '@/types/api';
import type {
  AssignmentSubmission,
  LearningActivity,
  LearningSummaryEnrollment
} from '@/types/learning-operations';
import { StudentWorkspace } from '@/components/students/student-workspace';
import { ErrorHandler } from '@/lib/error-handler';

function resolveStudentProfileId(user: User): string | null {
  const profiles = user.profiles ?? [];
  const studentProfile = profiles.find(
    (profile) =>
      profile.role?.name === 'STUDENT' || profile.Role?.name === 'STUDENT'
  );
  if (studentProfile?.id != null) return String(studentProfile.id);
  if (profiles[0]?.id != null) return String(profiles[0].id);
  return null;
}

export default function StudentWorkspacePage() {
  const { student_id: studentId } = useParams<{ student_id: string }>();
  const { t } = useTranslation();
  const [student, setStudent] = useState<User | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [summaryEnrollments, setSummaryEnrollments] = useState<
    LearningSummaryEnrollment[]
  >([]);
  const [timeline, setTimeline] = useState<LearningActivity[]>([]);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [learningUnavailable, setLearningUnavailable] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadWorkspace = useCallback(async () => {
    if (!studentId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [user, enrollmentResponse] = await Promise.all([
        apiClient.getUser(studentId),
        apiClient.getEnrollments({ user_id: studentId, page: 1, limit: 100 })
      ]);
      const studentEnrollments = enrollmentResponse.enrollments ?? [];
      const resolvedProfileId = resolveStudentProfileId(user);
      setStudent(user);
      setEnrollments(studentEnrollments);
      setProfileId(resolvedProfileId);

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

      if (resolvedProfileId) {
        const [summaryResult, timelineResult] = await Promise.allSettled([
          apiClient.getLearningSummary({ profile_id: resolvedProfileId }),
          apiClient.getLearningTimeline({
            profile_id: resolvedProfileId,
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
      } else {
        setSummaryEnrollments([]);
        setTimeline([]);
        setLearningUnavailable(true);
      }
    } catch (error) {
      ErrorHandler.handleApiError(error);
      setStudent(null);
      setEnrollments([]);
      setSubmissions([]);
      setSummaryEnrollments([]);
      setTimeline([]);
      setProfileId(null);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        {t('learningOperations.studentUnavailable')}
      </div>
    );
  }

  return (
    <StudentWorkspace
      student={student}
      enrollments={enrollments}
      submissions={submissions}
      summaryEnrollments={summaryEnrollments}
      timeline={timeline}
      profileId={profileId}
      learningUnavailable={learningUnavailable}
    />
  );
}
