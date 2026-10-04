'use client';

import { CalendarCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Note } from '@/components/shared/note';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { defaultDeadline } from './class-schedule-draft';
import { SessionDateChips } from './session-date-chips';
import type { ClassScheduleApi } from './use-class-schedules';
import { useClassSummary } from './use-live-summary';

/** The real dates the timetable produces, and a warning if registration closes too late. */
export function ClassSessionsPreview({ item }: { item: ClassScheduleApi }) {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const summary = useClassSummary(item);
  const { schedule, dates, update } = item;
  const perWeek = Math.max(schedule.slots.length, 1);

  return (
    <>
      {summary.sessions ? (
        <div className="flex flex-col gap-2.5 rounded-lg bg-muted/50 p-3">
          <p className="flex flex-wrap items-center gap-x-2 text-[13px]">
            <CalendarCheck className="h-4 w-4 shrink-0 text-success" aria-hidden />
            <b>{summary.sessions}</b>
            <span className="text-muted-foreground">
              {t('liveWizard.scheduleRhythm', {
                perWeek: formatNumber(schedule.slots.length),
                weeks: formatNumber(Math.ceil(dates.length / perWeek)),
              })}
            </span>
          </p>
          <SessionDateChips dates={dates} />
        </div>
      ) : null}
      {item.missedAtDeadline > 0 && !item.errors.joinDeadline ? (
        <Note tone="warn">
          {t('liveWizard.lateJoinWarning', { count: formatNumber(item.missedAtDeadline) })}{' '}
          <Button
            type="button"
            variant="link"
            size="sm"
            className="h-auto p-0 font-bold"
            onClick={() => update({ joinDeadline: defaultDeadline(schedule.startsOn) })}
          >
            {t('liveWizard.closeBeforeStart')}
          </Button>
        </Note>
      ) : null}
    </>
  );
}
