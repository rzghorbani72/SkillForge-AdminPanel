'use client';

import { useMemo, useState } from 'react';
import { useTranslation } from '@/lib/i18n/hooks';
import {
  buildCalendarMonths,
  rangeFor,
  yearsOf,
  type CalendarMonth,
} from '@/lib/i18n/calendar-period';

export interface CalendarPeriod {
  year: number;
  month: number | null;
  setYear: (year: number) => void;
  setMonth: (month: number | null) => void;
  months: CalendarMonth[];
  years: number[];
  startIso: string;
  endIso: string;
}

/** Period filter expressed in the calendar the UI shows (Jalali for `fa`). */
export function useCalendarPeriod(): CalendarPeriod {
  const { language } = useTranslation();
  const months = useMemo(() => buildCalendarMonths(language), [language]);
  const years = useMemo(() => yearsOf(months), [months]);

  const [year, setYear] = useState(() => months[0].year);
  const [month, setMonth] = useState<number | null>(null);

  const activeYear = years.includes(year) ? year : years[0];
  const { startIso, endIso } = useMemo(
    () => rangeFor(months, activeYear, month),
    [months, activeYear, month],
  );

  return {
    year: activeYear,
    month,
    setYear,
    setMonth,
    months,
    years,
    startIso,
    endIso,
  };
}
