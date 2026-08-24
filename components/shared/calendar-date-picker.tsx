'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import { useLanguage, useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import {
  buildMonthGrid,
  calendarParts,
  formatMonthYear,
  fromInputValue,
  isSameInputDay,
  shiftCalendarMonth,
  toInputValue,
  weekdayLabels
} from '@/lib/i18n/calendar-date';
import { cn } from '@/lib/utils';

interface CalendarDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
}

/** Single-day picker in the UI calendar (Jalali for `fa`, Gregorian for `en`). */
export function CalendarDatePicker({
  value,
  onChange,
  disabled = false,
  className,
  'aria-label': ariaLabel
}: CalendarDatePickerProps) {
  const { t, language } = useTranslation();
  const { isRTL } = useLanguage();
  const formatDate = useDateFormat();
  const formatNumber = useNumberFormat();
  const [open, setOpen] = useState(false);

  const selected = fromInputValue(value);
  const today = useMemo(() => new Date(), []);
  const todayParts = calendarParts(today, language);

  const initialView = selected ? calendarParts(selected, language) : todayParts;

  const [viewYear, setViewYear] = useState(initialView.year);
  const [viewMonth, setViewMonth] = useState(initialView.month);

  useEffect(() => {
    if (!open) return;
    const parts = selected ? calendarParts(selected, language) : todayParts;
    setViewYear(parts.year);
    setViewMonth(parts.month);
  }, [open, selected, todayParts, language]);
  const monthCells = useMemo(
    () => buildMonthGrid(viewYear, viewMonth, language),
    [viewYear, viewMonth, language]
  );
  const weekdays = useMemo(() => weekdayLabels(language), [language]);
  const monthLabel = formatMonthYear(viewYear, viewMonth, language);

  const OlderIcon = isRTL ? ChevronRight : ChevronLeft;
  const NewerIcon = isRTL ? ChevronLeft : ChevronRight;

  const dayClass = (active: boolean, muted = false) =>
    cn(
      'h-8 w-8 rounded-md text-[13px] transition-colors',
      muted && 'text-muted-foreground/70',
      active
        ? 'bg-primary font-medium text-primary-foreground'
        : 'hover:bg-muted'
    );

  const shiftMonth = (delta: number) => {
    const next = shiftCalendarMonth(viewYear, viewMonth, delta, language);
    setViewYear(next.year);
    setViewMonth(next.month);
  };

  const selectDate = (date: Date) => {
    onChange(toInputValue(date));
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          aria-label={ariaLabel}
          className={cn(
            'w-full justify-start gap-2 font-normal',
            !value && 'text-muted-foreground',
            className
          )}
        >
          <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="truncate">
            {selected ? formatDate(selected) : t('datePicker.pickDate')}
          </span>
          <ChevronDown className="ms-auto h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" sideOffset={8} className="w-[19rem] p-0">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <span className="text-xs font-medium text-muted-foreground">
            {t('datePicker.heading')}
          </span>
          <button
            type="button"
            className="text-xs font-medium text-primary hover:underline"
            onClick={() => selectDate(today)}
          >
            {t('datePicker.today')}
          </button>
        </div>

        <div className="flex items-center justify-between px-3 py-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            aria-label={t('datePicker.olderMonth')}
            onClick={() => shiftMonth(-1)}
          >
            <OlderIcon className="h-4 w-4" />
          </Button>
          <span className="text-sm font-semibold">{monthLabel}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            aria-label={t('datePicker.newerMonth')}
            onClick={() => shiftMonth(1)}
          >
            <NewerIcon className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-1 px-3 pb-1">
          {weekdays.map((label) => (
            <span
              key={label}
              className="text-center text-[11px] font-medium text-muted-foreground"
            >
              {label}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 px-3 pb-3">
          {monthCells.map((cell) => {
            const selectedDay = selected
              ? isSameInputDay(cell.date, selected)
              : false;
            const todayDay = isSameInputDay(cell.date, today);
            return (
              <button
                key={cell.date.toISOString()}
                type="button"
                onClick={() => selectDate(cell.date)}
                className={cn(
                  dayClass(selectedDay, !cell.inMonth),
                  !selectedDay && todayDay && 'ring-1 ring-primary/40'
                )}
              >
                {formatNumber(cell.day, { useGrouping: false })}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
