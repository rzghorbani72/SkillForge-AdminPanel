'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, Users } from 'lucide-react';
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
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import type {
  ClassSession,
  CourseTopic,
  TutoringGroup
} from '@/types/learning-operations';
import SessionRow from './session-row';
import ClassHomeworkCard from './class-homework-card';

interface ClassPanelProps {
  group: TutoringGroup;
  topics: CourseTopic[];
  onPublished: () => void;
}

/**
 * One class of a live course: its timetable, and the publish step that turns
 * the plan into dated meetings students can see before they buy a seat.
 */
export default function ClassPanel({
  group,
  topics,
  onPublished
}: ClassPanelProps) {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    apiClient
      .getClassSessions(group.id)
      .then((rows) => {
        if (!cancelled) setSessions(rows);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [group.id]);

  const publish = async () => {
    setIsPublishing(true);
    try {
      await apiClient.publishTutoringGroup(group.id);
      setSessions(await apiClient.getClassSessions(group.id));
      toast.success(t('courses.live.classPublished'));
      onPublished();
    } catch (err) {
      ErrorHandler.handleApiError(err);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="text-base">{group.title}</CardTitle>
              <CardDescription className="flex flex-wrap items-center gap-3 pt-1">
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {t('courses.live.seatsTaken', {
                    taken: formatNumber(group.seats_taken),
                    capacity: formatNumber(group.capacity)
                  })}
                </span>
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {t('courses.live.meetingsCount', {
                    count: formatNumber(sessions.length)
                  })}
                </span>
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{group.status}</Badge>
              {group.status === 'DRAFT' && (
                <Button
                  type="button"
                  size="sm"
                  onClick={publish}
                  disabled={isPublishing}
                >
                  {isPublishing
                    ? t('common.saving')
                    : t('courses.live.publishClass')}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">
              {t('common.loading')}
            </p>
          ) : sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t('courses.live.noSessionsYet')}
            </p>
          ) : (
            sessions.map((session, index) => (
              <SessionRow
                key={session.id}
                index={index}
                session={session}
                topics={topics}
                onChanged={(updated) =>
                  setSessions((rows) =>
                    rows.map((row) => (row.id === updated.id ? updated : row))
                  )
                }
              />
            ))
          )}
        </CardContent>
      </Card>

      <ClassHomeworkCard groupId={group.id} sessions={sessions} />
    </div>
  );
}
