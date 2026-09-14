'use client';

import { useMemo, useState } from 'react';
import { DataList, DataPanel, type DataColumn } from '@/components/shared/data-list';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/hooks';
import { usePercentLabel } from '@/lib/i18n/use-percent-label';
import { useCurrentAcademy } from '@/hooks/useCurrentAcademy';
import { formatCurrencyWithStore, formatNumber } from '@/lib/utils';
import type { CourseMoneyRow } from '@/types/dashboard';

type SortKey = 'gross' | 'net' | 'students';

const SORT_KEYS: readonly SortKey[] = ['gross', 'net', 'students'];

const SORT_LABEL: Record<SortKey, string> = {
  gross: 'dashboard.money.sortGross',
  net: 'dashboard.money.sortNet',
  students: 'dashboard.money.sortStudents',
};

type Props = { rows: CourseMoneyRow[]; isLoading?: boolean };

/**
 * Revenue and profit rank differently once a teacher takes a share, so the
 * sort is a control rather than a fixed order.
 */
export default function CourseMoneyTable({ rows, isLoading }: Props) {
  const { t, language } = useTranslation();
  const academy = useCurrentAcademy();
  const percent = usePercentLabel();
  const [sortKey, setSortKey] = useState<SortKey>('gross');

  const money = (value: number) => formatCurrencyWithStore(value, academy, undefined, language);

  const sorted = useMemo(
    () => [...rows].sort((a, b) => b[sortKey] - a[sortKey]).slice(0, 10),
    [rows, sortKey],
  );

  const columns: DataColumn<CourseMoneyRow>[] = [
    {
      id: 'title',
      header: t('dashboard.money.colCourse'),
      cell: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.title}</p>
          {row.teacher_name ? (
            <p className="truncate text-xs text-muted-foreground">{row.teacher_name}</p>
          ) : null}
        </div>
      ),
    },
    {
      id: 'students',
      header: t('dashboard.money.colStudents'),
      cell: (row) => formatNumber(row.students, language),
    },
    {
      id: 'sales',
      header: t('dashboard.money.colSales'),
      cell: (row) => formatNumber(row.sales, language),
    },
    {
      id: 'gross',
      header: t('dashboard.money.colGross'),
      cell: (row) => money(row.gross),
    },
    {
      id: 'payout',
      header: t('dashboard.money.colPayout'),
      cell: (row) => money(row.teacher_payout),
    },
    {
      id: 'net',
      header: t('dashboard.money.colNet'),
      cell: (row) => <span className="font-semibold">{money(row.net)}</span>,
    },
    {
      id: 'progress',
      header: t('dashboard.money.colProgress'),
      align: 'end',
      cell: (row) => <Badge variant="secondary">{percent(row.avg_progress)}</Badge>,
    },
  ];

  return (
    <DataPanel
      title={t('dashboard.money.coursesTitle')}
      subtitle={t('dashboard.money.coursesSubtitle')}
      actions={
        <div className="flex items-center gap-1">
          {SORT_KEYS.map((key) => (
            <Button
              key={key}
              size="sm"
              variant={sortKey === key ? 'secondary' : 'ghost'}
              onClick={() => setSortKey(key)}
            >
              {t(SORT_LABEL[key])}
            </Button>
          ))}
        </div>
      }
    >
      <DataList
        items={sorted}
        columns={columns}
        rowKey={(row) => row.course_id}
        isLoading={isLoading}
        emptyState={
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">
            {t('dashboard.money.noCourses')}
          </p>
        }
      />
    </DataPanel>
  );
}
