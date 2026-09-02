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

interface TimePickerProps {
  id?: string;
  /** `HH:mm` on a 24-hour clock. */
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

const TIME_ANCHOR = new Date(2024, 0, 1);

/**
 * A clock without AM/PM. The native time input follows the browser's locale, so
 * a Persian panel could still show "09:00 AM"; this always reads 24-hour, with
 * Persian digits when the panel is Persian.
 */
export function TimePicker({
  id,
  value,
  onChange,
  disabled,
  className
}: TimePickerProps) {
  const { language } = useTranslation();
  const isPersian = language === 'fa';

  const selected = useMemo(() => {
    const [hours, minutes] = (value || '00:00').split(':').map(Number);
    const date = new Date(TIME_ANCHOR);
    date.setHours(hours || 0, minutes || 0, 0, 0);
    return date;
  }, [value]);

  return (
    <DatePickerBase
      id={id}
      value={selected}
      onChange={(picked) => {
        if (!picked || Array.isArray(picked)) return;
        const date = picked.toDate();
        const hh = String(date.getHours()).padStart(2, '0');
        const mm = String(date.getMinutes()).padStart(2, '0');
        onChange(`${hh}:${mm}`);
      }}
      calendar={isPersian ? persian : gregorian}
      locale={isPersian ? persian_fa : gregorian_en}
      calendarPosition={isPersian ? 'bottom-right' : 'bottom-left'}
      disableDayPicker
      format="HH:mm"
      plugins={[<TimePickerPlugin key="time" hideSeconds />]}
      disabled={disabled}
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
