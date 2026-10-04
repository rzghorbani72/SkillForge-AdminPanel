'use client';

import { Button } from '@/components/ui/button';
import { GroupSlotEditor } from '@/app/(protected)/tutoring/groups/_components/group-slot-editor';
import { FieldError, FieldLabel } from '@/components/shared/field-label';
import { useTranslation } from '@/lib/i18n/hooks';
import type { ClassScheduleApi } from './use-class-schedules';

/** Class days, then the time of each day. */
export function ClassDaysField({ item }: { item: ClassScheduleApi }) {
  const { t } = useTranslation();
  const { schedule, shownErrors: errors, update, locked } = item;
  const [firstSlot] = schedule.slots;
  const timesDiffer = schedule.slots.some(
    (slot) =>
      slot.start_minute !== firstSlot?.start_minute ||
      slot.duration_minutes !== firstSlot?.duration_minutes,
  );
  const sameTimeForAll = () => {
    if (!firstSlot) return;
    const { start_minute, duration_minutes } = firstSlot;
    update({ slots: schedule.slots.map((slot) => ({ ...slot, start_minute, duration_minutes })) });
  };

  return (
    <div className="flex flex-col gap-1.5">
      <GroupSlotEditor
        slots={schedule.slots}
        onChange={(slots) => update({ slots })}
        disabled={locked}
        daysLabel={<FieldLabel required>{t('liveWizard.classDays')}</FieldLabel>}
        timesLabel={
          <div className="flex flex-wrap items-center justify-between gap-2">
            <FieldLabel required>{t('liveWizard.dayTimes')}</FieldLabel>
            {timesDiffer && !locked ? (
              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-auto p-0 font-bold"
                onClick={sameTimeForAll}
              >
                {t('liveWizard.sameTimeAllDays')}
              </Button>
            ) : null}
          </div>
        }
      />
      {schedule.slots.length === 0 ? <FieldError messageKey={errors.slots} /> : null}
    </div>
  );
}
