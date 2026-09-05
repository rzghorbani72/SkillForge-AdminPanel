'use client';

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
import { DataPanel } from '@/components/shared/data-list';
import type { MetricsRetention, MrrBridgeMonth } from '@/lib/api';
import { useTranslation } from '@/lib/i18n/hooks';
import { useMetricFormat } from './metric-format';
import { usePeriodLabel } from './period-label';
import type { MetricsCurrency } from '@/lib/api';

interface Props {
  bridge: MrrBridgeMonth[];
  retention: MetricsRetention | null;
  currency: MetricsCurrency;
}

export function MrrBridgeChart({ bridge, retention, currency }: Props) {
  const { t } = useTranslation();
  const format = useMetricFormat(currency);
  const periodLabel = usePeriodLabel();

  return (
    <DataPanel
      title={t('platformMetrics.bridge.title')}
      subtitle={
        retention
          ? `${t('platformMetrics.metrics.nrr')}: ${format('nrr', retention.nrr)} · ${t('platformMetrics.metrics.grr')}: ${format('grr', retention.grr)} · ${t('platformMetrics.metrics.logo_retention')}: ${format('logo_retention', retention.logo_retention)}`
          : undefined
      }
    >
      <div className="h-72 w-full overflow-x-auto">
        <ResponsiveContainer width="100%" height="100%" minWidth={480}>
          <BarChart data={bridge}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 14 }}
              tickFormatter={periodLabel}
            />
            <YAxis
              tick={{ fontSize: 14 }}
              width={96}
              tickFormatter={(value: number) => format('mrr', value)}
            />
            <Tooltip
              labelFormatter={(label: string) => periodLabel(label)}
              formatter={(value: number) => format('mrr', value)}
            />
            <Legend />
            <Bar
              dataKey="new_mrr"
              name={t('platformMetrics.bridge.new')}
              stackId="a"
              fill="hsl(var(--primary))"
            />
            <Bar
              dataKey="expansion_mrr"
              name={t('platformMetrics.bridge.expansion')}
              stackId="a"
              fill="hsl(var(--chart-2))"
            />
            <Bar
              dataKey="churned_mrr"
              name={t('platformMetrics.bridge.churned')}
              stackId="a"
              fill="hsl(var(--destructive))"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </DataPanel>
  );
}
