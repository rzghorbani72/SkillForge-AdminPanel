'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  GraduationCap,
  Search,
  Filter,
  CheckCircle
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { User, Enrollment } from '@/types/api';
import { ErrorHandler } from '@/lib/error-handler';
import { UserTable } from '@/components/students/UserTable';
import { AddMemberDialog } from '@/components/members/add-member-dialog';
import { DataPanel } from '@/components/shared/data-list';
import { EnrollmentsList } from '@/components/students/enrollments-list';
import { PageHeader } from '@/components/shared/PageHeader';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import type {
  EnrollmentListResponse,
  GroupedUsersResponse
} from '@/types/learning-operations';
import { LearningNavGate } from '@/components/access-control/learning-nav-gate';

type StudentStatus = 'all' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BANNED';

export default function StudentsPage() {
  const { t, language } = useTranslation();
  const formatNumber = useNumberFormat();
  const isRtl = language === 'fa' || language === 'ar';
  const searchParams = useSearchParams();

  // Get role from query parameter and manage active tab
  const roleParam = searchParams.get('role');
  const getTabFromParams = () => {
    if (!roleParam) return 'users';
    switch (roleParam.toUpperCase()) {
      case 'MANAGER':
        return 'managers';
      case 'TEACHER':
        return 'teachers';
      case 'STUDENT':
        return 'students';
      case 'USER':
        return 'users';
      default:
        return 'users';
    }
  };

  const [activeTab, setActiveTab] = useState(getTabFromParams());

  // Update active tab when URL params change
  useEffect(() => {
    setActiveTab(getTabFromParams());
  }, [roleParam]);

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
  // State for all user groups
  const [managers, setManagers] = useState<User[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [totals, setTotals] = useState({
    managers: 0,
    teachers: 0,
    students: 0,
    users: 0,
    total: 0
  });

  const [studentsLoading, setStudentsLoading] = useState(true);
  const [studentStatusFilter, setStudentStatusFilter] =
    useState<StudentStatus>('all');
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(true);
  const [enrollmentStatusFilter, setEnrollmentStatusFilter] = useState<
    'all' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED'
  >('all');

  const fetchStudents = useCallback(async () => {
    try {
      setStudentsLoading(true);

      // Use the new grouped API endpoint
      const response = await apiClient.getUsers({
        group_by_role: true,
        search: searchTerm || undefined,
        is_active:
          studentStatusFilter !== 'all'
            ? studentStatusFilter === 'ACTIVE'
            : undefined
      });

      const payload: GroupedUsersResponse = response;

      // Extract all groups from the grouped response
      if (payload?.data?.grouped) {
        const grouped = payload.data.grouped;

        // Set all groups
        setManagers(grouped.managers || []);
        setTeachers(grouped.teachers || []);
        setStudents(grouped.students || []);
        setUsers(grouped.users || []);

        // Set totals
        if (payload.data.totals) {
          setTotals(payload.data.totals);
        }
      } else {
        setManagers([]);
        setTeachers([]);
        setStudents([]);
        setUsers([]);
        setTotals({
          managers: 0,
          teachers: 0,
          students: 0,
          users: 0,
          total: 0
        });
      }
    } catch (error) {
      setManagers([]);
      setTeachers([]);
      setStudents([]);
      setUsers([]);
      setTotals({ managers: 0, teachers: 0, students: 0, users: 0, total: 0 });
      ErrorHandler.handleApiError(error);
    } finally {
      setStudentsLoading(false);
    }
  }, [searchTerm, studentStatusFilter]);

  const fetchEnrollments = useCallback(async () => {
    try {
      setEnrollmentsLoading(true);
      const response = await apiClient.getEnrollments({
        page: 1,
        limit: 25
      });

      const payload: EnrollmentListResponse = response;
      const list = payload.enrollments ?? [];
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
    }, 400);

    return () => clearTimeout(handler);
  }, [searchInput]);

  const filteredEnrollments = useMemo(() => {
    if (enrollmentStatusFilter === 'all') {
      return enrollments;
    }
    return enrollments.filter(
      (enrollment) => enrollment.status === enrollmentStatusFilter
    );
  }, [enrollments, enrollmentStatusFilter]);

  if (studentsLoading && totals.total === 0) {
    return (
      <LearningNavGate requiredCapability="students">
        <div className="flex-1 space-y-6 p-6">
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
              <p className="mt-2 text-sm text-muted-foreground">
                {t('students.loadingUsersData')}
              </p>
            </div>
          </div>
        </div>
      </LearningNavGate>
    );
  }

  return (
    <LearningNavGate requiredCapability="students">
      <div className="flex-1 space-y-6 p-4 sm:p-6" dir={isRtl ? 'rtl' : 'ltr'}>
        <PageHeader
          icon={<Users className="h-5 w-5" />}
          title={t('students.allUsers')}
          description={t('students.manageAllUsers')}
        >
          <AddMemberDialog onAdded={fetchStudents} />
        </PageHeader>

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute start-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('students.searchUsersByNameEmailPhone')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="rounded-lg ps-8"
              autoComplete="off"
            />
          </div>
          <Select
            value={studentStatusFilter}
            onValueChange={(value) =>
              setStudentStatusFilter(value as StudentStatus)
            }
          >
            <SelectTrigger className="w-[200px] rounded-lg">
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
          <Button
            variant="outline"
            className="hidden rounded-lg md:inline-flex"
          >
            <Filter className="me-2 h-4 w-4" />
            {t('common.moreFilters')}
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {[
            {
              icon: Users,
              label: t('students.totalUsersCard'),
              value: totals.total,
              hint: t('students.allRegisteredUsers')
            },
            {
              icon: Users,
              label: t('students.managers'),
              value: totals.managers,
              hint: t('students.storeAdministrators')
            },
            {
              icon: GraduationCap,
              label: t('students.teachers'),
              value: totals.teachers,
              hint: t('students.courseInstructors')
            },
            {
              icon: CheckCircle,
              label: t('navigation.students'),
              value: totals.students,
              hint: t('students.courseLearners')
            }
          ].map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.label}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(stat.value)}
                </div>
                <p className="text-xs text-muted-foreground">{stat.hint}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
          dir={isRtl ? 'rtl' : 'ltr'}
        >
          <TabsList>
            <TabsTrigger value="managers">
              {t('students.managers')} ({formatNumber(totals.managers)})
            </TabsTrigger>
            <TabsTrigger value="teachers">
              {t('students.teachers')} ({formatNumber(totals.teachers)})
            </TabsTrigger>
            <TabsTrigger value="students">
              {t('navigation.students')} ({formatNumber(totals.students)})
            </TabsTrigger>
            <TabsTrigger value="users">
              {t('students.users')} ({formatNumber(totals.users)})
            </TabsTrigger>
            <TabsTrigger value="enrollments">
              {t('students.enrollments')} (
              {formatNumber(filteredEnrollments.length)})
            </TabsTrigger>
            <TabsTrigger value="progress">
              {t('students.progressTracking')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="managers">
            <DataPanel
              title={t('students.allManagers')}
              subtitle={t('students.storeManagersAndAdmins')}
            >
              <UserTable
                users={managers}
                emptyMessage={t('students.noManagersFound')}
                t={t}
              />
            </DataPanel>
          </TabsContent>

          <TabsContent value="teachers">
            <DataPanel
              title={t('students.allTeachers')}
              subtitle={t('students.courseInstructorsAndEducators')}
            >
              <UserTable
                users={teachers}
                emptyMessage={t('students.noTeachersFound')}
                t={t}
              />
            </DataPanel>
          </TabsContent>

          <TabsContent value="students">
            <DataPanel
              title={t('students.allStudents')}
              subtitle={t('students.manageRosterDescription')}
            >
              <UserTable
                users={students}
                emptyMessage={t('students.willAppearWhenRegistered')}
                t={t}
                showWorkspace
              />
            </DataPanel>
          </TabsContent>

          <TabsContent value="users">
            <DataPanel
              title={t('students.allUsers')}
              subtitle={t('students.generalUsersNoRoles')}
            >
              <UserTable
                users={users}
                emptyMessage={t('students.noGeneralUsersFound')}
                t={t}
              />
            </DataPanel>
          </TabsContent>

          <TabsContent value="enrollments">
            <DataPanel
              title={t('students.studentEnrollments')}
              subtitle={t('students.enrollmentsDescription')}
              filters={
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
                  <SelectTrigger className="h-8 w-[160px] rounded-lg bg-card text-sm">
                    <SelectValue placeholder={t('students.filterByStatus')} />
                  </SelectTrigger>
                  <SelectContent>
                    {ENROLLMENT_STATUS_FILTERS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              }
            >
              <EnrollmentsList
                enrollments={filteredEnrollments}
                isLoading={enrollmentsLoading && enrollments.length === 0}
                t={t}
              />
            </DataPanel>
          </TabsContent>

          <TabsContent value="progress">
            <DataPanel
              title={t('students.progressTracking')}
              subtitle={t('students.monitorProgressDescription')}
            >
              <EnrollmentsList
                enrollments={filteredEnrollments}
                isLoading={enrollmentsLoading && enrollments.length === 0}
                t={t}
                variant="progress"
              />
            </DataPanel>
          </TabsContent>
        </Tabs>
      </div>
    </LearningNavGate>
  );
}
