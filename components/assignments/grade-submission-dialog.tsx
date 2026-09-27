'use client';

import { useEffect, useState } from 'react';

import { DiscussionThread } from '@/components/discussion/discussion-thread';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { NumberInput } from '@/components/ui/number-input';
import { Textarea } from '@/components/ui/textarea';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import type { AssignmentSubmission } from '@/types/learning-operations';
import { AnswerImageGallery } from './answer-image-gallery';

interface Props {
  submission: AssignmentSubmission | null;
  onClose: () => void;
  onGraded: () => void;
}

export function GradeSubmissionDialog({ submission, onClose, onGraded }: Props) {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isGrading, setIsGrading] = useState(false);
  const maxScore = submission?.Assignment?.max_score;

  useEffect(() => {
    setScore(submission?.score != null ? String(submission.score) : '');
    setFeedback(submission?.feedback ?? '');
  }, [submission]);

  const handleGrade = async () => {
    const value = Number(score);
    if (!submission || maxScore === undefined) return;
    if (!Number.isFinite(value) || value < 0 || value > maxScore) return;
    setIsGrading(true);
    try {
      await apiClient.gradeSubmission(submission.id, {
        score: value,
        feedback: feedback || undefined,
      });
      onClose();
      onGraded();
    } catch (e) {
      ErrorHandler.handleApiError(e);
    } finally {
      setIsGrading(false);
    }
  };

  return (
    <Dialog open={submission != null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {t('assignmentsPage.gradeSubmission')}
            {submission?.Profile?.display_name ? ` — ${submission.Profile.display_name}` : ''}
          </DialogTitle>
        </DialogHeader>
        {submission ? (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              {submission.content ? (
                <div>
                  <Label>{t('assignmentsPage.studentAnswer')}</Label>
                  <div className="mt-1 max-h-40 overflow-hidden whitespace-pre-wrap rounded border bg-muted/50 p-3 text-sm">
                    {submission.content}
                  </div>
                </div>
              ) : null}
              {submission.image_ids?.length ? (
                <div className="space-y-1">
                  <Label>{t('assignmentsPage.answerImages')}</Label>
                  <AnswerImageGallery
                    submissionId={submission.id}
                    imageIds={submission.image_ids}
                  />
                </div>
              ) : null}
              {submission.file_url ? (
                <div>
                  <Label>{t('assignmentsPage.attachedFile')}</Label>
                  <a
                    href={submission.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 block text-sm text-blue-600 underline"
                  >
                    {t('assignmentsPage.viewFile')}
                  </a>
                </div>
              ) : null}
              <div>
                <Label htmlFor="grade-score">
                  {t('assignmentsPage.scoreMax', {
                    max:
                      maxScore != null ? formatNumber(maxScore) : t('assignmentsPage.notAvailable'),
                  })}
                </Label>
                <NumberInput id="grade-score" value={score} onChange={setScore} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="grade-feedback">{t('assignmentsPage.feedbackOptional')}</Label>
                <Textarea
                  id="grade-feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder={t('assignmentsPage.feedbackPlaceholder')}
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>
            <div className="rounded-lg border p-3">
              <DiscussionThread
                submissionId={submission.id}
                threadId={submission.discussion_thread_id}
              />
            </div>
          </div>
        ) : null}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleGrade} disabled={isGrading || !score || maxScore === undefined}>
            {isGrading ? t('common.saving') : t('assignmentsPage.saveGrade')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
