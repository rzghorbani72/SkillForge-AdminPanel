'use client';

import {
  DataList,
  DataPanel,
  type DataColumn
} from '@/components/shared/data-list';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import type {
  HealthTopError,
  HealthTopPaymentFailure
} from '@/lib/api-academy-health';

interface ErrorPanelProps {
  topErrors: HealthTopError[];
  topPaymentFailures: HealthTopPaymentFailure[];
  /** Error window: comes from the API, never hardcoded — retention is configurable. */
  windowDays: number;
  /** Payment failures are read over the whole selected range, not the error window. */
  rangeDays: number;
}

function EmptyMessage({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-4 py-8 text-center text-sm text-muted-foreground">
      {children}
    </p>
  );
}

export function ErrorPanel({
  topErrors,
  topPaymentFailures,
  windowDays,
  rangeDays
}: ErrorPanelProps) {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();

  const errorColumns: DataColumn<HealthTopError>[] = [
    {
      id: 'path',
      header: t('monitoring.errorPath'),
      cell: (row) => (
        <span className="break-all text-xs font-medium">{row.path}</span>
      )
    },
    {
      id: 'status',
      header: t('monitoring.errorStatus'),
      align: 'center',
      cell: (row) =>
        row.status_code === null ? (
          '—'
        ) : (
          <Badge variant={row.status_code >= 500 ? 'destructive' : 'secondary'}>
            {formatNumber(row.status_code)}
          </Badge>
        )
    },
    {
      id: 'count',
      header: t('monitoring.errorCount'),
      align: 'end',
      cell: (row) => formatNumber(row.count)
    }
  ];

  const failureColumns: DataColumn<HealthTopPaymentFailure>[] = [
    {
      id: 'reason',
      header: t('monitoring.failureReason'),
      cell: (row) => <span className="text-xs">{row.reason}</span>
    },
    {
      id: 'count',
      header: t('monitoring.errorCount'),
      align: 'end',
      cell: (row) => formatNumber(row.count)
    }
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <DataPanel
        title={t('monitoring.topErrors')}
        subtitle={t('monitoring.errorsWindowHint', {
          days: formatNumber(windowDays)
        })}
      >
        <DataList
          items={topErrors}
          columns={errorColumns}
          rowKey={(row) => `${row.path}-${row.status_code ?? 'none'}`}
          alwaysCards={false}
          emptyState={<EmptyMessage>{t('monitoring.noErrors')}</EmptyMessage>}
        />
      </DataPanel>

      <DataPanel
        title={t('monitoring.topPaymentFailures')}
        subtitle={t('monitoring.errorsWindow', {
          days: formatNumber(rangeDays)
        })}
      >
        <DataList
          items={topPaymentFailures}
          columns={failureColumns}
          rowKey={(row) => row.reason}
          alwaysCards={false}
          emptyState={
            <EmptyMessage>{t('monitoring.noPaymentFailures')}</EmptyMessage>
          }
        />
      </DataPanel>
    </div>
  );
}
