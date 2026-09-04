'use client';

import {
  DataPanel,
  DataList,
  type DataColumn
} from '@/components/shared/data-list';
import { StatusBadge } from '@/components/shared/status-badge';
import {
  apiClient,
  type MetricsCurrency,
  type MetricsQuery,
  type SubscriptionMetricRow,
  type TimeToValueRow
} from '@/lib/api';
import { useTranslation } from '@/lib/i18n/hooks';
import { useMetricFormat } from './metric-format';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import { useMetricsFetch } from '../_hooks/use-metrics-fetch';

interface Props {
  query: MetricsQuery;
  currency: MetricsCurrency;
}

export function SubscriptionsTab({ query, currency }: Props) {
  const { t } = useTranslation();
  const format = useMetricFormat(currency);
  const formatNumber = useNumberFormat();
  const formatDate = useDateFormat();
  const { data, loading } = useMetricsFetch(query, (q) =>
    apiClient.getMetricsSubscriptions(q)
  );
  const { data: ttv, loading: ttvLoading } = useMetricsFetch(query, (q) =>
    apiClient.getMetricsTimeToValue(q)
  );

  const rows = data?.rows ?? [];
  const date = (value: string | null) =>
    value ? formatDate(new Date(value)) : '—';

  const columns: DataColumn<SubscriptionMetricRow>[] = [
    {
      id: 'academy',
      header: t('platformMetrics.columns.academy'),
      cell: (row) => row.academy_name
    },
    {
      id: 'plan',
      header: t('platformMetrics.columns.plan'),
      cell: (row) => row.plan_slug
    },
    {
      id: 'status',
      header: t('platformMetrics.columns.status'),
      cell: (row) => <StatusBadge status={row.status} />
    },
    {
      id: 'amount',
      header: t('platformMetrics.columns.amount'),
      align: 'end',
      cell: (row) => format('last_invoice_amount', row.last_invoice_amount)
    },
    {
      id: 'term',
      header: t('platformMetrics.columns.term'),
      align: 'end',
      cell: (row) =>
        row.last_term_months === null ? '—' : formatNumber(row.last_term_months)
    },
    {
      id: 'invoices',
      header: t('platformMetrics.columns.paidInvoices'),
      align: 'end',
      cell: (row) => formatNumber(row.paid_invoice_count)
    },
    {
      id: 'startsAt',
      header: t('platformMetrics.columns.startsAt'),
      cell: (row) => date(row.last_invoice_starts_at)
    },
    {
      id: 'endsAt',
      header: t('platformMetrics.columns.endsAt'),
      cell: (row) => date(row.last_invoice_ends_at)
    },
    {
      id: 'firstPaid',
      header: t('platformMetrics.columns.firstPaid'),
      cell: (row) => date(row.first_paid_at)
    },
    {
      id: 'lifetimePaid',
      header: t('platformMetrics.columns.lifetimePaid'),
      align: 'end',
      cell: (row) => format('lifetime_paid', row.lifetime_paid)
    }
  ];

  const ttvColumns: DataColumn<TimeToValueRow>[] = [
    {
      id: 'metric',
      header: t('platformMetrics.columns.metric'),
      cell: (row) => {
        const path = `platformMetrics.ttv.${row.metric}`;
        const label = t(path);
        return label === path ? row.metric : label;
      }
    },
    {
      id: 'measured',
      header: t('platformMetrics.columns.measured'),
      align: 'end',
      cell: (row) => formatNumber(row.academies_measured)
    },
    {
      id: 'median',
      header: t('platformMetrics.columns.medianDays'),
      align: 'end',
      cell: (row) =>
        row.median_days === null ? '—' : formatNumber(row.median_days)
    },
    {
      id: 'p75',
      header: t('platformMetrics.columns.p75Days'),
      align: 'end',
      cell: (row) => (row.p75_days === null ? '—' : formatNumber(row.p75_days))
    }
  ];

  return (
    <div className="space-y-6">
      <DataPanel title={t('platformMetrics.tabs.subscriptions')}>
        <DataList
          items={rows}
          columns={columns}
          rowKey={(row) => row.academy_id}
          isLoading={loading}
          emptyState={t('platformMetrics.empty')}
        />
      </DataPanel>

      <DataPanel title={t('platformMetrics.sections.timeToValue')}>
        <DataList
          items={ttv ?? []}
          columns={ttvColumns}
          rowKey={(row) => row.metric}
          isLoading={ttvLoading}
          emptyState={t('platformMetrics.empty')}
        />
      </DataPanel>
    </div>
  );
}
