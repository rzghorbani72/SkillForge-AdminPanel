'use client';

import {
  DataList,
  DataPanel,
  type DataColumn
} from '@/components/shared/data-list';
import { StatusBadge } from '@/components/shared/status-badge';
import { useTranslation } from '@/lib/i18n/hooks';
import { useCurrentAcademy } from '@/hooks/useCurrentAcademy';
import { formatCurrencyWithStore, formatDate } from '@/lib/utils';
import type { TeacherPayoutRecord } from '@/types/teacher-earnings';
import { PayoutResponseActions } from './payout-response-actions';

type Props = {
  rows: TeacherPayoutRecord[];
  isLoading: boolean;
  onChanged: () => void;
};

/** Each row is the teacher's proof of one payment: amount, tracking code, bank text. */
export function TeacherPayoutsTable({ rows, isLoading, onChanged }: Props) {
  const { t, language } = useTranslation();
  const academy = useCurrentAcademy();
  const money = (value: number) =>
    formatCurrencyWithStore(value, academy, undefined, language);

  const columns: DataColumn<TeacherPayoutRecord>[] = [
    {
      id: 'date',
      header: t('teacherEarnings.colDate'),
      cell: (row) => formatDate(row.processed_at ?? row.requested_at, language)
    },
    {
      id: 'amount',
      header: t('teacherEarnings.colAmount'),
      cell: (row) => <span className="font-semibold">{money(row.amount)}</span>
    },
    {
      id: 'tracking',
      header: t('teacherEarnings.colTrackingCode'),
      cell: (row) => (
        <span dir="ltr" className="font-medium">
          {row.tracking_code ?? '—'}
        </span>
      )
    },
    {
      id: 'bank',
      header: t('teacherEarnings.colBankResponse'),
      className: 'max-w-[240px] truncate text-xs text-muted-foreground',
      cell: (row) => row.bank_response ?? '—'
    },
    {
      id: 'status',
      header: t('common.status'),
      align: 'end',
      cell: (row) => <StatusBadge status={row.status.toLowerCase()} />
    },
    {
      id: 'actions',
      header: t('common.actions'),
      align: 'end',
      cell: (row) => (
        <PayoutResponseActions payout={row} onChanged={onChanged} />
      )
    }
  ];

  return (
    <DataPanel
      title={t('teacherEarnings.payoutsTitle')}
      subtitle={t('teacherEarnings.payoutsSubtitle')}
    >
      <p className="px-5 pb-3 text-xs text-muted-foreground">
        {t('teacherEarnings.responseNote')}
      </p>
      <DataList
        items={rows}
        columns={columns}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        emptyState={
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">
            {t('teacherEarnings.noPayouts')}
          </p>
        }
      />
    </DataPanel>
  );
}
