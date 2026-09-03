'use client';

import { useEffect, useState } from 'react';
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
  type SubscriptionMetricRow
} from '@/lib/api';
import { useTranslation } from '@/lib/i18n/hooks';
import { useMetricFormat } from './metric-format';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { useDateFormat } from '@/lib/i18n/use-date-format';

interface Props {
  query: MetricsQuery;
  currency: MetricsCurrency;
}

export function SubscriptionsTab({ query, currency }: Props) {
  const { t } = useTranslation();
  const format = useMetricFormat(currency);
  const formatNumber = useNumberFormat();
  const formatDate = useDateFormat();
  const [rows, setRows] = useState<SubscriptionMetricRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    apiClient
      .getMetricsSubscriptions(query)
      .then((result) => {
        if (active) setRows(result.rows);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [query]);

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

  return (
    <DataPanel title={t('platformMetrics.tabs.subscriptions')}>
      <DataList
        items={rows}
        columns={columns}
        rowKey={(row) => row.academy_id}
        isLoading={loading}
        emptyState={t('platformMetrics.empty')}
      />
    </DataPanel>
  );
}
