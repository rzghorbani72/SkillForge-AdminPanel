'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Pagination } from '@/components/shared/Pagination';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { Enrollment } from '@/types/api';
import { ChartLine, Search, Target } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

type StatusFilter = 'all' | 'ACTIVE' | 'COMPLETED';
type StageFilter = 'all' | 'on-track' | 'lagging' | 'completed';

export default function StudentProgressPage() {
  const { t, language } = useTranslation();

  const STATUS_OPTIONS: Array<{ label: string; value: StatusFilter }> = [
    { label: t('students.allStatuses'), value: 'all' },
    { label: t('common.active'), value: 'ACTIVE' },
    { label: t('students.completed'), value: 'COMPLETED' }
  ];

  const STAGE_OPTIONS: Array<{ label: string; value: StageFilter }> = [
    { label: t('students.allProgressLevels'), value: 'all' },
    { label: t('students.onTrack'), value: 'on-track' },
    { label: t('students.lagging'), value: 'lagging' },
    { label: t('students.completed'), value: 'completed' }
  ];
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [stageFilter, setStageFilter] = useState<StageFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 12;

  const fetchProgress = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getEnrollments({
        page: currentPage,
        limit: pageSize,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined
      });

      const payload = response as any;
      const list = Array.isArray(payload)
        ? payload
        : ((payload?.enrollments as Enrollment[]) ?? []);

      setEnrollments(list);

      if (payload?.pagination) {
        setPagination(payload.pagination as PaginationInfo);
      } else {
        setPagination(null);
      }
    } catch (error) {
      console.error('Error fetching progress data:', error);
      setEnrollments([]);
      setPagination(null);
      ErrorHandler.handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, statusFilter, searchTerm]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(searchInput.trim());
      setCurrentPage(1);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchInput]);

  const resolveProgressValue = (enrollment: Enrollment) =>
    typeof enrollment.progress_percent === 'number'
      ? Math.round(enrollment.progress_percent)
      : 0;

  const filteredEnrollments = useMemo(() => {
    const data = enrollments.map((enrollment) => ({
      ...enrollment,
      progressValue: resolveProgressValue(enrollment)
    }));

    switch (stageFilter) {
      case 'completed':
        return data.filter(
          (item) => item.progressValue >= 100 || item.status === 'COMPLETED'
        );
      case 'lagging':
        return data.filter((item) => item.progressValue < 50);
      case 'on-track':
        return data.filter(
          (item) => item.progressValue >= 50 && item.progressValue < 100
        );
      default:
        return data;
    }
  }, [enrollments, stageFilter]);

  const avgProgress =
    filteredEnrollments.length > 0
      ? Math.round(
          filteredEnrollments.reduce(
            (sum, enrollment) => sum + enrollment.progressValue,
            0
          ) / filteredEnrollments.length
        )
      : 0;

  const laggingCount = filteredEnrollments.filter(
    (enrollment) => enrollment.progressValue < 50
  ).length;

  const completedCount = filteredEnrollments.filter(
    (enrollment) =>
      enrollment.progressValue >= 100 || enrollment.status === 'COMPLETED'
  ).length;

  return (
    <div
      className="flex-1 space-y-6 p-6"
      dir={language === 'fa' || language === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('students.studentProgress')}
          </h1>
          <p className="text-muted-foreground">
            {t('students.studentProgressDescription')}
          </p>
        </div>
        <div className="grid gap-2 text-end">
          <span className="text-sm text-muted-foreground">
            {t('students.averageProgressAcross')}
          </span>
          <span className="text-2xl font-semibold">{avgProgress}%</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('students.completedStudents')}
            </CardTitle>
            <ChartLine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCount}</div>
            <p className="text-xs text-muted-foreground">
              {t('students.learnersReached100')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('students.atRiskStudents')}
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{laggingCount}</div>
            <p className="text-xs text-muted-foreground">
              {t('students.learnersBelow50')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('students.totalRecords')}
            </CardTitle>
            <Badge variant="secondary" className="h-5 px-2">
              {pagination?.total ?? filteredEnrollments.length}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {t('students.showingEnrollmentsOnPage', {
                count: filteredEnrollments.length
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('students.progressBreakdown')}</CardTitle>
          <CardDescription>
            {t('students.progressBreakdownDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-3 md:grid-cols-4">
            <div className="relative md:col-span-2">
              <Search className="absolute start-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('students.searchByStudentEmailCourse')}
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                className="ps-8"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as StatusFilter)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('students.filterByStatus')} />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={stageFilter}
              onValueChange={(value) => setStageFilter(value as StageFilter)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('students.filterByProgress')} />
              </SelectTrigger>
              <SelectContent>
                {STAGE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="flex h-56 flex-col items-center justify-center gap-2">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900" />
                <span className="text-sm text-muted-foreground">
                  {t('students.fetchingProgressData')}
                </span>
              </div>
            ) : filteredEnrollments.length === 0 ? (
              <div className="flex h-56 flex-col items-center justify-center text-center">
                <p className="text-sm font-medium">
                  {t('students.noProgressForFilters')}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t('students.tryAdjustingFilters')}
                </p>
              </div>
            ) : (
              filteredEnrollments
                .sort((a, b) => b.progressValue - a.progressValue)
                .map((enrollment) => {
                  const getStatusLabel = (status: string) => {
                    switch (status) {
                      case 'ACTIVE':
                        return t('common.active');
                      case 'COMPLETED':
                        return t('students.completed');
                      case 'CANCELLED':
                        return t('students.cancelled');
                      case 'EXPIRED':
                        return t('students.expired');
                      default:
                        return status;
                    }
                  };
                  return (
                    <div
                      key={enrollment.id}
                      className="flex flex-col gap-4 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex flex-1 items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {enrollment.user?.name
                              ?.split(' ')
                              .map((n) => n[0])
                              .join('') || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {enrollment.user?.name ||
                              t('students.unknownStudent')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {enrollment.course?.title ||
                              t('students.unknownCourse')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(
                              enrollment.enrolled_at
                            ).toLocaleDateString(
                              language === 'fa' ? 'fa-IR' : undefined
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex w-full flex-col gap-2 md:w-[240px]">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{t('common.status')}</span>
                          <Badge variant="outline">
                            {getStatusLabel(enrollment.status)}
                          </Badge>
                        </div>
                        <Progress
                          value={enrollment.progressValue}
                          className="h-2"
                        />
                        <div className="flex items-center justify-between text-sm font-medium">
                          <span>{t('students.progress')}</span>
                          <span>{enrollment.progressValue}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              hasNextPage={pagination.hasNextPage}
              hasPreviousPage={pagination.hasPreviousPage}
              onPageChange={setCurrentPage}
              itemsPerPage={pagination.limit}
              totalItems={pagination.total}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
