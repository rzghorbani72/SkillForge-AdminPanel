'use client';

import { useEffect, useState } from 'react';
import { NotebookPen, Plus } from 'lucide-react';
import { toast } from 'react-toastify';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { DataList, type DataColumn } from '@/components/shared/data-list';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import type {
  ClassSession,
  LearningAssignment
} from '@/types/learning-operations';
import { HomeworkDialog } from './homework-dialog';

interface ClassHomeworkCardProps {
  groupId: string;
  sessions: ClassSession[];
}

/**
 * The homework a class owes. One card covers both parents: work set for the
 * whole class, and work attached to a single meeting — the teacher picks which
 * when creating it, so there is no second screen to learn.
 */
export default function ClassHomeworkCard({
  groupId,
  sessions
}: ClassHomeworkCardProps) {
  const { t, language } = useTranslation();
  const formatNumber = useNumberFormat();
  const [items, setItems] = useState<LearningAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      // Two parents, so two reads: work set for the class, and work attached to
      // any one of its meetings.
      const [forClass, ...forMeetings] = await Promise.all([
        apiClient.getAssignments({ tutoring_group_id: groupId, limit: 100 }),
        ...sessions.map((session) =>
          apiClient.getAssignments({
            tutoring_session_id: session.id,
            limit: 100
          })
        )
      ]);
      setItems([
        ...forClass.assignments,
        ...forMeetings.flatMap((page) => page.assignments)
      ]);
    } catch (err) {
      ErrorHandler.handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // Reloading on the meeting ids keeps the per-meeting reads in step with the
    // timetable without refetching on every unrelated render.
  }, [groupId, sessions.map((session) => session.id).join(',')]);

  const meetingOf = (assignment: LearningAssignment) =>
    sessions.find((session) => session.id === assignment.tutoring_session_id);

  const parentLabel = (assignment: LearningAssignment) => {
    const meeting = meetingOf(assignment);
    if (!meeting) return t('courses.live.homeworkWholeClass');
    return (
      meeting.title ??
      meeting.Topic?.title ??
      new Intl.DateTimeFormat(language, { dateStyle: 'short' }).format(
        new Date(meeting.starts_at)
      )
    );
  };

  const dueLabel = (assignment: LearningAssignment) =>
    assignment.due_date
      ? new Intl.DateTimeFormat(language, { dateStyle: 'medium' }).format(
          new Date(assignment.due_date)
        )
      : t('courses.live.homeworkNoDueDate');

  const columns: DataColumn<LearningAssignment>[] = [
    {
      id: 'title',
      header: t('courses.live.homeworkTitle'),
      cell: (item) => <span className="font-medium">{item.title}</span>
    },
    {
      id: 'parent',
      header: t('courses.live.homeworkFor'),
      cell: (item) => <Badge variant="outline">{parentLabel(item)}</Badge>
    },
    {
      id: 'due',
      header: t('courses.live.homeworkDue'),
      cell: (item) => (
        <span className="text-muted-foreground">{dueLabel(item)}</span>
      )
    },
    {
      id: 'submissions',
      header: t('courses.live.homeworkSubmissions'),
      align: 'center',
      cell: (item) => formatNumber(item._count?.Submission ?? 0)
    }
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <NotebookPen className="h-4 w-4" />
              {t('courses.live.homework')}
            </CardTitle>
            <CardDescription>{t('courses.live.homeworkHint')}</CardDescription>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            {t('courses.live.addHomework')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <DataList
          items={items}
          columns={columns}
          rowKey={(item) => item.id}
          isLoading={isLoading}
          renderCard={(item) => (
            <div className="space-y-1 rounded-lg border p-4">
              <p className="font-medium">{item.title}</p>
              <Badge variant="outline">{parentLabel(item)}</Badge>
              <p className="text-sm text-muted-foreground">{dueLabel(item)}</p>
            </div>
          )}
          emptyState={
            <p className="py-6 text-center text-sm text-muted-foreground">
              {t('courses.live.noHomeworkYet')}
            </p>
          }
        />
      </CardContent>

      <HomeworkDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        groupId={groupId}
        sessions={sessions}
        onCreated={() => {
          toast.success(t('courses.live.homeworkCreated'));
          void load();
        }}
      />
    </Card>
  );
}
