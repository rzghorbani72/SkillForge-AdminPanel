'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ClipboardList } from 'lucide-react';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NumberInput } from '@/components/ui/number-input';
import { Textarea } from '@/components/ui/textarea';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { logger } from '@/lib/logging/app-logger';
import type { LearningAssignment } from '@/types/learning-operations';
import { LessonSubmissionsList } from './lesson-submissions-list';

/** A course assignment sits on one lesson or closes a whole season. */
export interface AssignmentParent {
  kind: 'lesson' | 'season';
  id: string;
}

interface Props {
  parent: AssignmentParent;
  courseId: string;
}

const TEXT_KEYS = {
  lesson: { title: 'courses.live.homeworkForLesson', hint: 'courses.live.homeworkLessonHint' },
  season: { title: 'courses.live.homeworkForSeason', hint: 'courses.live.homeworkSeasonHint' },
} as const;

export function LessonAssignmentEditor({ parent, courseId }: Props) {
  const { kind, id } = parent;
  const parentKey = useMemo(
    () => (kind === 'lesson' ? { lesson_id: id } : { season_id: id }),
    [kind, id],
  );
  const { t } = useTranslation();
  const [assignment, setAssignment] = useState<LearningAssignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [maxScore, setMaxScore] = useState(100);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const { assignments } = await apiClient.getAssignments({ ...parentKey, limit: 1 });
      const existing = assignments[0] ?? null;
      setAssignment(existing);
      if (existing) {
        setTitle(existing.title);
        setDescription(existing.description ?? '');
        setDueDate(existing.due_date ?? '');
        setMaxScore(existing.max_score);
      }
    } catch (err) {
      ErrorHandler.handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  }, [parentKey]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    if (!title.trim()) {
      setError(t('courses.live.homeworkTitleRequired'));
      return;
    }
    setError(null);
    setIsSaving(true);
    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      due_date: dueDate ? new Date(dueDate).toISOString() : undefined,
      max_score: maxScore,
    };
    try {
      const saved = assignment
        ? await apiClient.updateAssignment(assignment.id, payload)
        : await apiClient.createAssignment({ ...parentKey, ...payload });
      logger.ok('Assignments', 'CourseAssignmentSaved', {
        parent_kind: kind,
        parent_id: id,
        assignment_id: saved.id,
      });
      toast.success(t('courses.live.homeworkSaved'));
      await load();
    } catch (err) {
      ErrorHandler.handleApiError(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <p className="text-sm text-muted-foreground">{t('common.loading')}</p>;

  return (
    <>
      <Card className="border-dashed">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardList className="h-4 w-4" />
            {t(TEXT_KEYS[kind].title)}
          </CardTitle>
          <CardDescription>{t(TEXT_KEYS[kind].hint)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="lesson-homework-title">{t('courses.live.homeworkTitle')} *</Label>
              <Input
                id="lesson-homework-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lesson-homework-due">{t('courses.live.homeworkDue')}</Label>
              <DatePicker id="lesson-homework-due" value={dueDate} onChange={setDueDate} />
              <p className="text-xs text-muted-foreground">{t('courses.live.homeworkDueHint')}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lesson-homework-score">{t('courses.live.homeworkMaxScore')}</Label>
              <NumberInput
                id="lesson-homework-score"
                value={maxScore}
                min={1}
                max={1000}
                onChange={(raw) => setMaxScore(Number(raw) || 100)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="lesson-homework-description">
                {t('courses.live.homeworkDescription')}
              </Label>
              <Textarea
                id="lesson-homework-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <div className="flex items-center justify-between gap-2">
            <Button type="button" onClick={save} disabled={isSaving}>
              {isSaving ? t('common.saving') : t('common.save')}
            </Button>
            {assignment ? (
              <Button asChild variant="outline" size="sm">
                <Link href={`/assignments?course_id=${courseId}`}>
                  {t('courses.live.homeworkSubmissions')}
                </Link>
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
      {assignment ? <LessonSubmissionsList assignment={assignment} /> : null}
    </>
  );
}
