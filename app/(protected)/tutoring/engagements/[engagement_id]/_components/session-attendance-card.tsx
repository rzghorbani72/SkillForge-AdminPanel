'use client';

import { useState } from 'react';
import { UserCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslation } from '@/lib/i18n/hooks';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import type { ClassSession, TutoringAttendanceStatus } from '@/types/learning-operations';

interface SessionAttendanceCardProps {
  sessions: ClassSession[];
  saving: boolean;
  onSubmit: (session: ClassSession, status: TutoringAttendanceStatus) => void;
}

const STATUSES: TutoringAttendanceStatus[] = ['PRESENT', 'ABSENT', 'JOINED'];

/** One student, so attendance is just "which meeting, was she there". */
export function SessionAttendanceCard({ sessions, saving, onSubmit }: SessionAttendanceCardProps) {
  const { t } = useTranslation();
  const formatDate = useDateFormat();
  const open = sessions.filter((session) => session.status !== 'CANCELLED');
  const [sessionId, setSessionId] = useState(open[0]?.id ?? '');
  const [status, setStatus] = useState<TutoringAttendanceStatus>('PRESENT');
  const selected = open.find((session) => session.id === sessionId);

  const statusLabel: Record<TutoringAttendanceStatus, string> = {
    PRESENT: t('tutoring.attendancePresent'),
    ABSENT: t('tutoring.attendanceAbsent'),
    JOINED: t('tutoring.attendanceJoined'),
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <UserCheck className="h-4 w-4" />
          {t('tutoring.attendanceTitle')}
        </CardTitle>
        <CardDescription>{t('tutoring.attendanceHint')}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-end">
        <div className="space-y-2">
          <Label>{t('tutoring.attendanceSession')}</Label>
          <Select value={sessionId} onValueChange={setSessionId}>
            <SelectTrigger>
              <SelectValue placeholder={t('tutoring.noSessionsYet')} />
            </SelectTrigger>
            <SelectContent>
              {open.map((session, index) => (
                <SelectItem key={session.id} value={session.id}>
                  {session.title ??
                    session.Topic?.title ??
                    `${t('courses.live.meeting')} ${index + 1}`}{' '}
                  · {formatDate(session.starts_at)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{t('tutoring.attendanceStatus')}</Label>
          <Select
            value={status}
            onValueChange={(value) => setStatus(value as TutoringAttendanceStatus)}
          >
            <SelectTrigger className="sm:w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((value) => (
                <SelectItem key={value} value={value}>
                  {statusLabel[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          type="button"
          disabled={saving || !selected}
          onClick={() => selected && onSubmit(selected, status)}
        >
          {t('tutoring.attendanceSubmit')}
        </Button>
      </CardContent>
    </Card>
  );
}
