'use client';

import { NumberInput } from '@/components/ui/number-input';
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
};

type SlotTime = Omit<TutoringGroupSlot, 'weekday'>;

const DEFAULT_TIME: SlotTime = { start_minute: 9 * 60, duration_minutes: 90 };

/** The lengths almost every class actually uses, so typing is the exception. */
const DURATION_PRESETS = [45, 60, 90, 120] as const;

const LINE_GRID = 'grid grid-cols-[4rem_minmax(0,7rem)_minmax(0,1fr)] items-center gap-3';

const weekPosition = (slot: TutoringGroupSlot) =>
  WEEK_ORDER.indexOf(slot.weekday) * 24 * 60 + slot.start_minute;

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
  const dayLabel = t(WEEKDAY_LABEL_KEYS[slot.weekday]);

  return (
    <li className={cn(LINE_GRID, 'px-3 py-2.5')}>
      <span className="text-sm font-medium">{dayLabel}</span>
      <TimePicker
        disabled={disabled}
        value={minutesToTime(slot.start_minute)}
        onChange={(next) => onPatch({ start_minute: timeToMinutes(next) })}
      />
      <div className="flex min-w-0 flex-wrap items-center gap-1.5">
        <div className="w-28 shrink-0">
          <NumberInput
            aria-label={`${dayLabel} ${t('tutoring.groups.slotDurationLabel')}`}
            disabled={disabled}
            value={slot.duration_minutes}
            suffix={t('common.minutes')}
            onChange={(raw) => onPatch({ duration_minutes: Number(raw) || 0 })}
          />
        </div>
        {DURATION_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            disabled={disabled}
            onClick={() => onPatch({ duration_minutes: preset })}
            className={cn(
              'h-7 min-w-9 rounded-full border px-2 text-[11px] transition-colors',
              slot.duration_minutes === preset
                ? 'border-primary bg-primary/10 font-medium text-primary'
                : 'text-muted-foreground hover:bg-muted',
            )}
          >
            {formatNumber(preset)}
          </button>
        ))}
      </div>
    </li>
  );
}

/**
 * The weekly timetable of one class: pick the days, then one line per day.
 * A week has seven days, so the editor never grows past seven lines. A new
 * day copies the last time, so "same time every day" needs no typing.
 */
export const GroupSlotEditor = ({ slots, onChange, disabled }: Props) => {
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
    <div className="space-y-2.5">
      <WeekdayPicker compact disabled={disabled} value={days} onChange={setDays} />
      {lines.length === 0 ? (
        <p className="text-xs text-muted-foreground">{t('tutoring.groups.pickDaysHint')}</p>
      ) : (
        <div className="rounded-xl border">
          <div className={cn(LINE_GRID, 'border-b px-3 py-1.5 text-[11px] text-muted-foreground')}>
            <span />
            <span>{t('tutoring.groups.slotStart')}</span>
            <span>{t('tutoring.groups.slotDurationLabel')}</span>
          </div>
          <ol className="divide-y">
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
