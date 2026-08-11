'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
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
import {
  EnrollmentsList,
  enrollmentProgress
} from '@/components/students/enrollments-list';
import type { UserStat } from './users-stats-bar';
import { useTranslation } from '@/lib/i18n/hooks';
import { usePercentLabel } from '@/lib/i18n/use-percent-label';
import {
  useDebouncedValue,
  useEnrollments,
  type EnrollmentStatusFilter
} from './use-enrollments';

const PAGE_SIZE = 20;

/** Where a learner sits against their course: below half, past half, or done. */
type StageFilter = 'all' | 'on-track' | 'lagging' | 'completed';

const STATUS_KEYS: Record<'all' | 'ACTIVE' | 'COMPLETED', string> = {
  all: 'students.allStatuses',
  ACTIVE: 'common.active',
  COMPLETED: 'students.completed'
};

const STAGE_KEYS: Record<StageFilter, string> = {
  all: 'students.allProgressLevels',
  'on-track': 'students.onTrack',
  lagging: 'students.lagging',
  completed: 'students.completed'
};

interface UsersProgressViewProps {
  /** Feeds the page-level stats row so it stays in place across tabs. */
  onStats: (stats: UserStat[]) => void;
}

export function UsersProgressView({ onStats }: UsersProgressViewProps) {
  const { t } = useTranslation();
  const percentLabel = usePercentLabel();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState<'all' | 'ACTIVE' | 'COMPLETED'>('all');
  const [stage, setStage] = useState<StageFilter>('all');
  const search = useDebouncedValue(searchInput);

  const { enrollments, pagination, isLoading } = useEnrollments({
    page,
    limit: PAGE_SIZE,
    status: status as EnrollmentStatusFilter,
    search
  });

  useEffect(() => {
    setPage(1);
  }, [search, status, stage]);

  const visible = useMemo(() => {
    const withProgress = enrollments.map((enrollment) => ({
      enrollment,
      percent: enrollmentProgress(enrollment)
    }));
    const matches = withProgress.filter(({ enrollment, percent }) => {
      const done = percent >= 100 || enrollment.status === 'COMPLETED';
      if (stage === 'completed') return done;
      if (stage === 'lagging') return !done && percent < 50;
      if (stage === 'on-track') return !done && percent >= 50;
      return true;
    });
    return matches
      .sort((a, b) => b.percent - a.percent)
      .map(({ enrollment }) => enrollment);
  }, [enrollments, stage]);

  // Averages cannot be asked of the API, so they describe the loaded page.
  useEffect(() => {
    const percents = visible.map(enrollmentProgress);
    const average =
      percents.length > 0
        ? Math.round(percents.reduce((sum, p) => sum + p, 0) / percents.length)
        : 0;
    const completed = visible.filter(
      (enrollment) =>
        enrollmentProgress(enrollment) >= 100 ||
        enrollment.status === 'COMPLETED'
    ).length;
    const lagging = visible.filter(
      (enrollment) => enrollmentProgress(enrollment) < 50
    ).length;
    onStats([
      {
        labelKey: 'students.averageProgressAcross',
        value: average,
        display: percentLabel(average)
      },
      { labelKey: 'students.completedStudents', value: completed },
      { labelKey: 'students.atRiskStudents', value: lagging },
      {
        labelKey: 'students.totalRecords',
        value: pagination?.total ?? visible.length
      }
    ]);
  }, [visible, pagination, percentLabel, onStats]);

  return (
    <DataPanel
      title={t('students.progressTracking')}
      subtitle={t('students.monitorProgressDescription')}
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
              setStatus(value as 'all' | 'ACTIVE' | 'COMPLETED')
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
          <Select
            value={stage}
            onValueChange={(value) => setStage(value as StageFilter)}
          >
            <SelectTrigger className="h-9 w-[170px] rounded-lg bg-card text-sm">
              <SelectValue placeholder={t('students.filterByProgress')} />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(STAGE_KEYS).map(([value, labelKey]) => (
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
      <EnrollmentsList
        enrollments={visible}
        isLoading={isLoading}
        t={t}
        variant="progress"
      />
    </DataPanel>
  );
}
