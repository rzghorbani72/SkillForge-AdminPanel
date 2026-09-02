'use client';

import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { WEEKDAY_LABEL_KEYS } from '@/lib/live-recurrence';
import type { TutoringGroupSlot } from '@/types/learning-operations';

/** "شنبه ۰۹:۰۰ – ۱۰:۳۰" for every weekly meeting of a class. */
export const GroupScheduleSummary = ({
  slots
}: {
  slots?: TutoringGroupSlot[];
}) => {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();

  // Clock digits follow the UI language too, so a Persian page never mixes
  // "۰۹" in one badge with "09" in the next.
  const clock = (minutes: number) => {
    const wrapped = ((minutes % 1440) + 1440) % 1440;
    const pad = (value: number) =>
      formatNumber(value, { minimumIntegerDigits: 2, useGrouping: false });
    return `${pad(Math.floor(wrapped / 60))}:${pad(wrapped % 60)}`;
  };

  if (!slots?.length) return <span className="text-muted-foreground">—</span>;

  return (
    <div className="flex flex-wrap gap-1.5">
      {slots.map((slot, index) => (
        <span
          key={slot.id ?? index}
          className="rounded-md bg-muted px-2 py-0.5 text-xs"
        >
          {t(WEEKDAY_LABEL_KEYS[slot.weekday])}{' '}
          <span dir="ltr" className="inline-block">
            {clock(slot.start_minute)}–
            {clock(slot.start_minute + slot.duration_minutes)}
          </span>
        </span>
      ))}
    </div>
  );
};
