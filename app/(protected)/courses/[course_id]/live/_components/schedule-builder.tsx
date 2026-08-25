'use client';

import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NumberInput } from '@/components/ui/number-input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { GroupSlotEditor } from '@/app/(protected)/tutoring/groups/_components/group-slot-editor';
import { defaultTimezone } from '@/app/(protected)/tutoring/groups/lib/slot-time';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import type { TutoringGroupSlot } from '@/types/learning-operations';
import { previewSessionDates } from '../lib/session-plan-preview';

const DEFAULT_SLOT: TutoringGroupSlot = {
  weekday: 6,
  start_minute: 9 * 60,
  duration_minutes: 90
};

interface ScheduleBuilderProps {
  offerId: string;
  courseTitle: string;
  onCreated?: (groupId: string) => void;
}

/**
 * Turns "Mondays 10:00 and Tuesdays 15:00, 10 sessions" into a real class. The
 * preview below the form is the same calculation the backend runs, so the dates
 * a teacher agrees to here are exactly the dates their students will get.
 */
export default function ScheduleBuilder({
  offerId,
  courseTitle,
  onCreated
}: ScheduleBuilderProps) {
  const { t, language } = useTranslation();
  const [slots, setSlots] = useState<TutoringGroupSlot[]>([DEFAULT_SLOT]);
  const [sessionCount, setSessionCount] = useState(10);
  const [capacity, setCapacity] = useState(8);
  const [minStudents, setMinStudents] = useState(2);
  const [startsOn, setStartsOn] = useState('');
  const [joinDeadline, setJoinDeadline] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const timezone = defaultTimezone();
  const preview = useMemo(() => {
    if (!startsOn) return [];
    const from = new Date(startsOn);
    if (Number.isNaN(from.getTime())) return [];
    return previewSessionDates(slots, sessionCount, from, timezone);
  }, [slots, sessionCount, startsOn, timezone]);

  const create = async () => {
    if (!startsOn) {
      toast.error(t('courses.live.startDateRequired'));
      return;
    }
    setIsSaving(true);
    try {
      const group = await apiClient.createTutoringGroup({
        offer_id: offerId,
        title: courseTitle,
        timezone,
        capacity,
        min_students: minStudents,
        session_count: sessionCount,
        starts_on_requested: new Date(startsOn).toISOString(),
        join_deadline: joinDeadline
          ? new Date(joinDeadline).toISOString()
          : undefined,
        slots
      });
      toast.success(t('courses.live.classCreated'));
      onCreated?.(group.id);
    } catch (err) {
      ErrorHandler.handleApiError(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">
          {t('courses.live.schedule')}
        </CardTitle>
        <CardDescription>{t('courses.live.scheduleHint')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <GroupSlotEditor slots={slots} onChange={setSlots} />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="session-count">
              {t('courses.live.sessionCount')} *
            </Label>
            <NumberInput
              id="session-count"
              value={sessionCount}
              min={1}
              max={200}
              onChange={(raw) => setSessionCount(Number(raw) || 1)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="starts-on">{t('courses.live.startDate')} *</Label>
            <Input
              id="starts-on"
              type="date"
              dir="ltr"
              value={startsOn}
              onChange={(e) => setStartsOn(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="join-deadline">
              {t('courses.live.joinDeadline')}
            </Label>
            <Input
              id="join-deadline"
              type="date"
              dir="ltr"
              value={joinDeadline}
              onChange={(e) => setJoinDeadline(e.target.value)}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="min-students">
                {t('courses.live.minStudents')}
              </Label>
              <NumberInput
                id="min-students"
                value={minStudents}
                min={1}
                onChange={(raw) => setMinStudents(Number(raw) || 1)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">{t('courses.live.maxStudents')}</Label>
              <NumberInput
                id="capacity"
                value={capacity}
                min={1}
                onChange={(raw) => setCapacity(Number(raw) || 1)}
              />
            </div>
          </div>
        </div>

        {preview.length > 0 && (
          <div className="rounded-md border bg-muted/30 p-3">
            <p className="mb-2 text-sm font-medium">
              {t('courses.live.previewTitle')}
            </p>
            <ol className="grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
              {preview.map((date, index) => (
                <li key={date.toISOString()}>
                  {index + 1}.{' '}
                  {new Intl.DateTimeFormat(language, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                    timeZone: timezone
                  }).format(date)}
                </li>
              ))}
            </ol>
          </div>
        )}

        <Button type="button" onClick={create} disabled={isSaving}>
          {isSaving ? t('common.saving') : t('courses.live.createClass')}
        </Button>
      </CardContent>
    </Card>
  );
}
