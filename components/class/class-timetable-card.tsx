'use client';

import { CalendarDays } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import type { ClassSession, CourseTopic } from '@/types/learning-operations';
import { SessionRow } from './session-row';

interface ClassTimetableCardProps {
  sessions: ClassSession[];
  topics: CourseTopic[];
  isLoading: boolean;
  onSessionChanged: (session: ClassSession) => void;
}

/** Every meeting of one class, in the order it happens. */
export function ClassTimetableCard({
  sessions,
  topics,
  isLoading,
  onSessionChanged
}: ClassTimetableCardProps) {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarDays className="h-4 w-4" />
          {t('courses.live.timetable')}
        </CardTitle>
        <CardDescription>
          {t('courses.live.meetingsCount', {
            count: formatNumber(sessions.length)
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
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
              onChanged={onSessionChanged}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}
