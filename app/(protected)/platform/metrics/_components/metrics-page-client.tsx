'use client';

import { useCallback, useMemo, useState } from 'react';
import { Download, RefreshCcw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { PageHeader } from '@/components/shared/PageHeader';
import { apiClient, type MetricsCurrency } from '@/lib/api';
import { useTranslation } from '@/lib/i18n/hooks';
import { useMetricsControls } from '../_hooks/use-metrics-controls';
import { OverviewTab } from './overview-tab';
import { RevenueTab } from './revenue-tab';
import { SubscriptionsTab } from './subscriptions-tab';
import { CohortsTab } from './cohorts-tab';
import { ReconciliationTab } from './reconciliation-tab';
import { KeyValuePanel } from './simple-table-tab';

const TABS = [
  'overview',
  'revenue',
  'cohorts',
  'subscriptions',
  'transactions',
  'users',
  'catalog',
  'economics',
  'reconciliation'
] as const;

/** Saves a fetched Blob under a filename without leaving the page. */
function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function MetricsPageClient() {
  const { t } = useTranslation();
  const { query, currency, setCurrency } = useMetricsControls();
  const [busy, setBusy] = useState(false);

  const download = useCallback(
    async (format: 'csv' | 'json') => {
      setBusy(true);
      try {
        const blob = await apiClient.downloadMetricsDataRoom(query, format);
        const stamp = new Date().toISOString().slice(0, 10);
        saveBlob(blob, `mentoma-data-room-${stamp}.${format}`);
      } finally {
        setBusy(false);
      }
    },
    [query]
  );

  const closeMonths = useCallback(async () => {
    setBusy(true);
    try {
      await apiClient.runMetricsSnapshot();
    } finally {
      setBusy(false);
    }
  }, []);

  const toggleCurrency = useCallback(() => {
    setCurrency((current: MetricsCurrency) =>
      current === 'TOMAN' ? 'EUR' : 'TOMAN'
    );
  }, [setCurrency]);

  // Widened to the panel's contract: it renders whatever numeric fields the
  // payload happens to carry, so each tab is a fetch rather than a layout.
  const loaders = useMemo<Record<string, () => Promise<object>>>(
    () => ({
      transactions: () => apiClient.getMetricsTransactions(query),
      users: () => apiClient.getMetricsUsers(query),
      catalog: () => apiClient.getMetricsCatalog(query),
      economics: () => apiClient.getMetricsUnitEconomics(query)
    }),
    [query]
  );

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title={t('platformMetrics.title')}
        description={t('platformMetrics.subtitle')}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={toggleCurrency}>
            {currency === 'TOMAN'
              ? t('platformMetrics.currency.toman')
              : t('platformMetrics.currency.eur')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={closeMonths}
            disabled={busy}
          >
            <RefreshCcw className="me-1.5 size-4" />
            {t('platformMetrics.refreshSnapshot')}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" disabled={busy}>
                <Download className="me-1.5 size-4" />
                {t('platformMetrics.download')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => download('csv')}>
                {t('platformMetrics.downloadCsv')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => download('json')}>
                {t('platformMetrics.downloadJson')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </PageHeader>

      <Tabs defaultValue="overview" dir="rtl">
        <TabsList className="flex w-full flex-wrap justify-start">
          {TABS.map((tab) => (
            <TabsTrigger key={tab} value={tab}>
              {t(`platformMetrics.tabs.${tab}`)}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <OverviewTab query={query} currency={currency} />
        </TabsContent>
        <TabsContent value="revenue" className="mt-4">
          <RevenueTab query={query} currency={currency} />
        </TabsContent>
        <TabsContent value="cohorts" className="mt-4">
          <CohortsTab query={query} currency={currency} />
        </TabsContent>
        <TabsContent value="subscriptions" className="mt-4">
          <SubscriptionsTab query={query} currency={currency} />
        </TabsContent>
        <TabsContent value="transactions" className="mt-4">
          <KeyValuePanel
            title={t('platformMetrics.tabs.transactions')}
            load={loaders.transactions}
            currency={currency}
            translateKeys={false}
          />
        </TabsContent>
        <TabsContent value="users" className="mt-4">
          <KeyValuePanel
            title={t('platformMetrics.tabs.users')}
            load={loaders.users}
            currency={currency}
          />
        </TabsContent>
        <TabsContent value="catalog" className="mt-4">
          <KeyValuePanel
            title={t('platformMetrics.tabs.catalog')}
            load={loaders.catalog}
            currency={currency}
            translateKeys={false}
          />
        </TabsContent>
        <TabsContent value="economics" className="mt-4">
          <KeyValuePanel
            title={t('platformMetrics.tabs.economics')}
            load={loaders.economics}
            currency={currency}
            footer={
              <div className="space-y-1 p-4 text-xs text-muted-foreground">
                <p>{t('platformMetrics.caveats.marketingSpend')}</p>
                <p>{t('platformMetrics.caveats.runway')}</p>
              </div>
            }
          />
        </TabsContent>
        <TabsContent value="reconciliation" className="mt-4">
          <ReconciliationTab query={query} currency={currency} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
