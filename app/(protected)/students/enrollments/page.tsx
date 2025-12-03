'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Pagination } from '@/components/shared/Pagination';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Enrollment } from '@/types/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

type EnrollmentStatusFilter =
  | 'all'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED';

export default function StudentEnrollmentsPage() {
  const { t, language } = useTranslation();

  const STATUS_OPTIONS: Array<{
    label: string;
    value: EnrollmentStatusFilter;
  }> = [
    { label: t('students.allStatuses'), value: 'all' },
    { label: t('common.active'), value: 'ACTIVE' },
    { label: t('students.completed'), value: 'COMPLETED' },
    { label: t('students.cancelled'), value: 'CANCELLED' },
    { label: t('students.expired'), value: 'EXPIRED' }
  ];
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<EnrollmentStatusFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 10;

  const fetchEnrollments = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getEnrollments({
        page: currentPage,
        limit: pageSize,
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
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
      console.error('Error fetching enrollments:', error);
      setEnrollments([]);
      setPagination(null);
      ErrorHandler.handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, searchTerm, statusFilter]);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(searchInput.trim());
      setCurrentPage(1);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchInput]);

  const filteredCountLabel = useMemo(() => {
    const count = pagination ? pagination.total : enrollments.length;
    return `${count} ${t('students.resultsCount')}`;
  }, [enrollments.length, pagination, t]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressValue = (enrollment: Enrollment) =>
    typeof enrollment.progress_percent === 'number'
      ? Math.round(enrollment.progress_percent)
      : 0;

  return (
    <div
      className="flex-1 space-y-6 p-6"
      dir={language === 'fa' || language === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('students.studentEnrollments')}
          </h1>
          <p className="text-muted-foreground">
            {t('students.enrollmentsDescription')}
          </p>
        </div>
        <p className="text-sm text-muted-foreground">{filteredCountLabel}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('students.enrollments')}</CardTitle>
          <CardDescription>{t('students.useSearchAndFilters')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute start-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('students.searchByStudentOrCourse')}
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                className="ps-8"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as EnrollmentStatusFilter)
              }
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder={t('students.allStatuses')} />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('students.student')}</TableHead>
                  <TableHead>{t('students.course')}</TableHead>
                  <TableHead>{t('common.status')}</TableHead>
                  <TableHead className="w-[160px]">
                    {t('students.progress')}
                  </TableHead>
                  <TableHead className="text-end">
                    {t('students.enrolledAt')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-gray-900" />
                        <span className="text-sm text-muted-foreground">
                          {t('students.loadingEnrollments')}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : enrollments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center">
                      <span className="text-sm text-muted-foreground">
                        {t('students.noEnrollmentsMatch')}
                      </span>
                    </TableCell>
                  </TableRow>
                ) : (
                  enrollments.map((enrollment) => {
                    const progressValue = getProgressValue(enrollment);
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
                      <TableRow key={enrollment.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback>
                                {enrollment.user?.name
                                  ?.split(' ')
                                  .map((n) => n[0])
                                  .join('') || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="space-y-0.5">
                              <p className="text-sm font-medium">
                                {enrollment.user?.name ||
                                  t('students.unknownStudent')}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {enrollment.user?.email ||
                                  t('students.noEmail')}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-0.5">
                            <p className="text-sm font-medium">
                              {enrollment.course?.title ||
                                t('students.unknownCourse')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {enrollment.course?.school?.name || '—'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={getStatusBadgeClass(enrollment.status)}
                          >
                            {getStatusLabel(enrollment.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Progress value={progressValue} className="h-2" />
                            <p className="text-end text-xs text-muted-foreground">
                              {progressValue}%
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-end text-sm text-muted-foreground">
                          {new Date(enrollment.enrolled_at).toLocaleDateString(
                            language === 'fa' ? 'fa-IR' : undefined
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="pt-4">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                hasNextPage={pagination.hasNextPage}
                hasPreviousPage={pagination.hasPreviousPage}
                onPageChange={setCurrentPage}
                itemsPerPage={pagination.limit}
                totalItems={pagination.total}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
