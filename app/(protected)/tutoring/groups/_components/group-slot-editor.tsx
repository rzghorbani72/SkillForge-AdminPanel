'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TimePicker } from '@/components/ui/time-picker';
import { WeekdayPicker } from '@/components/shared/weekday-picker';
import { useTranslation } from '@/lib/i18n/hooks';
import type { TutoringGroupSlot } from '@/types/learning-operations';
import { minutesToTime, timeToMinutes } from '../lib/slot-time';

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

/**
 * The weekly timetable of one class: "Tuesday 15:00 for 90 minutes". Several
 * rows mean the class meets several times a week.
 */
export const GroupSlotEditor = ({ slots, onChange, disabled }: Props) => {
  const { t } = useTranslation();

  const patch = (index: number, next: Partial<TutoringGroupSlot>) =>
    onChange(
      slots.map((slot, i) => (i === index ? { ...slot, ...next } : slot))
    );

  return (
    <div className="space-y-3">
      {slots.map((slot, index) => (
        <div
          key={index}
          className="space-y-3 rounded-md border p-3"
          aria-label={t('tutoring.groups.slotRow')}
        >
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
                {t('tutoring.groups.slotDuration')}
              </Label>
              <Input
                id={`slot-duration-${index}`}
                type="number"
                min={5}
                max={600}
                dir="ltr"
                disabled={disabled}
                value={slot.duration_minutes}
                onChange={(e) =>
                  patch(index, { duration_minutes: Number(e.target.value) })
                }
              />
            </div>
          </div>
          {slots.length > 1 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              onClick={() => onChange(slots.filter((_, i) => i !== index))}
            >
              {t('tutoring.groups.removeSlot')}
            </Button>
          ) : null}
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() => onChange([...slots, { ...NEW_SLOT }])}
      >
        {t('tutoring.groups.addSlot')}
      </Button>
    </div>
  );
};
