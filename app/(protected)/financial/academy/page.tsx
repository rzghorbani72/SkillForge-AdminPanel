'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays } from 'lucide-react';
import { useCurrentAcademy } from '@/hooks/useCurrentAcademy';
import { useFinancialFilters } from '@/hooks/useFinancialFilters';
import { useTranslation } from '@/lib/i18n/hooks';
import { FinancialFilterBar } from '@/components/financial/FinancialFilterBar';
import { AcademyPaymentsTable } from '@/components/financial/academy-payments-table';
import { PlatformInvoicesCard } from '@/components/financial/platform-invoices-card';

export default function AcademyFinancialPage() {
  const { t } = useTranslation();
  const currentAcademy = useCurrentAcademy();
  const {
    selectedYear,
    selectedMonth,
    setSelectedYear,
    setSelectedMonth,
    dateRange,
    years,
    formatDate
  } = useFinancialFilters();

  const [showFilters, setShowFilters] = useState(false);

  if (!currentAcademy) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <p className="text-muted-foreground">
          {t('financial.store.overview.noStore')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t('financial.store.overview.eyebrow')}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">
            {t('financial.store.overview.paymentsTitle')}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('financial.store.overview.paymentsDescription2')}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters((value) => !value)}
        >
          <CalendarDays className="h-4 w-4" />
          {t('financial.store.overview.dateRange')}
        </Button>
      </div>

      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <FinancialFilterBar
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              years={years}
              onYearChange={setSelectedYear}
              onMonthChange={setSelectedMonth}
            />
          </CardContent>
        </Card>
      )}

      <AcademyPaymentsTable
        startDate={dateRange.startIso}
        endDate={dateRange.endIso}
        formatDate={formatDate}
      />

      <PlatformInvoicesCard />
    </div>
  );
}
