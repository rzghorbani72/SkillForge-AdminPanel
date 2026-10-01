'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslation } from '@/lib/i18n/hooks';
import type { Dispatch, SetStateAction } from 'react';

export function ReportsFiltersCard({
  locale,
  selectedMonth,
  selectedYear,
  setSelectedMonth,
  setSelectedYear,
  years,
}: {
  locale: 'fa-IR';
  selectedMonth: number | null;
  selectedYear: number;
  setSelectedMonth: Dispatch<SetStateAction<number | null>>;
  setSelectedYear: Dispatch<SetStateAction<number>>;
  years: number[];
}) {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('financial.store.reports.filters')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium">
              {t('financial.store.reports.year')}
            </label>
            <Select
              value={selectedYear.toString()}
              onValueChange={(value) => setSelectedYear(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium">
              {t('financial.store.reports.month')}
            </label>
            <Select
              value={selectedMonth?.toString() || 'all'}
              onValueChange={(value) => setSelectedMonth(value === 'all' ? null : parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('financial.store.reports.allMonths')}</SelectItem>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <SelectItem key={month} value={month.toString()}>
                    {new Date(2000, month - 1).toLocaleString(locale, {
                      month: 'long',
                    })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
