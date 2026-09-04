'use client';

import { useCallback, useState } from 'react';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { apiClient, type MetricsCurrency } from '@/lib/api';
import { useTranslation, useLanguage } from '@/lib/i18n/hooks';
import { useMetricsControls } from '../_hooks/use-metrics-controls';
import { OverviewTab } from './overview-tab';
import { RevenueTab } from './revenue-tab';
import { SubscriptionsTab } from './subscriptions-tab';
import { CohortsTab } from './cohorts-tab';
import { ReconciliationTab } from './reconciliation-tab';
import { TransactionsTab } from './transactions-tab';
import { UsersTab } from './users-tab';
import { CatalogTab } from './catalog-tab';
import { EconomicsTab } from './economics-tab';
import { METRICS_TABS, TabGuide } from './tab-guide';

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
  const { isRTL } = useLanguage();
  const { query } = useMetricsControls();
  const currency: MetricsCurrency = 'TOMAN';
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

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title={t('platformMetrics.title')}
        description={t('platformMetrics.subtitle')}
      >
        <div className="flex flex-wrap items-center gap-2">
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

      <Tabs defaultValue="overview" dir={isRTL ? 'rtl' : 'ltr'}>
        <TooltipProvider delayDuration={200}>
          <TabsList className="flex h-auto w-full flex-wrap justify-start">
            {METRICS_TABS.map((tab) => (
              <TabsTrigger key={tab} value={tab}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>{t(`platformMetrics.tabs.${tab}`)}</span>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    className="max-w-xs whitespace-normal text-xs"
                  >
                    {t(`platformMetrics.guides.${tab}`)}
                  </TooltipContent>
                </Tooltip>
              </TabsTrigger>
            ))}
          </TabsList>
        </TooltipProvider>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <TabGuide tab="overview" />
          <OverviewTab query={query} currency={currency} />
        </TabsContent>
        <TabsContent value="revenue" className="mt-4 space-y-4">
          <TabGuide tab="revenue" />
          <RevenueTab query={query} currency={currency} />
        </TabsContent>
        <TabsContent value="cohorts" className="mt-4 space-y-4">
          <TabGuide tab="cohorts" />
          <CohortsTab query={query} currency={currency} />
        </TabsContent>
        <TabsContent value="subscriptions" className="mt-4 space-y-4">
          <TabGuide tab="subscriptions" />
          <SubscriptionsTab query={query} currency={currency} />
        </TabsContent>
        <TabsContent value="transactions" className="mt-4 space-y-4">
          <TabGuide tab="transactions" />
          <TransactionsTab query={query} currency={currency} />
        </TabsContent>
        <TabsContent value="users" className="mt-4 space-y-4">
          <TabGuide tab="users" />
          <UsersTab query={query} currency={currency} />
        </TabsContent>
        <TabsContent value="catalog" className="mt-4 space-y-4">
          <TabGuide tab="catalog" />
          <CatalogTab query={query} currency={currency} />
        </TabsContent>
        <TabsContent value="economics" className="mt-4 space-y-4">
          <TabGuide tab="economics" />
          <EconomicsTab query={query} currency={currency} />
        </TabsContent>
        <TabsContent value="reconciliation" className="mt-4 space-y-4">
          <TabGuide tab="reconciliation" />
          <ReconciliationTab query={query} currency={currency} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
