'use client';

import { StatsCard } from '@/components/shared/stats-card';
import {
  DataPanel,
  DataList,
  type DataColumn
} from '@/components/shared/data-list';
import { apiClient, type MetricsQuery, type MetricsCurrency } from '@/lib/api';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { useMetricsFetch } from '../_hooks/use-metrics-fetch';
import { useMetricFormat } from './metric-format';
import { MonthlyBars } from './monthly-bars';
import { ScalarMetrics } from './scalar-metrics';
import { METRIC_VALUE_CLASS } from './period-label';
import { BookOpen, GraduationCap, Radio, Video } from 'lucide-react';

interface Props {
  query: MetricsQuery;
  currency: MetricsCurrency;
}

export function CatalogTab({ query, currency }: Props) {
  const { t } = useTranslation();
  const format = useMetricFormat(currency);
  const formatNumber = useNumberFormat();
  const { data: catalog, loading: catalogLoading } = useMetricsFetch(
    query,
    (q) => apiClient.getMetricsCatalog(q)
  );
  const { data: record, loading: recordLoading } = useMetricsFetch(query, (q) =>
    apiClient.getMetricsLearningRecord(q)
  );

  const typeColumns: DataColumn<{ type: string; count: number }>[] = [
    {
      id: 'type',
      header: t('platformMetrics.columns.type'),
      cell: (row) => row.type
    },
    {
      id: 'count',
      header: t('platformMetrics.columns.count'),
      align: 'end',
      className: METRIC_VALUE_CLASS,
      cell: (row) => formatNumber(row.count)
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t('platformMetrics.metrics.total_courses')}
          value={format('total_courses', catalog?.total_courses ?? null)}
          icon={BookOpen}
          description={`${t('platformMetrics.metrics.published_courses')}: ${format('published_courses', catalog?.published_courses ?? null)}`}
        />
        <StatsCard
          title={t('platformMetrics.metrics.total_lessons')}
          value={format('total_lessons', catalog?.total_lessons ?? null)}
          icon={Video}
        />
        <StatsCard
          title={t('platformMetrics.metrics.live_sessions')}
          value={format('live_sessions', catalog?.live_sessions ?? null)}
          icon={Radio}
        />
        <StatsCard
          title={t('platformMetrics.metrics.learning_records')}
          value={format('learning_records', record?.total_records ?? null)}
          icon={GraduationCap}
        />
      </div>

      <ScalarMetrics
        title={t('platformMetrics.tabs.catalog')}
        metrics={catalog}
        currency={currency}
        loading={catalogLoading}
      />

      <DataPanel title={t('platformMetrics.sections.byCourseType')}>
        <DataList
          items={(catalog?.by_course_type ?? []).map((row) => ({
            type: row.course_type,
            count: row.courses
          }))}
          columns={typeColumns}
          rowKey={(row) => row.type}
          isLoading={catalogLoading}
          emptyState={t('platformMetrics.empty')}
        />
      </DataPanel>

      <DataPanel title={t('platformMetrics.sections.byPricingType')}>
        <DataList
          items={(catalog?.by_pricing_type ?? []).map((row) => ({
            type: row.pricing_type,
            count: row.courses
          }))}
          columns={typeColumns}
          rowKey={(row) => row.type}
          isLoading={catalogLoading}
          emptyState={t('platformMetrics.empty')}
        />
      </DataPanel>

      <DataPanel title={t('platformMetrics.sections.byLessonType')}>
        <DataList
          items={(catalog?.by_lesson_type ?? []).map((row) => ({
            type: row.lesson_type,
            count: row.lessons
          }))}
          columns={typeColumns}
          rowKey={(row) => row.type}
          isLoading={catalogLoading}
          emptyState={t('platformMetrics.empty')}
        />
      </DataPanel>

      <DataPanel title={t('platformMetrics.sections.monthly')}>
        <MonthlyBars
          data={catalog?.monthly_courses_created ?? []}
          dataKey="value"
          name={t('platformMetrics.metrics.total_courses')}
        />
      </DataPanel>

      <ScalarMetrics
        title={t('platformMetrics.sections.learningRecord')}
        metrics={record}
        currency={currency}
        loading={recordLoading}
      />

      <DataPanel title={t('platformMetrics.sections.learningRecord')}>
        <MonthlyBars
          data={record?.monthly_records ?? []}
          dataKey="value"
          name={t('platformMetrics.metrics.learning_records')}
        />
      </DataPanel>
    </div>
  );
}
