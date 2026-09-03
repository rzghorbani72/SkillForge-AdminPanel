'use client';

import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import {
  DataPanel,
  DataList,
  type DataColumn
} from '@/components/shared/data-list';
import {
  apiClient,
  type MetricsCurrency,
  type MetricsQuery,
  type MrrBridgeMonth,
  type MetricsRetention
} from '@/lib/api';
import { useTranslation } from '@/lib/i18n/hooks';
import { useMetricFormat } from './metric-format';

interface Props {
  query: MetricsQuery;
  currency: MetricsCurrency;
}

export function RevenueTab({ query, currency }: Props) {
  const { t } = useTranslation();
  const format = useMetricFormat(currency);
  const [bridge, setBridge] = useState<MrrBridgeMonth[]>([]);
  const [retention, setRetention] = useState<MetricsRetention | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    apiClient
      .getMetricsRevenue(query)
      .then((result) => {
        if (!active) return;
        setBridge(result.bridge);
        setRetention(result.retention);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [query]);

  const columns: DataColumn<MrrBridgeMonth>[] = [
    {
      id: 'month',
      header: t('platformMetrics.columns.month'),
      cell: (row) => row.month
    },
    {
      id: 'starting',
      header: t('platformMetrics.bridge.starting'),
      align: 'end',
      cell: (row) => format('starting_mrr', row.starting_mrr)
    },
    {
      id: 'new',
      header: t('platformMetrics.bridge.new'),
      align: 'end',
      cell: (row) => format('new_mrr', row.new_mrr)
    },
    {
      id: 'expansion',
      header: t('platformMetrics.bridge.expansion'),
      align: 'end',
      cell: (row) => format('expansion_mrr', row.expansion_mrr)
    },
    {
      id: 'contraction',
      header: t('platformMetrics.bridge.contraction'),
      align: 'end',
      cell: (row) => format('contraction_mrr', row.contraction_mrr)
    },
    {
      id: 'churned',
      header: t('platformMetrics.bridge.churned'),
      align: 'end',
      cell: (row) => format('churned_mrr', row.churned_mrr)
    },
    {
      id: 'ending',
      header: t('platformMetrics.bridge.ending'),
      align: 'end',
      cell: (row) => format('ending_mrr', row.ending_mrr)
    }
  ];

  return (
    <div className="space-y-6">
      <DataPanel
        title={t('platformMetrics.bridge.title')}
        subtitle={
          retention
            ? `${t('platformMetrics.metrics.nrr')}: ${format('nrr', retention.nrr)} · ${t('platformMetrics.metrics.grr')}: ${format('grr', retention.grr)}`
            : undefined
        }
      >
        <div className="h-72 w-full overflow-x-auto">
          <ResponsiveContainer width="100%" height="100%" minWidth={480}>
            <BarChart data={bridge}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} width={80} />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="new_mrr"
                name={t('platformMetrics.bridge.new')}
                stackId="a"
                fill="#2563eb"
              />
              <Bar
                dataKey="expansion_mrr"
                name={t('platformMetrics.bridge.expansion')}
                stackId="a"
                fill="#10b981"
              />
              <Bar
                dataKey="churned_mrr"
                name={t('platformMetrics.bridge.churned')}
                stackId="a"
                fill="#ef4444"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </DataPanel>

      <DataPanel title={t('platformMetrics.tabs.revenue')}>
        <DataList
          items={bridge}
          columns={columns}
          rowKey={(row) => row.month}
          isLoading={loading}
          emptyState={t('platformMetrics.empty')}
        />
      </DataPanel>
    </div>
  );
}
