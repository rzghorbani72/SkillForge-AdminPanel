'use client';

import { StatsCard } from '@/components/shared/stats-card';
import { DataPanel, DataList, type DataColumn } from '@/components/shared/data-list';
import { apiClient, type MetricsQuery, type MetricsCurrency } from '@/lib/api';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { useMetricsFetch } from '../_hooks/use-metrics-fetch';
import { useMetricFormat } from './metric-format';
import { MonthlyBars } from './monthly-bars';
import { ScalarMetrics } from './scalar-metrics';
import { METRIC_VALUE_CLASS } from './period-label';
import { Users, UserCheck, Activity, Flame } from 'lucide-react';

interface Props {
  query: MetricsQuery;
  currency: MetricsCurrency;
}

export function UsersTab({ query, currency }: Props) {
  const { t } = useTranslation();
  const format = useMetricFormat(currency);
  const formatNumber = useNumberFormat();
  const { data: users, loading: usersLoading } = useMetricsFetch(query, (q) =>
    apiClient.getMetricsUsers(q),
  );
  const { data: activity, loading: activityLoading } = useMetricsFetch(query, (q) =>
    apiClient.getMetricsActivity(q),
  );

  const roleColumns: DataColumn<{ role: string; profiles: number }>[] = [
    {
      id: 'role',
      header: t('platformMetrics.columns.role'),
      cell: (row) => row.role,
    },
    {
      id: 'profiles',
      header: t('platformMetrics.columns.profiles'),
      align: 'end',
      className: METRIC_VALUE_CLASS,
      cell: (row) => formatNumber(row.profiles),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t('platformMetrics.metrics.total_users')}
          value={format('total_users', users?.total_users ?? null)}
          icon={Users}
          description={`${t('platformMetrics.metrics.total_profiles')}: ${format('total_profiles', users?.total_profiles ?? null)}`}
        />
        <StatsCard
          title={t('platformMetrics.metrics.activation_rate')}
          value={format('activation_rate', users?.activation_rate ?? null)}
          icon={UserCheck}
        />
        <StatsCard
          title={t('platformMetrics.metrics.mau')}
          value={format('mau', activity?.mau ?? null)}
          icon={Activity}
          description={`DAU ${format('dau', activity?.dau ?? null)} · WAU ${format('wau', activity?.wau ?? null)}`}
        />
        <StatsCard
          title={t('platformMetrics.metrics.stickiness')}
          value={format('stickiness', activity?.stickiness ?? null)}
          icon={Flame}
        />
      </div>

      <ScalarMetrics
        title={t('platformMetrics.sections.registrations')}
        metrics={users}
        currency={currency}
        loading={usersLoading}
      />

      <DataPanel title={t('platformMetrics.sections.byRole')}>
        <DataList
          items={users?.by_role ?? []}
          columns={roleColumns}
          rowKey={(row) => row.role}
          isLoading={usersLoading}
          emptyState={t('platformMetrics.empty')}
        />
      </DataPanel>

      <DataPanel title={t('platformMetrics.sections.monthly')}>
        <MonthlyBars
          data={users?.monthly ?? []}
          dataKey="value"
          name={t('platformMetrics.columns.count')}
        />
      </DataPanel>

      <ScalarMetrics
        title={t('platformMetrics.sections.activity')}
        metrics={activity}
        currency={currency}
        loading={activityLoading}
        footer={
          activity?.login_history_since ? (
            <p className="text-xs text-muted-foreground">
              {t('platformMetrics.caveats.loginHistory')}
            </p>
          ) : undefined
        }
      />

      <DataPanel title={t('platformMetrics.sections.dailyActive')}>
        <MonthlyBars
          data={activity?.daily_active ?? []}
          xKey="day"
          dataKey="users"
          name={t('platformMetrics.metrics.dau')}
        />
      </DataPanel>
    </div>
  );
}
