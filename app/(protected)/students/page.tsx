'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from '@/lib/i18n/hooks';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  GraduationCap,
  TrendingUp,
  Plus,
  Search,
  Filter,
  CheckCircle
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { User, Enrollment } from '@/types/api';
import { ErrorHandler } from '@/lib/error-handler';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Pagination } from '@/components/shared/Pagination';

type StudentStatus = 'all' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BANNED';

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export default function StudentsPage() {
  const { t } = useTranslation();

  const STUDENT_STATUS_OPTIONS: Array<{ label: string; value: StudentStatus }> =
    [
      { label: t('students.allStatuses'), value: 'all' },
      { label: t('common.active'), value: 'ACTIVE' },
      { label: t('common.inactive'), value: 'INACTIVE' },
      { label: t('students.suspended'), value: 'SUSPENDED' },
      { label: t('students.banned'), value: 'BANNED' }
    ];

  const ENROLLMENT_STATUS_FILTERS = [
    { label: t('common.all'), value: 'all' },
    { label: t('common.active'), value: 'ACTIVE' },
    { label: t('students.completed'), value: 'COMPLETED' },
    { label: t('students.cancelled'), value: 'CANCELLED' },
    { label: t('students.expired'), value: 'EXPIRED' }
  ];
  const [students, setStudents] = useState<User[]>([]);
  const [studentPagination, setStudentPagination] =
    useState<PaginationInfo | null>(null);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [studentPage, setStudentPage] = useState(1);
  const [studentStatusFilter, setStudentStatusFilter] =
    useState<StudentStatus>('all');
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(true);
  const [enrollmentStatusFilter, setEnrollmentStatusFilter] = useState<
    'all' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED'
  >('all');

  const studentPageSize = 10;

  const fetchStudents = useCallback(async () => {
    try {
      setStudentsLoading(true);
      const response = await apiClient.getStudentUsers({
        page: studentPage,
        limit: studentPageSize,
        search: searchTerm || undefined,
        status: studentStatusFilter !== 'all' ? studentStatusFilter : undefined
      });

      const payload = response as any;
      const users = Array.isArray(payload)
        ? payload
        : ((payload?.users as User[]) ?? []);
      setStudents(users);

      if (payload?.pagination) {
        setStudentPagination(payload.pagination as PaginationInfo);
      } else {
        setStudentPagination(null);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
      setStudentPagination(null);
      ErrorHandler.handleApiError(error);
    } finally {
      setStudentsLoading(false);
    }
  }, [studentPage, studentPageSize, searchTerm, studentStatusFilter]);

  const fetchEnrollments = useCallback(async () => {
    try {
      setEnrollmentsLoading(true);
      const response = await apiClient.getEnrollments({
        page: 1,
        limit: 25
      });

      const payload = response as any;
      const list = Array.isArray(payload)
        ? payload
        : ((payload?.enrollments as Enrollment[]) ?? []);
      setEnrollments(list);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      setEnrollments([]);
      ErrorHandler.handleApiError(error);
    } finally {
      setEnrollmentsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(searchInput.trim());
      setStudentPage(1);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchInput]);

  const getEnrollmentStatusColor = (status: string) => {
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

  const getProgressPercentage = (enrollment: Enrollment) => {
    if (typeof enrollment.progress_percent === 'number') {
      return Math.round(enrollment.progress_percent);
    }

    if (!enrollment.progress || enrollment.progress.length === 0) return 0;
    const completedLessons = enrollment.progress.filter(
      (p) => p.status === 'COMPLETED'
    ).length;
    const totalLessons = enrollment.progress.length;
    return totalLessons > 0
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0;
  };

  const filteredEnrollments = useMemo(() => {
    if (enrollmentStatusFilter === 'all') {
      return enrollments;
    }
    return enrollments.filter(
      (enrollment) => enrollment.status === enrollmentStatusFilter
    );
  }, [enrollments, enrollmentStatusFilter]);

  const totalStudents = studentPagination?.total ?? students.length;
  const activeEnrollmentsCount = enrollments.filter(
    (e) => e.status === 'ACTIVE'
  ).length;
  const completedEnrollmentsCount = enrollments.filter(
    (e) => e.status === 'COMPLETED'
  ).length;
  const averageProgress =
    enrollments.length > 0
      ? Math.round(
          enrollments.reduce(
            (acc, enrollment) => acc + getProgressPercentage(enrollment),
            0
          ) / enrollments.length
        )
      : 0;

  if (studentsLoading && students.length === 0) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900" />
            <p className="mt-2 text-sm text-gray-600">
              {t('students.loadingStudentsData')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('students.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('students.manageDescription')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t('students.addStudent')}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('students.searchStudents')}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-8"
            autoComplete="off"
          />
        </div>
        <Select
          value={studentStatusFilter}
          onValueChange={(value) =>
            setStudentStatusFilter(value as StudentStatus)
          }
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t('common.filter')} />
          </SelectTrigger>
          <SelectContent>
            {STUDENT_STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" className="hidden md:inline-flex">
          <Filter className="mr-2 h-4 w-4" />
          {t('common.moreFilters')}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('students.totalStudents')}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              {t('students.registeredStudents')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('students.activeEnrollments')}
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeEnrollmentsCount}</div>
            <p className="text-xs text-muted-foreground">
              {t('students.currentlyEnrolled')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('students.completedCourses')}
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedEnrollmentsCount}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('students.successfullyCompleted')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('students.avgProgress')}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageProgress}%</div>
            <p className="text-xs text-muted-foreground">
              {t('students.acrossAllCourses')}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="students" className="space-y-4">
        <TabsList>
          <TabsTrigger value="students">
            {t('students.title')} ({totalStudents})
          </TabsTrigger>
          <TabsTrigger value="enrollments">
            {t('students.enrollments')} ({filteredEnrollments.length})
          </TabsTrigger>
          <TabsTrigger value="progress">
            {t('students.progressTracking')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('students.allStudents')}</CardTitle>
              <CardDescription>
                {t('students.manageRosterDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {students.length === 0 ? (
                <div className="py-8 text-center">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-medium">
                    {t('students.noStudents')}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t('students.willAppearWhenRegistered')}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="" />
                          <AvatarFallback>
                            {student.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium leading-none">
                            {student.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {student.email ?? 'No email'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {student.phone_number && (
                          <Badge variant="outline">
                            {student.phone_number}
                          </Badge>
                        )}
                        <Badge
                          variant={student.is_active ? 'default' : 'secondary'}
                        >
                          {student.is_active
                            ? t('common.active')
                            : t('common.inactive')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {studentPagination && studentPagination.totalPages > 1 && (
                <div className="pt-4">
                  <Pagination
                    currentPage={studentPagination.page}
                    totalPages={studentPagination.totalPages}
                    hasNextPage={studentPagination.hasNextPage}
                    hasPreviousPage={studentPagination.hasPreviousPage}
                    onPageChange={setStudentPage}
                    itemsPerPage={studentPagination.limit}
                    totalItems={studentPagination.total}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="enrollments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('students.courseEnrollments')}</CardTitle>
              <CardDescription>
                {t('students.trackEnrollmentsDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {t('students.showingRecentEnrollments')}
                </p>
                <Select
                  value={enrollmentStatusFilter}
                  onValueChange={(value) =>
                    setEnrollmentStatusFilter(
                      value as
                        | 'all'
                        | 'ACTIVE'
                        | 'COMPLETED'
                        | 'CANCELLED'
                        | 'EXPIRED'
                    )
                  }
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    {ENROLLMENT_STATUS_FILTERS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {enrollmentsLoading && enrollments.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Loading enrollments...
                  </p>
                </div>
              ) : filteredEnrollments.length === 0 ? (
                <div className="py-8 text-center">
                  <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-medium">
                    No enrollments found
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Adjust the filters to see different enrollment records.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredEnrollments.map((enrollment) => (
                    <div
                      key={enrollment.id}
                      className="flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
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
                            {t('students.enrolledOn')}{' '}
                            {new Date(
                              enrollment.enrolled_at
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-start gap-2 md:items-end">
                        <Badge
                          className={getEnrollmentStatusColor(
                            enrollment.status
                          )}
                        >
                          {enrollment.status === 'ACTIVE'
                            ? t('common.active')
                            : enrollment.status === 'COMPLETED'
                              ? t('students.completed')
                              : enrollment.status === 'CANCELLED'
                                ? t('students.cancelled')
                                : enrollment.status === 'EXPIRED'
                                  ? t('students.expired')
                                  : enrollment.status}
                        </Badge>
                        {typeof enrollment.progress_percent === 'number' && (
                          <span className="text-xs text-muted-foreground">
                            {t('students.progress')}:{' '}
                            {Math.round(enrollment.progress_percent)}%
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('students.progressTracking')}</CardTitle>
              <CardDescription>
                {t('students.monitorProgressDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {enrollmentsLoading && enrollments.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t('students.loadingProgressData')}
                  </p>
                </div>
              ) : filteredEnrollments.length === 0 ? (
                <div className="py-8 text-center">
                  <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-medium">
                    {t('students.noProgressData')}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t('students.progressWillBeTracked')}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredEnrollments.map((enrollment) => {
                    const percentage = getProgressPercentage(enrollment);
                    return (
                      <div key={enrollment.id} className="space-y-2">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {enrollment.user?.name
                                  ?.split(' ')
                                  .map((n) => n[0])
                                  .join('') || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">
                                {enrollment.user?.name ||
                                  t('students.unknownStudent')}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {enrollment.course?.title ||
                                  t('students.unknownCourse')}
                              </p>
                            </div>
                          </div>
                          <span className="text-sm font-medium">
                            {percentage}%
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
