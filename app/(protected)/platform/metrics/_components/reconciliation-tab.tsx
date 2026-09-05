'use client';

import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { DataPanel } from '@/components/shared/data-list';
import {
  apiClient,
  type MetricsCurrency,
  type MetricsQuery,
  type ReconciliationLeg
} from '@/lib/api';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { useMetricsFetch } from '../_hooks/use-metrics-fetch';
import { useMetricFormat } from './metric-format';

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
                  ? 'text-2xl font-bold text-destructive'
                  : 'text-2xl font-bold'
              }
            >
              {formatNumber(value)}
            </p>
          </div>
        ))}
      </div>
      {leg.missing_ids.length > 0 ? (
        <p className="mt-3 break-all text-xs text-muted-foreground">
          {t('platformMetrics.reconciliation.missing')}:{' '}
          {leg.missing_ids.join(', ')}
        </p>
      ) : null}
      {leg.orphan_ids.length > 0 ? (
        <p className="mt-1 break-all text-xs text-muted-foreground">
          {t('platformMetrics.reconciliation.orphan')}:{' '}
          {leg.orphan_ids.join(', ')}
        </p>
      ) : null}
    </div>
  );
}

export function ReconciliationTab({ query, currency }: Props) {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const format = useMetricFormat(currency);
  const { data: report, loading } = useMetricsFetch(query, (q) =>
    apiClient.getMetricsReconciliation(q)
  );

  if (loading || !report) {
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
        <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <p>
            {t('platformMetrics.metrics.invoiced_amount')}:{' '}
            <span className="text-base font-semibold">
              {format('invoiced_amount', report.invoiced_amount)}
            </span>
          </p>
          <p>
            {t('platformMetrics.metrics.invoice_count')}:{' '}
            <span className="text-base font-semibold">
              {formatNumber(report.invoice_count)}
            </span>
          </p>
          <p>
            {t('platformMetrics.metrics.manual_invoice_count')}:{' '}
            <span className="text-base font-semibold">
              {formatNumber(report.manual_invoice_count)}
            </span>
          </p>
          <p>
            {t('platformMetrics.metrics.manual_invoice_amount')}:{' '}
            <span className="text-base font-semibold">
              {format('manual_invoice_amount', report.manual_invoice_amount)}
            </span>
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Leg
            title={t('platformMetrics.reconciliation.invoiceToPayment')}
            leg={report.invoice_to_payment}
          />
          <Leg
            title={t('platformMetrics.reconciliation.paymentToGateway')}
            leg={report.payment_to_gateway}
          />
        </div>
      </div>
    </DataPanel>
  );
}
