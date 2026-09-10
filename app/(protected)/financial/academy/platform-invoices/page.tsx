'use client';

import Link from '@/components/ui/link';
import { useCurrentAcademy } from '@/hooks/useCurrentAcademy';
import { useTranslation } from '@/lib/i18n/hooks';
import { PlatformInvoicesCard } from '@/components/financial/platform-invoices-card';
import { Button } from '@/components/ui/button';

export default function AcademyPlatformInvoicesPage() {
  const { t } = useTranslation();
  const currentAcademy = useCurrentAcademy();

  if (!currentAcademy) {
    return (
      <div className="flex flex-1 items-center justify-center p-4 sm:p-6">
        <p className="text-muted-foreground">
          {t('financial.store.overview.noStore')}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 p-4 sm:p-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b pb-5">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t('financial.store.overview.platformBillingEyebrow')}
          </p>
          <h1 className="text-2xl font-bold tracking-tight">
            {t('financial.store.overview.platformPayments')}
          </h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            {t('financial.store.overview.platformPaymentsHint')}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/plans">{t('navigation.platformPlan')}</Link>
        </Button>
      </header>

      <PlatformInvoicesCard showHeader={false} />
    </div>
  );
}
