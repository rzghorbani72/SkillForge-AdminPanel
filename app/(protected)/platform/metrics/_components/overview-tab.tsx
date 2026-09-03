'use client';

import { useEffect, useState } from 'react';
import {
  TrendingUp,
  Users,
  Building2,
  GraduationCap,
  Repeat,
  Wallet
} from 'lucide-react';
import { StatsCard } from '@/components/shared/stats-card';
import {
  DataPanel,
  DataList,
  type DataColumn
} from '@/components/shared/data-list';
import { apiClient, type FlatMetrics, type MetricsQuery } from '@/lib/api';
import { useTranslation } from '@/lib/i18n/hooks';
import { useMetricFormat } from './metric-format';
import type { MetricsCurrency } from '@/lib/api';

interface Props {
  query: MetricsQuery;
  currency: MetricsCurrency;
}

/** The six figures an investor asks for first, in the order they ask. */
const HEADLINE = [
  { key: 'mrr', icon: TrendingUp },
  { key: 'arr', icon: Wallet },
  { key: 'paying_academies', icon: Building2 },
  { key: 'nrr', icon: Repeat },
  { key: 'total_users', icon: Users },
  { key: 'learning_records', icon: GraduationCap }
] as const;

export function OverviewTab({ query, currency }: Props) {
  const { t } = useTranslation();
  const format = useMetricFormat(currency);
  const [metrics, setMetrics] = useState<FlatMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    apiClient
      .getMetricsOverview(query)
      .then((result) => {
        if (active) setMetrics(result.metrics);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [query]);

  const rows = Object.entries(metrics ?? {}).map(([key, value]) => ({
    key,
    value
  }));

  const columns: DataColumn<{ key: string; value: number | null }>[] = [
    {
      id: 'metric',
      header: t('platformMetrics.columns.metric'),
      cell: (row) => t(`platformMetrics.metrics.${row.key}`) || row.key
    },
    {
      id: 'value',
      header: t('platformMetrics.columns.value'),
      align: 'end',
      cell: (row) => format(row.key, row.value)
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {HEADLINE.map(({ key, icon }) => (
          <StatsCard
            key={key}
            title={t(`platformMetrics.metrics.${key}`)}
            value={format(key, metrics?.[key] ?? null)}
            icon={icon}
          />
        ))}
      </div>

      <DataPanel title={t('platformMetrics.title')}>
        <DataList
          items={rows}
          columns={columns}
          rowKey={(row) => row.key}
          isLoading={loading}
          emptyState={t('platformMetrics.empty')}
        />
      </DataPanel>
    </div>
  );
}
