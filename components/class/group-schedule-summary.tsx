'use client';

import { useTranslation } from '@/lib/i18n/hooks';
import { WEEKDAY_LABEL_KEYS } from '@/lib/live-recurrence';
import type { TutoringGroupSlot } from '@/types/learning-operations';
import { minutesToTime } from '@/lib/class-slot-time';

/** "شنبه ۰۹:۰۰ – ۱۰:۳۰" for every weekly meeting of a class. */
export const GroupScheduleSummary = ({
  slots
}: {
  slots?: TutoringGroupSlot[];
}) => {
  const { t } = useTranslation();
  if (!slots?.length) return <span className="text-muted-foreground">—</span>;

  return (
    <div className="flex flex-wrap gap-1.5">
      {slots.map((slot, index) => (
        <span
          key={slot.id ?? index}
          className="rounded-md bg-muted px-2 py-0.5 text-xs"
          dir="ltr"
        >
          {t(WEEKDAY_LABEL_KEYS[slot.weekday])}{' '}
          {minutesToTime(slot.start_minute)}–
          {minutesToTime(slot.start_minute + slot.duration_minutes)}
        </span>
      ))}
    </div>
  );
};
