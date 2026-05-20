'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/lib/i18n/hooks';

interface FinancialFilterBarProps {
  selectedYear: number;
  selectedMonth: number | null;
  years: number[];
  onYearChange: (year: number) => void;
  onMonthChange: (month: number | null) => void;
}

export function FinancialFilterBar({
  selectedYear,
  selectedMonth,
  years,
  onYearChange,
  onMonthChange
}: FinancialFilterBarProps) {
  const { t, language } = useTranslation();

  const locale =
    language === 'fa'
      ? 'fa-IR'
      : language === 'ar'
        ? 'ar'
        : language === 'tr'
          ? 'tr-TR'
          : 'en-US';

  return (
    <div className="flex flex-wrap gap-4">
      <div className="min-w-[120px] space-y-1.5">
        <Label className="text-xs text-muted-foreground">
          {t('financial.store.overview.year')}
        </Label>
        <Select
          value={selectedYear.toString()}
          onValueChange={(v) => onYearChange(parseInt(v))}
        >
          <SelectTrigger className="h-9">
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

      <div className="min-w-[160px] space-y-1.5">
        <Label className="text-xs text-muted-foreground">
          {t('financial.store.overview.month')}
        </Label>
        <Select
          value={selectedMonth?.toString() ?? 'all'}
          onValueChange={(v) => onMonthChange(v === 'all' ? null : parseInt(v))}
        >
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {t('financial.store.overview.allMonths')}
            </SelectItem>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <SelectItem key={month} value={month.toString()}>
                {new Date(2000, month - 1).toLocaleString(locale, {
                  month: 'long'
                })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
