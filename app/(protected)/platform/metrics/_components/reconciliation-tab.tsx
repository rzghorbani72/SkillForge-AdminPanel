'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { DataPanel } from '@/components/shared/data-list';
import {
  apiClient,
  type MetricsCurrency,
  type MetricsQuery,
  type MetricsReconciliation,
  type ReconciliationLeg
} from '@/lib/api';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';

interface Props {
  query: MetricsQuery;
  currency: MetricsCurrency;
}

function Leg({ title, leg }: { title: string; leg: ReconciliationLeg }) {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const entries = [
    ['matched', leg.matched],
    ['missing', leg.missing],
    ['orphan', leg.orphan]
  ] as const;

  return (
    <div className="rounded-lg border p-4">
      <p className="mb-3 text-sm font-medium">{title}</p>
      <div className="grid grid-cols-3 gap-3 text-center">
        {entries.map(([key, value]) => (
          <div key={key}>
            <p className="text-xs text-muted-foreground">
              {t(`platformMetrics.reconciliation.${key}`)}
            </p>
            <p
              className={
                key !== 'matched' && value > 0
                  ? 'text-lg font-semibold text-destructive'
                  : 'text-lg font-semibold'
              }
            >
              {formatNumber(value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * The tie-out. An unexplained gap here is a defect in the money path, not a
 * reporting artefact — which is exactly why it is shown, not hidden.
 */
export function ReconciliationTab({ query }: Props) {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const [report, setReport] = useState<MetricsReconciliation | null>(null);

  useEffect(() => {
    let active = true;
    apiClient.getMetricsReconciliation(query).then((result) => {
      if (active) setReport(result);
    });
    return () => {
      active = false;
    };
  }, [query]);

  if (!report) {
    return (
      <DataPanel title={t('platformMetrics.reconciliation.title')}>
        <p className="p-6 text-sm text-muted-foreground">
          {t('platformMetrics.empty')}
        </p>
      </DataPanel>
    );
  }

  return (
    <DataPanel
      title={t('platformMetrics.reconciliation.title')}
      subtitle={
        <span
          className={
            report.balanced
              ? 'inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400'
              : 'inline-flex items-center gap-1.5 text-destructive'
          }
        >
          {report.balanced ? (
            <CheckCircle2 className="size-4" />
          ) : (
            <AlertTriangle className="size-4" />
          )}
          {report.balanced
            ? t('platformMetrics.reconciliation.balanced')
            : t('platformMetrics.reconciliation.unbalanced')}
        </span>
      }
    >
      <div className="space-y-4 p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Leg title="Invoice → Payment" leg={report.invoice_to_payment} />
          <Leg title="Payment → Gateway" leg={report.payment_to_gateway} />
        </div>
        <p className="text-xs text-muted-foreground">
          {t('platformMetrics.reconciliation.manual')}:{' '}
          {formatNumber(report.manual_invoice_count)}
        </p>
      </div>
    </DataPanel>
  );
}
