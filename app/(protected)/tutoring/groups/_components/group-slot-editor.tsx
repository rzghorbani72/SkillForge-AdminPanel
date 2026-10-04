'use client';

import type { ReactNode } from 'react';
import { CircleAlert } from 'lucide-react';

import { TimePicker } from '@/components/ui/time-picker';
import { WeekdayPicker } from '@/components/shared/weekday-picker';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { WEEK_ORDER, WEEKDAY_LABEL_KEYS } from '@/lib/live-recurrence';
import { cn } from '@/lib/utils';
import type { TutoringGroupSlot } from '@/types/learning-operations';
import { minutesToTime, timeToMinutes } from '@/lib/class-slot-time';

type Props = {
  slots: TutoringGroupSlot[];
  onChange: (next: TutoringGroupSlot[]) => void;
  disabled?: boolean;
  daysLabel?: ReactNode;
  timesLabel?: ReactNode;
};

type SlotTime = Omit<TutoringGroupSlot, 'weekday'>;

const DEFAULT_TIME: SlotTime = { start_minute: 9 * 60, duration_minutes: 90 };
const DAY_MINUTES = 24 * 60;
const TIME_INPUT = 'h-10 bg-card text-center font-bold';

const weekPosition = (slot: TutoringGroupSlot) =>
  WEEK_ORDER.indexOf(slot.weekday) * DAY_MINUTES + slot.start_minute;

function SlotLine({
  slot,
  disabled,
  onPatch,
}: {
  slot: TutoringGroupSlot;
  disabled?: boolean;
  onPatch: (next: Partial<SlotTime>) => void;
}) {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const invalid = slot.duration_minutes <= 0;
  const end = (slot.start_minute + slot.duration_minutes) % DAY_MINUTES;
  const wholeHours = slot.duration_minutes % 60 === 0;

  return (
    <li
      className={cn(
        'flex flex-wrap items-center gap-3 rounded-[10px] border px-3.5 py-2.5',
        invalid ? 'border-destructive/30 bg-destructive/10' : 'bg-background',
      )}
    >
      <span className="w-[84px] font-extrabold">{t(WEEKDAY_LABEL_KEYS[slot.weekday])}</span>
      <span className="text-[13px] text-muted-foreground">{t('tutoring.groups.from')}</span>
      <div className="w-24">
        <TimePicker
          className={TIME_INPUT}
          disabled={disabled}
          value={minutesToTime(slot.start_minute)}
          onChange={(next) => onPatch({ start_minute: timeToMinutes(next) })}
        />
      </div>
      <span className="text-[13px] text-muted-foreground">{t('tutoring.groups.to')}</span>
      <div className="w-24">
        <TimePicker
          className={cn(TIME_INPUT, invalid && 'border-destructive')}
          disabled={disabled}
          value={minutesToTime(end)}
          onChange={(next) =>
            onPatch({ duration_minutes: timeToMinutes(next) - slot.start_minute })
          }
        />
      </div>
      {invalid ? (
        <span className="flex items-center gap-1.5 text-xs font-semibold text-destructive">
          <CircleAlert className="h-4 w-4 shrink-0" aria-hidden />
          {t('tutoring.groups.endBeforeStart')}
        </span>
      ) : (
        <span className="rounded-full bg-muted px-2.5 py-px text-xs font-bold text-muted-foreground">
          {t(wholeHours ? 'tutoring.groups.durationHours' : 'tutoring.groups.durationMinutes', {
            count: formatNumber(wholeHours ? slot.duration_minutes / 60 : slot.duration_minutes),
          })}
        </span>
      )}
    </li>
  );
}

/**
 * The weekly timetable of one class: pick the days, then one line per day.
 * A new day copies the last time, so "same time every day" needs no typing.
 */
export const GroupSlotEditor = ({ slots, onChange, disabled, daysLabel, timesLabel }: Props) => {
  const { t } = useTranslation();
  const days = slots
    .map((slot) => slot.weekday)
    .filter((day, index, all) => all.indexOf(day) === index);
  const lines = slots
    .map((slot, index) => ({ slot, index }))
    .sort((a, b) => weekPosition(a.slot) - weekPosition(b.slot));

  const setDays = (nextDays: number[]) => {
    const template = slots.at(-1) ?? DEFAULT_TIME;
    const kept = slots.filter((slot) => nextDays.includes(slot.weekday));
    const added = nextDays
      .filter((day) => !days.includes(day))
      .map((weekday) => ({
        weekday,
        start_minute: template.start_minute,
        duration_minutes: template.duration_minutes,
      }));
    onChange([...kept, ...added]);
  };

  const patch = (index: number, next: Partial<SlotTime>) =>
    onChange(slots.map((slot, i) => (i === index ? { ...slot, ...next } : slot)));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        {daysLabel}
        <WeekdayPicker disabled={disabled} value={days} onChange={setDays} />
      </div>
      {lines.length === 0 ? (
        <p className="text-xs text-muted-foreground">{t('tutoring.groups.pickDaysHint')}</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {timesLabel}
          <ol className="flex flex-col gap-1.5">
            {lines.map(({ slot, index }) => (
              <SlotLine
                key={`${slot.weekday}-${index}`}
                slot={slot}
                disabled={disabled}
                onPatch={(next) => patch(index, next)}
              />
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};
