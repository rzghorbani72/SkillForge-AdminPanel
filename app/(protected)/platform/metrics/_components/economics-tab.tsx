'use client';

import { ScalarMetrics } from './scalar-metrics';
import {
  DataPanel,
  DataList,
  type DataColumn
} from '@/components/shared/data-list';
import {
  apiClient,
  type MetricsQuery,
  type MetricsCurrency,
  type MarketingSpendRow
} from '@/lib/api';
import { useTranslation } from '@/lib/i18n/hooks';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import { useMetricsFetch } from '../_hooks/use-metrics-fetch';
import { useMetricFormat } from './metric-format';

interface Props {
  query: MetricsQuery;
  currency: MetricsCurrency;
}

const CAVEAT_KEYS: Record<string, string> = {
  marketing_spend_not_entered: 'platformMetrics.caveats.marketingSpend',
  runway_requires_cash_balance_not_stored_in_platform:
    'platformMetrics.caveats.runway',
  no_platform_financial_records_for_period:
    'platformMetrics.caveats.financialRecords',
  zero_observed_churn_ltv_undefined: 'platformMetrics.caveats.zeroChurn'
};

export function EconomicsTab({ query, currency }: Props) {
  const { t } = useTranslation();
  const format = useMetricFormat(currency);
  const formatDate = useDateFormat();
  const { data, loading } = useMetricsFetch(query, (q) =>
    apiClient.getMetricsUnitEconomics(q)
  );
  const { data: spend, loading: spendLoading } = useMetricsFetch(query, (q) =>
    apiClient.getMarketingSpend(q)
  );

  const spendColumns: DataColumn<MarketingSpendRow>[] = [
    {
      id: 'channel',
      header: t('platformMetrics.spend.channel'),
      cell: (row) => row.channel
    },
    {
      id: 'amount',
      header: t('platformMetrics.spend.amount'),
      align: 'end',
      cell: (row) => format('amount', row.amount)
    },
    {
      id: 'period',
      header: t('platformMetrics.columns.month'),
      cell: (row) =>
        `${formatDate(new Date(row.period_start))} – ${formatDate(new Date(row.period_end))}`
    },
    {
      id: 'note',
      header: t('platformMetrics.columns.metric'),
      cell: (row) => row.note ?? '—'
    }
  ];

  return (
    <div className="space-y-6">
      <ScalarMetrics
        title={t('platformMetrics.tabs.economics')}
        metrics={data}
        currency={currency}
        loading={loading}
        footer={
          data && data.caveats.length > 0 ? (
            <div className="space-y-1 text-xs text-muted-foreground">
              {data.caveats.map((code) => (
                <p key={code}>{t(CAVEAT_KEYS[code] ?? code)}</p>
              ))}
            </div>
          ) : undefined
        }
      />

      <DataPanel title={t('platformMetrics.spend.title')}>
        <DataList
          items={spend ?? []}
          columns={spendColumns}
          rowKey={(row) => row.id}
          isLoading={spendLoading}
          emptyState={t('platformMetrics.empty')}
        />
      </DataPanel>
    </div>
  );
}
