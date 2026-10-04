'use client';

import { CalendarDays } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { GroupSlotEditor } from '@/app/(protected)/tutoring/groups/_components/group-slot-editor';
import { useTranslation } from '@/lib/i18n/hooks';
import { FieldError, FieldLabel } from '@/components/shared/field-label';
import { SectionCard } from '@/components/shared/section-card';
import type { LiveClassDraftApi } from './use-live-class-draft';

/** Start date, class days and the time of each day. */
export function WeeklyScheduleCard({ live }: { live: LiveClassDraftApi }) {
  const { t } = useTranslation();
  const { draft, shownErrors: errors, update, scheduleLocked } = live;
  const [firstSlot] = draft.slots;
  const timesDiffer = draft.slots.some(
    (slot) =>
      slot.start_minute !== firstSlot?.start_minute ||
      slot.duration_minutes !== firstSlot?.duration_minutes,
  );
  const sameTimeForAll = () => {
    if (!firstSlot) return;
    const { start_minute, duration_minutes } = firstSlot;
    update({ slots: draft.slots.map((slot) => ({ ...slot, start_minute, duration_minutes })) });
  };

  return (
    <SectionCard
      icon={CalendarDays}
      title={t('liveWizard.weeklyTitle')}
      hint={t('liveWizard.weeklyHint')}
    >
      <div className="flex max-w-[320px] flex-col gap-1.5">
        <FieldLabel htmlFor="live-starts-on" required>
          {t('liveWizard.startDate')}
        </FieldLabel>
        <DatePicker
          id="live-starts-on"
          value={draft.startsOn}
          onChange={(startsOn) => update({ startsOn })}
          minDate={new Date()}
          disabled={scheduleLocked}
        />
        <FieldError messageKey={errors.startsOn} />
      </div>
      <GroupSlotEditor
        slots={draft.slots}
        onChange={(slots) => update({ slots })}
        disabled={scheduleLocked}
        daysLabel={<FieldLabel required>{t('liveWizard.classDays')}</FieldLabel>}
        timesLabel={
          <div className="flex flex-wrap items-center justify-between gap-2">
            <FieldLabel required>{t('liveWizard.dayTimes')}</FieldLabel>
            {timesDiffer && !scheduleLocked ? (
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
      {draft.slots.length === 0 ? <FieldError messageKey={errors.slots} /> : null}
    </SectionCard>
  );
}
