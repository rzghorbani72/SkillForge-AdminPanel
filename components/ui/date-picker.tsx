'use client';

import { useMemo } from 'react';
import DatePickerBase from 'react-multi-date-picker';
import TimePickerPlugin from 'react-multi-date-picker/plugins/time_picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import gregorian from 'react-date-object/calendars/gregorian';
import gregorian_en from 'react-date-object/locales/gregorian_en';

import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/hooks';
import {
  fromDateTimeInputValue,
  fromInputValue,
  toDateTimeInputValue,
  toInputValue
} from '@/lib/i18n/calendar-date';

/** RMDP hands back a DateObject (or a list of them); only `toDate` is needed. */
type PickedDate = { toDate: () => Date };

interface DatePickerProps {
  id?: string;
  /** `YYYY-MM-DD`, or `YYYY-MM-DDTHH:mm` when `withTime`. Empty means unset. */
  value: string;
  onChange: (value: string) => void;
  withTime?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  minDate?: Date;
}

/**
 * The one date field in the panel. Persian users pick on a Jalali calendar with
 * Persian digits and a 24-hour clock; the value handed back is always the
 * Gregorian `YYYY-MM-DD[THH:mm]` the API expects, so the calendar shown never
 * changes what is stored.
 */
export function DatePicker({
  id,
  value,
  onChange,
  withTime = false,
  disabled,
  placeholder,
  className,
  minDate
}: DatePickerProps) {
  const { language } = useTranslation();
  const isPersian = language === 'fa';

  const selected = useMemo(
    () => (withTime ? fromDateTimeInputValue(value) : fromInputValue(value)),
    [value, withTime]
  );

  const emit = (picked: PickedDate | null) => {
    if (!picked) return onChange('');
    const date = picked.toDate();
    onChange(withTime ? toDateTimeInputValue(date) : toInputValue(date));
  };

  return (
    <DatePickerBase
      id={id}
      value={selected}
      onChange={(picked) => emit(picked as PickedDate | null)}
      calendar={isPersian ? persian : gregorian}
      locale={isPersian ? persian_fa : gregorian_en}
      calendarPosition={isPersian ? 'bottom-right' : 'bottom-left'}
      format={withTime ? 'YYYY/MM/DD HH:mm' : 'YYYY/MM/DD'}
      plugins={
        withTime
          ? [<TimePickerPlugin key="time" position="bottom" hideSeconds />]
          : []
      }
      minDate={minDate}
      disabled={disabled}
      placeholder={placeholder}
      inputClass={cn(
        'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors',
        'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      containerClassName="w-full"
      editable={false}
    />
  );
}
