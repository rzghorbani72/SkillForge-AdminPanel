'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Lock, Search, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { DataPanel } from '@/components/shared/data-list';
import { Pagination } from '@/components/shared/Pagination';
import { EnrollmentsList } from '@/components/students/enrollments-list';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import type { UserStat } from './users-stats-bar';
import {
  useDebouncedValue,
  useEnrollments,
  useEnrollmentTotals,
  type EnrollmentStatusFilter
} from './use-enrollments';

const PAGE_SIZE = 20;

const STATUS_KEYS: Record<EnrollmentStatusFilter, string> = {
  all: 'common.all',
  ACTIVE: 'common.active',
  COMPLETED: 'students.completed',
  CANCELLED: 'students.cancelled',
  EXPIRED: 'students.expired'
};

interface UsersEnrollmentsViewProps {
  /** Feeds the page-level stats row so it stays in place across tabs. */
  onStats: (stats: UserStat[]) => void;
}

export function UsersEnrollmentsView({ onStats }: UsersEnrollmentsViewProps) {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState<EnrollmentStatusFilter>('all');
  const search = useDebouncedValue(searchInput);
  const totals = useEnrollmentTotals();

  const { enrollments, pagination, isLoading } = useEnrollments({
    page,
    limit: PAGE_SIZE,
    status,
    search
  });

  useEffect(() => {
    setPage(1);
  }, [search, status]);

  useEffect(() => {
    onStats([
      { labelKey: 'students.enrollments', value: totals.all },
      { labelKey: 'common.active', value: totals.ACTIVE },
      { labelKey: 'students.completed', value: totals.COMPLETED },
      { labelKey: 'students.cancelled', value: totals.CANCELLED }
    ]);
  }, [totals, onStats]);

  return (
    <DataPanel
      title={t('students.studentEnrollments')}
      subtitle={
        pagination
          ? `${formatNumber(pagination.total)} ${t('students.enrollments')}`
          : t('students.enrollmentsDescription')
      }
      actions={
        <>
          <Button asChild size="sm" variant="outline" className="rounded-lg">
            <Link href="/users/manual-enroll">
              <UserPlus className="me-1.5 h-4 w-4" />
              {t('students.manualEnroll.title')}
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-lg">
            <Link href="/users/lesson-access">
              <Lock className="me-1.5 h-4 w-4" />
              {t('students.lessonAccess.title')}
            </Link>
          </Button>
        </>
      }
      filters={
        <>
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute start-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder={t('students.searchByStudentEmailCourse')}
              className="h-9 rounded-lg bg-card ps-8"
              autoComplete="off"
            />
          </div>
          <Select
            value={status}
            onValueChange={(value) =>
              setStatus(value as EnrollmentStatusFilter)
            }
          >
            <SelectTrigger className="h-9 w-[170px] rounded-lg bg-card text-sm">
              <SelectValue placeholder={t('students.filterByStatus')} />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(STATUS_KEYS).map(([value, labelKey]) => (
                <SelectItem key={value} value={value}>
                  {t(labelKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      }
      footer={
        pagination && pagination.totalPages > 1 ? (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
            hasNextPage={pagination.hasNextPage}
            hasPreviousPage={pagination.hasPreviousPage}
            totalItems={pagination.total}
            itemsPerPage={pagination.limit}
          />
        ) : null
      }
    >
      <EnrollmentsList enrollments={enrollments} isLoading={isLoading} t={t} />
    </DataPanel>
  );
}
