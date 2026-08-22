'use client';

import { useCurrentAcademy } from '@/hooks/useCurrentAcademy';
import { useCalendarPeriod } from '@/hooks/useCalendarPeriod';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import { useTranslation } from '@/lib/i18n/hooks';
import { PeriodPicker } from '@/components/shared/period-picker';
import { AcademyPaymentsTable } from '@/components/financial/academy-payments-table';
import { PlatformInvoicesCard } from '@/components/financial/platform-invoices-card';

export default function AcademyFinancialPage() {
  const { t } = useTranslation();
  const currentAcademy = useCurrentAcademy();
  const formatDate = useDateFormat();
  const period = useCalendarPeriod();

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
    <div className="w-full space-y-8 p-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b pb-5">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t('financial.store.overview.eyebrow')}
          </p>
          <h1 className="text-2xl font-bold tracking-tight">
            {t('financial.store.overview.paymentsTitle')}
          </h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            {t('financial.store.overview.paymentsDescription2')}
          </p>
        </div>
        <PeriodPicker period={period} />
      </header>

      <AcademyPaymentsTable
        startDate={period.startIso}
        endDate={period.endIso}
        formatDate={formatDate}
      />

      <PlatformInvoicesCard />
    </div>
  );
}
