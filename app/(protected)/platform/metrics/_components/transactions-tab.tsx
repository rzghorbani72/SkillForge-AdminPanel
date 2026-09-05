'use client';

import { StatsCard } from '@/components/shared/stats-card';
import {
  DataPanel,
  DataList,
  type DataColumn
} from '@/components/shared/data-list';
import { apiClient, type MetricsQuery, type MetricsCurrency } from '@/lib/api';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { useMetricsFetch } from '../_hooks/use-metrics-fetch';
import { useMetricFormat } from './metric-format';
import { MonthlyBars } from './monthly-bars';
import { METRIC_VALUE_CLASS, usePeriodLabel } from './period-label';
import { Wallet, CreditCard, RotateCcw, ShoppingCart } from 'lucide-react';

interface Props {
  query: MetricsQuery;
  currency: MetricsCurrency;
}

interface BreakdownRow {
  key: string;
  count: number;
  amount: number;
}

export function TransactionsTab({ query, currency }: Props) {
  const { t } = useTranslation();
  const format = useMetricFormat(currency);
  const formatNumber = useNumberFormat();
  const periodLabel = usePeriodLabel();
  const { data, loading } = useMetricsFetch(query, (q) =>
    apiClient.getMetricsTransactions(q)
  );

  const breakdownColumns: DataColumn<BreakdownRow>[] = [
    {
      id: 'key',
      header: t('platformMetrics.columns.key'),
      cell: (row) => row.key
    },
    {
      id: 'count',
      header: t('platformMetrics.columns.count'),
      align: 'end',
      className: METRIC_VALUE_CLASS,
      cell: (row) => formatNumber(row.count)
    },
    {
      id: 'amount',
      header: t('platformMetrics.columns.amount'),
      align: 'end',
      className: METRIC_VALUE_CLASS,
      cell: (row) => format('amount', row.amount)
    }
  ];

  const monthlyColumns: DataColumn<{
    month: string;
    count: number;
    amount: number;
  }>[] = [
    {
      id: 'month',
      header: t('platformMetrics.columns.month'),
      className: METRIC_VALUE_CLASS,
      cell: (row) => periodLabel(row.month)
    },
    {
      id: 'count',
      header: t('platformMetrics.columns.count'),
      align: 'end',
      className: METRIC_VALUE_CLASS,
      cell: (row) => formatNumber(row.count)
    },
    {
      id: 'amount',
      header: t('platformMetrics.columns.amount'),
      align: 'end',
      className: METRIC_VALUE_CLASS,
      cell: (row) => format('amount', row.amount)
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t('platformMetrics.metrics.paid_amount')}
          value={format('paid_amount', data?.paid_amount ?? null)}
          icon={Wallet}
          description={t('platformMetrics.metrics.gmv_paid_amount')}
        />
        <StatsCard
          title={t('platformMetrics.metrics.paid_count')}
          value={format('paid_count', data?.paid_count ?? null)}
          icon={CreditCard}
        />
        <StatsCard
          title={t('platformMetrics.metrics.checkout_success_rate')}
          value={format(
            'checkout_success_rate',
            data?.checkout_success_rate ?? null
          )}
          icon={ShoppingCart}
        />
        <StatsCard
          title={t('platformMetrics.metrics.refunded_amount')}
          value={format('refunded_amount', data?.refunded_amount ?? null)}
          icon={RotateCcw}
          description={`${t('platformMetrics.metrics.open_refund_requests')}: ${format('open_refund_requests', data?.open_refund_requests ?? null)}`}
        />
      </div>

      {(
        [
          ['byStatus', data?.by_status],
          ['byProvider', data?.by_provider],
          ['byMethod', data?.by_method]
        ] as const
      ).map(([section, rows]) => (
        <DataPanel
          key={section}
          title={t(`platformMetrics.sections.${section}`)}
        >
          <DataList
            items={rows ?? []}
            columns={breakdownColumns}
            rowKey={(row) => row.key}
            isLoading={loading}
            emptyState={t('platformMetrics.empty')}
          />
        </DataPanel>
      ))}

      <DataPanel title={t('platformMetrics.sections.monthly')}>
        <MonthlyBars
          data={data?.monthly ?? []}
          dataKey="amount"
          name={t('platformMetrics.columns.amount')}
        />
        <DataList
          items={data?.monthly ?? []}
          columns={monthlyColumns}
          rowKey={(row) => row.month}
          isLoading={loading}
          emptyState={t('platformMetrics.empty')}
        />
      </DataPanel>
    </div>
  );
}
