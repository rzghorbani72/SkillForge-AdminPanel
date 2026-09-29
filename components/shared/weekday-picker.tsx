'use client';

import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';
import { WEEKDAY_LABEL_KEYS, WEEK_ORDER } from '@/lib/live-recurrence';

type Props = {
  /** Selected weekday indexes (0 = Sunday). Single-select passes one. */
  value: readonly number[];
  onChange: (next: number[]) => void;
  /** Single mode picks exactly one day — used by a group class slot row. */
  single?: boolean;
  disabled?: boolean;
  /** Small chips that keep all seven days on one line in a narrow column. */
  compact?: boolean;
};

/**
 * Saturday-first weekday chips, shared by the live-session repeat editor and the
 * group-class timetable so both speak the same Persian week.
 */
export const WeekdayPicker = ({
  value,
  onChange,
  single = false,
  disabled = false,
  compact = false,
}: Props) => {
  const { t } = useTranslation();

  const toggle = (day: number) => {
    if (single) return onChange([day]);
    onChange(value.includes(day) ? value.filter((d) => d !== day) : [...value, day]);
  };

  return (
    <div className={cn('flex flex-wrap', compact ? 'gap-1' : 'gap-2')}>
      {WEEK_ORDER.map((day) => (
        <Button
          key={day}
          type="button"
          size="sm"
          disabled={disabled}
          variant={value.includes(day) ? 'default' : 'outline'}
          onClick={() => toggle(day)}
          className={compact ? 'h-7 px-2 text-xs' : undefined}
        >
          {t(WEEKDAY_LABEL_KEYS[day])}
        </Button>
      ))}
    </div>
  );
};
