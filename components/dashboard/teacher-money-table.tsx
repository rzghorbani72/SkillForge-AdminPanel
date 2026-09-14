'use client';

import { useState } from 'react';
import { DataList, DataPanel, type DataColumn } from '@/components/shared/data-list';
import { useTranslation } from '@/lib/i18n/hooks';
import { useCurrentAcademy } from '@/hooks/useCurrentAcademy';
import { formatCurrencyWithStore, formatNumber } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { TeacherMoneyRow } from '@/types/dashboard';
import { RecordTeacherPayoutDialog } from './teacher-payout/record-teacher-payout-dialog';

type Props = {
  rows: TeacherMoneyRow[];
  isLoading?: boolean;
  onPayoutRecorded: () => void;
};

export default function TeacherMoneyTable({ rows, isLoading, onPayoutRecorded }: Props) {
  const { t, language } = useTranslation();
  const academy = useCurrentAcademy();
  const [paying, setPaying] = useState<TeacherMoneyRow | null>(null);

  const money = (value: number) => formatCurrencyWithStore(value, academy, undefined, language);

  const columns: DataColumn<TeacherMoneyRow>[] = [
    {
      id: 'name',
      header: t('dashboard.money.colTeacher'),
      cell: (row) => (
        <span className="font-medium">{row.name ?? t('dashboard.money.unnamed')}</span>
      ),
    },
    {
      id: 'courses',
      header: t('dashboard.money.colCourses'),
      cell: (row) => formatNumber(row.courses, language),
    },
    {
      id: 'students',
      header: t('dashboard.money.colStudents'),
      cell: (row) => formatNumber(row.students, language),
    },
    {
      id: 'gross',
      header: t('dashboard.money.colGross'),
      cell: (row) => money(row.gross),
    },
    {
      id: 'earnings',
      header: t('dashboard.money.colEarnings'),
      cell: (row) => <span className="font-semibold">{money(row.earnings)}</span>,
    },
    {
      id: 'pending',
      header: t('dashboard.money.colPending'),
      align: 'end',
      cell: (row) =>
        row.pending_payout > 0 ? (
          <span className="inline-flex items-center gap-2">
            <span className="text-amber-600 dark:text-amber-400">{money(row.pending_payout)}</span>
            <Button size="sm" variant="outline" onClick={() => setPaying(row)}>
              {t('dashboard.money.payTeacher')}
            </Button>
          </span>
        ) : (
          <span className="text-muted-foreground">{money(0)}</span>
        ),
    },
  ];

  return (
    <>
      <RecordTeacherPayoutDialog
        teacher={paying}
        onOpenChange={(open) => {
          if (!open) setPaying(null);
        }}
        onRecorded={onPayoutRecorded}
      />
      <DataPanel
        title={t('dashboard.money.teachersTitle')}
        subtitle={t('dashboard.money.teachersSubtitle')}
      >
        <DataList
          items={rows.slice(0, 10)}
          columns={columns}
          rowKey={(row) => row.profile_id}
          isLoading={isLoading}
          emptyState={
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">
              {t('dashboard.money.noTeachers')}
            </p>
          }
        />
      </DataPanel>
    </>
  );
}
