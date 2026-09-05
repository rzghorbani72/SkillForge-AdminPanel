'use client';

import {
  DataPanel,
  DataList,
  type DataColumn
} from '@/components/shared/data-list';
import {
  apiClient,
  type MetricsQuery,
  type MetricsCurrency,
  type MrrBridgeMonth,
  type ChurnMonth
} from '@/lib/api';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { useMetricsFetch } from '../_hooks/use-metrics-fetch';
import { useMetricFormat } from './metric-format';
import { METRIC_VALUE_CLASS, usePeriodLabel } from './period-label';
import { MrrBridgeChart } from './mrr-bridge-chart';

interface Props {
  query: MetricsQuery;
  currency: MetricsCurrency;
}

interface PlanRow {
  month: string;
  plan: string;
  amount: number;
}

export function RevenueTab({ query, currency }: Props) {
  const { t } = useTranslation();
  const format = useMetricFormat(currency);
  const formatNumber = useNumberFormat();
  const periodLabel = usePeriodLabel();
  const { data, loading } = useMetricsFetch(query, (q) =>
    apiClient.getMetricsRevenue(q)
  );
  const { data: churnData, loading: churnLoading } = useMetricsFetch(
    query,
    (q) => apiClient.getMetricsChurn(q)
  );

  const bridge = data?.bridge ?? [];
  const planRows: PlanRow[] = bridge.flatMap((month) =>
    Object.entries(month.by_plan).map(([plan, amount]) => ({
      month: month.month,
      plan,
      amount
    }))
  );
  const churn = churnData?.churn ?? [];

  const columns: DataColumn<MrrBridgeMonth>[] = [
    {
      id: 'month',
      header: t('platformMetrics.columns.month'),
      className: METRIC_VALUE_CLASS,
      cell: (row) => periodLabel(row.month)
    },
    {
      id: 'starting',
      header: t('platformMetrics.bridge.starting'),
      align: 'end',
      className: METRIC_VALUE_CLASS,
      cell: (row) => format('starting_mrr', row.starting_mrr)
    },
    {
      id: 'new',
      header: t('platformMetrics.bridge.new'),
      align: 'end',
      className: METRIC_VALUE_CLASS,
      cell: (row) => format('new_mrr', row.new_mrr)
    },
    {
      id: 'expansion',
      header: t('platformMetrics.bridge.expansion'),
      align: 'end',
      className: METRIC_VALUE_CLASS,
      cell: (row) => format('expansion_mrr', row.expansion_mrr)
    },
    {
      id: 'contraction',
      header: t('platformMetrics.bridge.contraction'),
      align: 'end',
      className: METRIC_VALUE_CLASS,
      cell: (row) => format('contraction_mrr', row.contraction_mrr)
    },
    {
      id: 'churned',
      header: t('platformMetrics.bridge.churned'),
      align: 'end',
      className: METRIC_VALUE_CLASS,
      cell: (row) => format('churned_mrr', row.churned_mrr)
    },
    {
      id: 'ending',
      header: t('platformMetrics.bridge.ending'),
      align: 'end',
      className: METRIC_VALUE_CLASS,
      cell: (row) => format('ending_mrr', row.ending_mrr)
    },
    {
      id: 'paying',
      header: t('platformMetrics.metrics.paying_academies'),
      align: 'end',
      className: METRIC_VALUE_CLASS,
      cell: (row) => formatNumber(row.paying_academies)
    },
    {
      id: 'arpa',
      header: t('platformMetrics.metrics.arpa'),
      align: 'end',
      className: METRIC_VALUE_CLASS,
      cell: (row) => format('arpa', row.arpa)
    }
  ];

  const planColumns: DataColumn<PlanRow>[] = [
    {
      id: 'month',
      header: t('platformMetrics.columns.month'),
      className: METRIC_VALUE_CLASS,
      cell: (row) => periodLabel(row.month)
    },
    {
      id: 'plan',
      header: t('platformMetrics.columns.plan'),
      cell: (row) => row.plan
    },
    {
      id: 'amount',
      header: t('platformMetrics.columns.amount'),
      align: 'end',
      className: METRIC_VALUE_CLASS,
      cell: (row) => format('amount', row.amount)
    }
  ];

  const churnColumns: DataColumn<ChurnMonth>[] = [
    {
      id: 'month',
      header: t('platformMetrics.columns.month'),
      className: METRIC_VALUE_CLASS,
      cell: (row) => periodLabel(row.month)
    },
    {
      id: 'starting',
      header: t('platformMetrics.columns.startingAcademies'),
      align: 'end',
      className: METRIC_VALUE_CLASS,
      cell: (row) => formatNumber(row.starting_academies)
    },
    {
      id: 'new',
      header: t('platformMetrics.columns.newAcademies'),
      align: 'end',
      className: METRIC_VALUE_CLASS,
      cell: (row) => formatNumber(row.new_academies)
    },
    {
      id: 'churned',
      header: t('platformMetrics.columns.churnedAcademies'),
      align: 'end',
      className: METRIC_VALUE_CLASS,
      cell: (row) => formatNumber(row.churned_academies)
    },
    {
      id: 'rate',
      header: t('platformMetrics.metrics.monthly_logo_churn'),
      align: 'end',
      className: METRIC_VALUE_CLASS,
      cell: (row) => format('logo_churn_rate', row.logo_churn_rate)
    }
  ];

  return (
    <div className="space-y-6">
      <MrrBridgeChart
        bridge={bridge}
        retention={data?.retention ?? null}
        currency={currency}
      />

      <DataPanel title={t('platformMetrics.tabs.revenue')}>
        <DataList
          items={bridge}
          columns={columns}
          rowKey={(row) => row.month}
          isLoading={loading}
          emptyState={t('platformMetrics.empty')}
        />
      </DataPanel>

      <DataPanel title={t('platformMetrics.sections.byPlan')}>
        <DataList
          items={planRows}
          columns={planColumns}
          rowKey={(row) => `${row.month}:${row.plan}`}
          isLoading={loading}
          emptyState={t('platformMetrics.empty')}
        />
      </DataPanel>

      <DataPanel title={t('platformMetrics.sections.churn')}>
        <DataList
          items={churn}
          columns={churnColumns}
          rowKey={(row) => row.month}
          isLoading={churnLoading}
          emptyState={t('platformMetrics.empty')}
        />
      </DataPanel>
    </div>
  );
}
