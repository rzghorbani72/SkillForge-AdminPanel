'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ImageIcon, PenLine } from 'lucide-react';

import { GradeSubmissionDialog } from '@/components/assignments/grade-submission-dialog';
import { SubmissionStatusBadge } from '@/components/assignments/submission-status-badge';
import { DataList, type DataColumn } from '@/components/shared/data-list/data-list';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import type { AssignmentSubmission, LearningAssignment } from '@/types/learning-operations';

interface Props {
  assignment: Pick<LearningAssignment, 'id' | 'max_score'>;
}

/** Every student's answer and score for one lesson's assignment, graded in place. */
export function LessonSubmissionsList({ assignment }: Props) {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [grading, setGrading] = useState<AssignmentSubmission | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getSubmissions({ assignment_id: assignment.id, limit: 100 });
      setSubmissions(data?.submissions ?? []);
    } catch (e) {
      ErrorHandler.handleApiError(e);
    } finally {
      setIsLoading(false);
    }
  }, [assignment.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const scoreText = useCallback(
    (sub: AssignmentSubmission) =>
      sub.score != null
        ? `${formatNumber(sub.score)} / ${formatNumber(assignment.max_score)}`
        : t('assignmentsPage.notAvailable'),
    [assignment.max_score, formatNumber, t],
  );

  const gradeButton = useCallback(
    (sub: AssignmentSubmission) => (
      <Button size="sm" variant="outline" onClick={() => setGrading(sub)}>
        <PenLine className="me-1 h-3 w-3" />
        {sub.status === 'GRADED' ? t('assignmentsPage.editGrade') : t('assignmentsPage.grade')}
      </Button>
    ),
    [t],
  );

  const columns = useMemo<DataColumn<AssignmentSubmission>[]>(
    () => [
      {
        id: 'student',
        header: t('assignmentsPage.student'),
        cell: (sub) => sub.Profile?.display_name ?? t('assignmentsPage.notAvailable'),
      },
      {
        id: 'status',
        header: t('assignmentsPage.status'),
        cell: (sub) => (
          <div className="flex items-center gap-2">
            <SubmissionStatusBadge status={sub.status} />
            {sub.is_late ? <Badge variant="outline">{t('assignmentsPage.late')}</Badge> : null}
            {sub.image_ids?.length ? (
              <ImageIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            ) : null}
          </div>
        ),
      },
      { id: 'score', header: t('assignmentsPage.score'), cell: scoreText },
      { id: 'action', header: t('assignmentsPage.action'), align: 'end', cell: gradeButton },
    ],
    [t, scoreText, gradeButton],
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t('assignmentsPage.lessonSubmissionsTitle')}</CardTitle>
        <CardDescription>{t('assignmentsPage.lessonSubmissionsHint')}</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <DataList
          items={submissions}
          columns={columns}
          rowKey={(sub) => sub.id}
          isLoading={isLoading}
          loadingRows={3}
          emptyState={
            <p className="p-5 text-sm text-muted-foreground">
              {t('assignmentsPage.noSubmissionsYet')}
            </p>
          }
          renderCard={(sub) => (
            <div className="flex h-full flex-col gap-3 rounded-lg border p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">
                  {sub.Profile?.display_name ?? t('assignmentsPage.notAvailable')}
                </span>
                <SubmissionStatusBadge status={sub.status} />
              </div>
              <p className="text-sm">
                {t('assignmentsPage.score')}: {scoreText(sub)}
              </p>
              <div className="mt-auto">{gradeButton(sub)}</div>
            </div>
          )}
        />
      </CardContent>
      <GradeSubmissionDialog
        submission={grading}
        onClose={() => setGrading(null)}
        onGraded={() => void load()}
      />
    </Card>
  );
}
