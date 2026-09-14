'use client';

import { useTranslation } from '@/lib/i18n/hooks';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { WEEKDAY_LABEL_KEYS } from '@/lib/live-recurrence';
import { nextWeekdayTime } from '@/lib/session-plan-preview';
import { cn } from '@/lib/utils';
import type { TutoringGroupSlot } from '@/types/learning-operations';

interface GroupScheduleSummaryProps {
  slots?: TutoringGroupSlot[];
  /** First day of the term: turns each weekday into a real calendar date. */
  startsOn?: string | null;
  timezone?: string | null;
  className?: string;
}

/**
 * The weekly timetable of a class. A weekday alone ("Monday 09:00") is not
 * something a manager can act on, so when the term start is known each slot
 * shows the calendar date of its first meeting as well.
 */
export const GroupScheduleSummary = ({
  slots,
  startsOn,
  timezone,
  className,
}: GroupScheduleSummaryProps) => {
  const { t } = useTranslation();
  const formatDate = useDateFormat();
  const formatNumber = useNumberFormat();

  // Clock digits follow the UI language too, so a Persian page never mixes
  // "۰۹" in one badge with "09" in the next.
  const clock = (minutes: number) => {
    const wrapped = ((minutes % 1440) + 1440) % 1440;
    const pad = (value: number) =>
      formatNumber(value, { minimumIntegerDigits: 2, useGrouping: false });
    return `${pad(Math.floor(wrapped / 60))}:${pad(wrapped % 60)}`;
  };

  const from = startsOn ? new Date(startsOn) : null;
  const zone = timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC';

  const firstMeeting = (slot: TutoringGroupSlot) => {
    if (!from || Number.isNaN(from.getTime())) return null;
    return formatDate(nextWeekdayTime(zone, slot.weekday, slot.start_minute, from));
  };

  if (!slots?.length) return <span className="text-muted-foreground">—</span>;

  return (
    <div className={cn('flex min-w-0 flex-wrap gap-1.5', className)}>
      {slots.map((slot, index) => {
        const date = firstMeeting(slot);
        return (
          <span
            key={slot.id ?? index}
            className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border bg-muted/60 px-2 py-0.5 text-[11px] leading-5 text-foreground/80"
          >
            {t(WEEKDAY_LABEL_KEYS[slot.weekday])}
            {date ? <span>{date}</span> : null}
            <span dir="ltr" className="inline-block tabular-nums">
              {clock(slot.start_minute)}–{clock(slot.start_minute + slot.duration_minutes)}
            </span>
          </span>
        );
      })}
    </div>
  );
};
