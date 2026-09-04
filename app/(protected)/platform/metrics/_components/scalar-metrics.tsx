'use client';

import type { ReactNode } from 'react';
import {
  DataPanel,
  DataList,
  type DataColumn
} from '@/components/shared/data-list';
import { useTranslation } from '@/lib/i18n/hooks';
import { useMetricFormat } from './metric-format';
import type { MetricsCurrency } from '@/lib/api';

export interface ScalarRow {
  key: string;
  value: number | null;
}

interface ScalarMetricsProps {
  title: string;
  metrics: object | null;
  currency: MetricsCurrency;
  loading?: boolean;
  footer?: ReactNode;
}

function scalarRows(metrics: object | null): ScalarRow[] {
  if (!metrics) return [];
  return Object.entries(metrics)
    .filter(([, value]) => typeof value === 'number' || value === null)
    .map(([key, value]) => ({ key, value: value as number | null }));
}

export function ScalarMetrics({
  title,
  metrics,
  currency,
  loading = false,
  footer
}: ScalarMetricsProps) {
  const { t } = useTranslation();
  const format = useMetricFormat(currency);
  const rows = scalarRows(metrics);

  const columns: DataColumn<ScalarRow>[] = [
    {
      id: 'metric',
      header: t('platformMetrics.columns.metric'),
      cell: (row) => {
        const path = `platformMetrics.metrics.${row.key}`;
        const label = t(path);
        return label === path ? row.key : label;
      }
    },
    {
      id: 'value',
      header: t('platformMetrics.columns.value'),
      align: 'end',
      cell: (row) => format(row.key, row.value)
    }
  ];

  return (
    <DataPanel title={title} footer={footer}>
      <DataList
        items={rows}
        columns={columns}
        rowKey={(row) => row.key}
        isLoading={loading}
        emptyState={t('platformMetrics.empty')}
      />
    </DataPanel>
  );
}
