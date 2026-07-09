'use client';

import type { ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  Clock3,
  GraduationCap,
  MessageCircle,
  StickyNote,
  UserX
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import type { OpsQueueResponse } from '@/types/learning-operations';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-toastify';

const EMPTY_QUEUE: OpsQueueResponse = {
  overdue_grading: [],
  inactivity: [],
  low_scores: [],
  missed_classes: [],
  unanswered_threads: []
};

export default function OpsQueuePage() {
  const { t, language } = useTranslation();
  const isRtl = language === 'fa' || language === 'ar';
  const [queue, setQueue] = useState<OpsQueueResponse>(EMPTY_QUEUE);
  const [loading, setLoading] = useState(true);
  const [courseId, setCourseId] = useState('');
  const [inactiveDays, setInactiveDays] = useState('14');
  const [lowScoreThreshold, setLowScoreThreshold] = useState('50');
  const [noteProfileId, setNoteProfileId] = useState('');
  const [noteText, setNoteText] = useState('');
  const [followUpAt, setFollowUpAt] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const loadQueue = useCallback(async () => {
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
    }
  }, [courseId, inactiveDays, lowScoreThreshold]);

  useEffect(() => {
    void loadQueue();
  }, [loadQueue]);

  const saveInterventionNote = async () => {
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
  };

  return (
    <main
      className="space-y-6 p-4 sm:p-6"
      dir={isRtl ? 'rtl' : 'ltr'}
      aria-labelledby="ops-queue-title"
    >
      <div>
        <h1 id="ops-queue-title" className="text-3xl font-bold tracking-tight">
          {t('opsQueue.title')}
        </h1>
        <p className="text-muted-foreground">{t('opsQueue.description')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('opsQueue.filters')}</CardTitle>
          <CardDescription>{t('opsQueue.filtersDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="courseId">{t('opsQueue.courseId')}</Label>
            <Input
              id="courseId"
              value={courseId}
              onChange={(event) => setCourseId(event.target.value)}
              placeholder={t('opsQueue.courseIdPlaceholder')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inactiveDays">{t('opsQueue.inactiveDays')}</Label>
            <Input
              id="inactiveDays"
              type="number"
              min={1}
              value={inactiveDays}
              onChange={(event) => setInactiveDays(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lowScore">{t('opsQueue.lowScoreThreshold')}</Label>
            <Input
              id="lowScore"
              type="number"
              min={0}
              value={lowScoreThreshold}
              onChange={(event) => setLowScoreThreshold(event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={() => void loadQueue()} className="w-full">
              {t('opsQueue.refresh')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StickyNote className="h-4 w-4" />
            {t('opsQueue.interventionNote')}
          </CardTitle>
          <CardDescription>
            {t('opsQueue.interventionNoteDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="noteProfileId">{t('opsQueue.profile')}</Label>
            <Input
              id="noteProfileId"
              value={noteProfileId}
              onChange={(event) => setNoteProfileId(event.target.value)}
              placeholder={t('opsQueue.profileIdPlaceholder')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="followUpAt">{t('opsQueue.followUpAt')}</Label>
            <Input
              id="followUpAt"
              type="datetime-local"
              value={followUpAt}
              onChange={(event) => setFollowUpAt(event.target.value)}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="noteText">{t('opsQueue.note')}</Label>
            <Textarea
              id="noteText"
              value={noteText}
              onChange={(event) => setNoteText(event.target.value)}
              rows={3}
              placeholder={t('opsQueue.notePlaceholder')}
            />
          </div>
          <div className="md:col-span-2">
            <Button
              onClick={() => void saveInterventionNote()}
              disabled={savingNote}
            >
              {savingNote ? t('opsQueue.savingNote') : t('opsQueue.saveNote')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex min-h-40 items-center justify-center">
          <span className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <QueueCard
            title={t('opsQueue.overdueGrading')}
            description={t('opsQueue.overdueGradingDescription')}
            icon={<Clock3 className="h-4 w-4" />}
            count={queue.overdue_grading.length}
            empty={t('opsQueue.empty')}
          >
            {queue.overdue_grading.map((item) => (
              <div
                key={String(item.id)}
                className="rounded-lg border p-3 text-sm"
              >
                <p className="font-medium">
                  {item.Assignment?.title ?? t('assignmentsPage.notAvailable')}
                </p>
                <p className="text-muted-foreground">
                  {t('opsQueue.profile')}: {item.profile_id}
                </p>
                <p className="text-muted-foreground">
                  {item.submitted_at
                    ? new Date(item.submitted_at).toLocaleString(language)
                    : '—'}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 h-auto px-0"
                  onClick={() => setNoteProfileId(item.profile_id)}
                >
                  {t('opsQueue.useForNote')}
                </Button>
              </div>
            ))}
          </QueueCard>

          <QueueCard
            title={t('opsQueue.inactivity')}
            description={t('opsQueue.inactivityDescription')}
            icon={<AlertTriangle className="h-4 w-4" />}
            count={queue.inactivity.length}
            empty={t('opsQueue.empty')}
          >
            {queue.inactivity.map((item) => (
              <div key={item.id} className="rounded-lg border p-3 text-sm">
                <p className="font-medium">
                  {t('opsQueue.profile')}: {item.profile_id}
                </p>
                <p className="text-muted-foreground">
                  {t('opsQueue.courseId')}: {item.course_id}
                </p>
                <p className="text-muted-foreground">
                  {t('learningOperations.lastAccessed')}:{' '}
                  {item.last_accessed
                    ? new Date(item.last_accessed).toLocaleString(language)
                    : '—'}
                </p>
                {typeof item.progress_percent === 'number' && (
                  <Badge variant="outline">{item.progress_percent}%</Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 h-auto px-0"
                  onClick={() => setNoteProfileId(item.profile_id)}
                >
                  {t('opsQueue.useForNote')}
                </Button>
              </div>
            ))}
          </QueueCard>

          <QueueCard
            title={t('opsQueue.lowScores')}
            description={t('opsQueue.lowScoresDescription')}
            icon={<GraduationCap className="h-4 w-4" />}
            count={queue.low_scores.length}
            empty={t('opsQueue.empty')}
          >
            {queue.low_scores.map((item) => (
              <div
                key={String(item.id)}
                className="rounded-lg border p-3 text-sm"
              >
                <p className="font-medium">
                  {item.Assignment?.title ?? t('assignmentsPage.notAvailable')}
                </p>
                <p className="text-muted-foreground">
                  {t('opsQueue.profile')}: {item.profile_id}
                </p>
                <Badge variant="secondary">
                  {item.score ?? '—'} / {item.Assignment?.max_score ?? '—'}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 h-auto px-0"
                  onClick={() => setNoteProfileId(item.profile_id)}
                >
                  {t('opsQueue.useForNote')}
                </Button>
              </div>
            ))}
          </QueueCard>

          <QueueCard
            title={t('opsQueue.missedClasses')}
            description={t('opsQueue.missedClassesDescription')}
            icon={<UserX className="h-4 w-4" />}
            count={queue.missed_classes.length}
            empty={t('opsQueue.empty')}
          >
            {queue.missed_classes.map((item) => (
              <div key={item.id} className="rounded-lg border p-3 text-sm">
                <p className="font-medium">
                  {t('opsQueue.profile')}: {item.profile_id}
                </p>
                <p className="text-muted-foreground">
                  {t('opsQueue.sessionId')}: {item.tutoring_session_id}
                </p>
                <p className="text-muted-foreground">
                  {new Date(item.created_at).toLocaleString(language)}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 h-auto px-0"
                  onClick={() => setNoteProfileId(item.profile_id)}
                >
                  {t('opsQueue.useForNote')}
                </Button>
              </div>
            ))}
          </QueueCard>

          <QueueCard
            title={t('opsQueue.unansweredThreads')}
            description={t('opsQueue.unansweredThreadsDescription')}
            icon={<MessageCircle className="h-4 w-4" />}
            count={queue.unanswered_threads.length}
            empty={t('opsQueue.empty')}
          >
            {queue.unanswered_threads.map((item) => (
              <div key={item.id} className="rounded-lg border p-3 text-sm">
                <p className="font-medium">{item.context_type}</p>
                <p className="text-muted-foreground">
                  {t('opsQueue.profile')}: {item.profile_id}
                </p>
                <p className="text-muted-foreground">
                  {t('opsQueue.threadId')}: {item.id}
                </p>
                <p className="text-muted-foreground">
                  {new Date(item.last_message_at).toLocaleString(language)}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 h-auto px-0"
                  onClick={() => setNoteProfileId(item.profile_id)}
                >
                  {t('opsQueue.useForNote')}
                </Button>
              </div>
            ))}
          </QueueCard>
        </div>
      )}
    </main>
  );
}

function QueueCard({
  title,
  description,
  icon,
  count,
  empty,
  children
}: {
  title: string;
  description: string;
  icon: ReactNode;
  count: number;
  empty: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2 text-base">
          <span className="flex items-center gap-2">
            {icon}
            {title}
          </span>
          <Badge variant="outline">{count}</Badge>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {count === 0 ? (
          <p className="text-sm text-muted-foreground">{empty}</p>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
