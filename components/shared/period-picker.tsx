'use client';

import { useState } from 'react';
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
import { useLanguage, useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import type { CalendarPeriod } from '@/hooks/useCalendarPeriod';
import { cn } from '@/lib/utils';

interface PeriodPickerProps {
  /** Whole state object returned by `useCalendarPeriod()`. */
  period: CalendarPeriod;
  className?: string;
}

/**
 * Month/year filter in the calendar the UI shows (Jalali for `fa`). Pair it with
 * `useCalendarPeriod()` on any screen that filters by a period.
 */
export function PeriodPicker({ period, className }: PeriodPickerProps) {
  const {
    year,
    month,
    years,
    months,
    setYear: onYearChange,
    setMonth: onMonthChange
  } = period;
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const formatNumber = useNumberFormat();
  const [open, setOpen] = useState(false);

  const newestYear = years[0];
  const oldestYear = years[years.length - 1];
  const monthsOfYear = months
    .filter((entry) => entry.year === year)
    .sort((a, b) => a.month - b.month);

  const yearLabel = (value: number) =>
    formatNumber(value, { useGrouping: false });

  const selected = months.find(
    (entry) => entry.year === year && entry.month === month
  );

  const triggerLabel = selected
    ? `${selected.label} ${yearLabel(year)}`
    : t('period.wholeYear', { year: yearLabel(year) });

  const goToYear = (next: number) => {
    onYearChange(next);
    const stillExists = months.some(
      (entry) => entry.year === next && entry.month === month
    );
    if (!stillExists) onMonthChange(null);
  };

  const selectMonth = (value: number | null) => {
    onMonthChange(value);
    setOpen(false);
  };

  const OlderIcon = isRTL ? ChevronRight : ChevronLeft;
  const NewerIcon = isRTL ? ChevronLeft : ChevronRight;
  const chipClass = (active: boolean) =>
    cn(
      'h-8 rounded-md text-[13px] transition-colors',
      active
        ? 'bg-primary font-medium text-primary-foreground'
        : 'hover:bg-muted'
    );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={cn('gap-2', className)}>
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{triggerLabel}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" sideOffset={8} className="w-[19rem] p-0">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <span className="text-xs font-medium text-muted-foreground">
            {t('period.heading')}
          </span>
          <button
            type="button"
            className="text-xs font-medium text-primary hover:underline"
            onClick={() => {
              onYearChange(months[0].year);
              selectMonth(months[0].month);
            }}
          >
            {t('period.thisMonth')}
          </button>
        </div>

        <div className="flex items-center justify-between px-3 py-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            aria-label={t('period.olderYear')}
            disabled={year <= oldestYear}
            onClick={() => goToYear(year - 1)}
          >
            <OlderIcon className="h-4 w-4" />
          </Button>
          <span className="text-sm font-semibold tabular-nums">
            {yearLabel(year)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            aria-label={t('period.newerYear')}
            disabled={year >= newestYear}
            onClick={() => goToYear(year + 1)}
          >
            <NewerIcon className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-1.5 px-3 pb-3">
          {monthsOfYear.map((entry) => (
            <button
              key={entry.month}
              type="button"
              onClick={() => selectMonth(entry.month)}
              className={chipClass(month === entry.month)}
            >
              {entry.shortLabel}
            </button>
          ))}
        </div>

        <div className="border-t p-2">
          <button
            type="button"
            onClick={() => selectMonth(null)}
            className={cn('w-full', chipClass(month === null))}
          >
            {t('period.wholeYear', { year: yearLabel(year) })}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
