'use client';

import { useCallback, useEffect, useState } from 'react';
import { Wallet } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { BillingOverviewTable } from '@/components/billing/billing-overview-table';
import { apiClient, type AcademySubscriptionOverviewRow } from '@/lib/api';
import { useTranslation } from '@/lib/i18n/hooks';

/**
 * Every academy the owner pays for, side by side. Each academy's own page shows
 * only its own invoices — showing a sibling's spend there would leak one
 * tenant's money into another's context — so this is where the total lives.
 */
export default function BillingOverviewPage() {
  const { t } = useTranslation();
  const [rows, setRows] = useState<AcademySubscriptionOverviewRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setRows(await apiClient.getSubscriptionsOverview());
    } catch {
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="flex-1 space-y-6 p-6">
      <PageHeader
        icon={<Wallet className="h-5 w-5" />}
        title={t('billing.title')}
        description={t('billing.description')}
        scope="platform"
      />
      <BillingOverviewTable rows={rows} isLoading={isLoading} />
    </div>
  );
}
