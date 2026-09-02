'use client';

import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { NumberInput } from '@/components/ui/number-input';
import { TimePicker } from '@/components/ui/time-picker';
import { WeekdayPicker } from '@/components/shared/weekday-picker';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { cn } from '@/lib/utils';
import type { TutoringGroupSlot } from '@/types/learning-operations';
import { minutesToTime, timeToMinutes } from '@/lib/class-slot-time';

type Props = {
  slots: TutoringGroupSlot[];
  onChange: (next: TutoringGroupSlot[]) => void;
  disabled?: boolean;
};

const NEW_SLOT: TutoringGroupSlot = {
  weekday: 6,
  start_minute: 9 * 60,
  duration_minutes: 90
};

/** The lengths almost every class actually uses, so typing is the exception. */
const DURATION_PRESETS = [45, 60, 90, 120] as const;

/**
 * The weekly timetable of one class: "Tuesday 15:00 for 90 minutes". Several
 * rows mean the class meets several times a week.
 */
export const GroupSlotEditor = ({ slots, onChange, disabled }: Props) => {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();

  const patch = (index: number, next: Partial<TutoringGroupSlot>) =>
    onChange(
      slots.map((slot, i) => (i === index ? { ...slot, ...next } : slot))
    );

  return (
    <div className="space-y-3">
      {slots.map((slot, index) => (
        <div
          key={index}
          className="space-y-3 rounded-xl border bg-muted/20 p-3"
          aria-label={t('tutoring.groups.slotRow')}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-muted-foreground">
              {t('tutoring.groups.slotRow')} {formatNumber(index + 1)}
            </p>
            {slots.length > 1 ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                disabled={disabled}
                aria-label={t('tutoring.groups.removeSlot')}
                onClick={() => onChange(slots.filter((_, i) => i !== index))}
              >
                <X className="h-4 w-4" />
              </Button>
            ) : null}
          </div>

          <WeekdayPicker
            single
            disabled={disabled}
            value={[slot.weekday]}
            onChange={([weekday]) => patch(index, { weekday })}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor={`slot-start-${index}`}>
                {t('tutoring.groups.slotStart')}
              </Label>
              <TimePicker
                id={`slot-start-${index}`}
                disabled={disabled}
                value={minutesToTime(slot.start_minute)}
                onChange={(next) =>
                  patch(index, { start_minute: timeToMinutes(next) })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`slot-duration-${index}`}>
                {t('tutoring.groups.slotDurationLabel')}
              </Label>
              <NumberInput
                id={`slot-duration-${index}`}
                disabled={disabled}
                value={slot.duration_minutes}
                suffix={t('common.minutes')}
                onChange={(raw) =>
                  patch(index, { duration_minutes: Number(raw) || 0 })
                }
              />
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {DURATION_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    disabled={disabled}
                    onClick={() => patch(index, { duration_minutes: preset })}
                    className={cn(
                      'rounded-full border px-2.5 py-0.5 text-[11px] transition-colors',
                      slot.duration_minutes === preset
                        ? 'border-primary bg-primary/10 font-medium text-primary'
                        : 'text-muted-foreground hover:bg-muted'
                    )}
                  >
                    {formatNumber(preset)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() => onChange([...slots, { ...NEW_SLOT }])}
      >
        <Plus className="me-1.5 h-4 w-4" />
        {t('tutoring.groups.addSlot')}
      </Button>
    </div>
  );
};
