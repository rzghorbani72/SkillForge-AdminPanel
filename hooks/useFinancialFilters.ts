'use client';

import { useMemo, useState, useCallback } from 'react';
import { useTranslation } from '@/lib/i18n/hooks';

export interface DateRange {
  startDate: Date;
  endDate: Date;
  startIso: string;
  endIso: string;
}

export interface FinancialFilters {
  selectedYear: number;
  selectedMonth: number | null;
  setSelectedYear: (year: number) => void;
  setSelectedMonth: (month: number | null) => void;
  dateRange: DateRange;
  years: number[];
  /** Locale-aware date formatter for table cells */
  formatDate: (isoString: string) => string;
}

function buildDateRange(year: number, month: number | null): DateRange {
  const startDate = month ? new Date(year, month - 1, 1) : new Date(year, 0, 1);
  const endDate = month
    ? new Date(year, month, 0, 23, 59, 59)
    : new Date(year, 11, 31, 23, 59, 59);

  return {
    startDate,
    endDate,
    startIso: startDate.toISOString(),
    endIso: endDate.toISOString()
  };
}

function languageToLocale(lang: string): string {
  switch (lang) {
    case 'fa':
      return 'fa-IR';
    case 'ar':
      return 'ar';
    case 'tr':
      return 'tr-TR';
    default:
      return 'en-US';
  }
}

export function useFinancialFilters(): FinancialFilters {
  const { language } = useTranslation();
  const [selectedYear, setSelectedYear] = useState(() =>
    new Date().getFullYear()
  );
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => current - i);
  }, []);

  const dateRange = useMemo(
    () => buildDateRange(selectedYear, selectedMonth),
    [selectedYear, selectedMonth]
  );

  const locale = languageToLocale(language);

  const formatDate = useCallback(
    (isoString: string) =>
      new Date(isoString).toLocaleDateString(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
    [locale]
  );

  return {
    selectedYear,
    selectedMonth,
    setSelectedYear,
    setSelectedMonth,
    dateRange,
    years,
    formatDate
  };
}
