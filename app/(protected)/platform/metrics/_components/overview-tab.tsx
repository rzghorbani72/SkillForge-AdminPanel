'use client';

import {
  TrendingUp,
  Users,
  Building2,
  GraduationCap,
  Repeat,
  Wallet
} from 'lucide-react';
import { StatsCard } from '@/components/shared/stats-card';
import { apiClient, type MetricsQuery } from '@/lib/api';
import { useTranslation } from '@/lib/i18n/hooks';
import { useMetricFormat } from './metric-format';
import { ScalarMetrics } from './scalar-metrics';
import { METRIC_TERM_KEYS, termFullHint } from './tab-guide';
import { useMetricsFetch } from '../_hooks/use-metrics-fetch';
import type { MetricsCurrency } from '@/lib/api';

interface Props {
  query: MetricsQuery;
  currency: MetricsCurrency;
}

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
  const { data, loading } = useMetricsFetch(query, (q) =>
    apiClient.getMetricsOverview(q)
  );
  const metrics = data?.metrics ?? null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {HEADLINE.map(({ key, icon }) => (
          <StatsCard
            key={key}
            title={t(`platformMetrics.metrics.${key}`)}
            value={format(key, metrics?.[key] ?? null)}
            icon={icon}
            description={
              METRIC_TERM_KEYS[key]
                ? termFullHint(t, METRIC_TERM_KEYS[key])
                : undefined
            }
          />
        ))}
      </div>

      <ScalarMetrics
        title={t('platformMetrics.title')}
        metrics={metrics}
        currency={currency}
        loading={loading}
      />
    </div>
  );
}
