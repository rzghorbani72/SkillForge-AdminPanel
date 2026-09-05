'use client';

import { DataPanel } from '@/components/shared/data-list';
import { apiClient, type MetricsCurrency, type MetricsQuery } from '@/lib/api';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { useMetricsFetch } from '../_hooks/use-metrics-fetch';
import { usePeriodLabel } from './period-label';

interface Props {
  query: MetricsQuery;
  currency: MetricsCurrency;
}

type Cell = { cohort: string; month_index: number; retention: number | null };

/** Retention shades: pale at 0, saturated at 100%. */
function shade(retention: number | null): string {
  if (retention === null) return 'transparent';
  const alpha = Math.min(1, Math.max(0.08, retention));
  return `color-mix(in srgb, var(--primary) ${Math.round(alpha * 100)}%, transparent)`;
}

function Heatmap({ cells, title }: { cells: Cell[]; title: string }) {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const periodLabel = usePeriodLabel();
  const cohorts = Array.from(new Set(cells.map((cell) => cell.cohort)));
  const maxIndex = cells.reduce(
    (max, cell) => Math.max(max, cell.month_index),
    0
  );
  const lookup = new Map(
    cells.map((cell) => [`${cell.cohort}:${cell.month_index}`, cell.retention])
  );

  if (cohorts.length === 0) {
    return (
      <DataPanel title={title}>
        <p className="p-6 text-sm text-muted-foreground">
          {t('platformMetrics.empty')}
        </p>
      </DataPanel>
    );
  }

  return (
    <DataPanel title={title}>
      <div className="overflow-x-auto p-4">
        <table className="w-full min-w-[480px] border-separate border-spacing-1 text-sm">
          <thead>
            <tr>
              <th className="p-1 text-start font-medium text-muted-foreground">
                {t('platformMetrics.columns.cohort')}
              </th>
              {Array.from({ length: maxIndex + 1 }, (_, index) => (
                <th
                  key={index}
                  className="p-1 text-center font-medium text-muted-foreground"
                >
                  {formatNumber(index)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cohorts.map((cohort) => (
              <tr key={cohort}>
                <td className="whitespace-nowrap p-1 text-base font-semibold">
                  {periodLabel(cohort)}
                </td>
                {Array.from({ length: maxIndex + 1 }, (_, index) => {
                  const retention = lookup.get(`${cohort}:${index}`) ?? null;
                  return (
                    <td
                      key={index}
                      className="rounded p-1 text-center text-base font-semibold"
                      style={{ background: shade(retention) }}
                    >
                      {retention === null
                        ? ''
                        : `${formatNumber(Math.round(retention * 100))}%`}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DataPanel>
  );
}

export function CohortsTab({ query }: Props) {
  const { t } = useTranslation();
  const { data } = useMetricsFetch(query, (q) =>
    apiClient.getMetricsCohorts(q)
  );

  return (
    <div className="space-y-6">
      <Heatmap
        cells={data?.revenue_cohorts ?? []}
        title={t('platformMetrics.tabs.revenue')}
      />
      <Heatmap
        cells={data?.login_cohorts ?? []}
        title={t('platformMetrics.tabs.users')}
      />
      <p className="text-xs text-muted-foreground">
        {t('platformMetrics.caveats.loginHistory')}
      </p>
    </div>
  );
}
