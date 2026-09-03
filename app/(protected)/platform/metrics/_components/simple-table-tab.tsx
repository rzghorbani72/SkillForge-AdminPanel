'use client';

import { useEffect, useState } from 'react';
import {
  DataPanel,
  DataList,
  type DataColumn
} from '@/components/shared/data-list';
import { useTranslation } from '@/lib/i18n/hooks';
import { useMetricFormat } from './metric-format';
import type { MetricsCurrency } from '@/lib/api';

export interface KeyValueRow {
  key: string;
  value: number | null;
}

/**
 * Renders any flat metric object as a metric/value table.
 * Used by the tabs whose payload is a summary rather than a time series, so
 * each one stays a thin data fetch instead of its own bespoke layout.
 */
export function KeyValuePanel({
  title,
  load,
  currency,
  translateKeys = true,
  footer
}: {
  title: string;
  load: () => Promise<object>;
  currency: MetricsCurrency;
  translateKeys?: boolean;
  footer?: React.ReactNode;
}) {
  const { t } = useTranslation();
  const format = useMetricFormat(currency);
  const [rows, setRows] = useState<KeyValueRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    load()
      .then((data) => {
        if (!active) return;
        setRows(
          Object.entries(data as Record<string, unknown>)
            .filter(([, value]) => typeof value === 'number' || value === null)
            .map(([key, value]) => ({ key, value: value as number | null }))
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // `load` is recreated per render by design; the caller memoises its query.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currency, title]);

  const columns: DataColumn<KeyValueRow>[] = [
    {
      id: 'metric',
      header: t('platformMetrics.columns.metric'),
      cell: (row) =>
        translateKeys
          ? t(`platformMetrics.metrics.${row.key}`) || row.key
          : row.key
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
