'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Users,
  GraduationCap,
  Plus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Mail,
  Phone
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { User } from '@/types/api';
import { ErrorHandler } from '@/lib/error-handler';

type UserStatus = 'all' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BANNED';

export default function UsersPage() {
  const { t, language } = useTranslation();
  const searchParams = useSearchParams();

  // Get role from query parameter and manage active tab
  const roleParam = searchParams.get('role');

  const getTabFromParams = () => {
    if (!roleParam) return 'users';

    switch (roleParam.toUpperCase()) {
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

  const STATUS_OPTIONS: Array<{ label: string; value: UserStatus }> = [
    { label: t('students.allStatuses'), value: 'all' },
    { label: t('common.active'), value: 'ACTIVE' },
    { label: t('common.inactive'), value: 'INACTIVE' },
    { label: t('students.suspended'), value: 'SUSPENDED' },
    { label: t('students.banned'), value: 'BANNED' }
  ];

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

  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<UserStatus>('all');
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);

      // Managers see users in their store (role-based filtering)
      const response = await apiClient.getUsers({
        group_by_role: true,
        search: searchTerm || undefined,
        is_active:
          statusFilter !== 'all' ? statusFilter === 'ACTIVE' : undefined
      });

      const payload = response as any;

      // Extract all groups from the grouped response
      if (payload?.data?.grouped) {
        const grouped = payload.data.grouped;

        // Managers only see teachers, students, and users (not managers or admins)
        setTeachers(grouped.teachers || []);
        setStudents(grouped.students || []);
        setUsers(grouped.users || []);

        // Set totals (excluding managers and admins)
        if (payload.data.totals) {
          setTotals({
            managers: 0,
            teachers: payload.data.totals.teachers || 0,
            students: payload.data.totals.students || 0,
            users: payload.data.totals.users || 0,
            total:
              (payload.data.totals.teachers || 0) +
              (payload.data.totals.students || 0) +
              (payload.data.totals.users || 0)
          });
        }
      } else {
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
      console.error('Error fetching users:', error);
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
      ErrorHandler.handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(searchInput.trim());
    }, 400);

    return () => clearTimeout(handler);
  }, [searchInput]);

  // Render user table
  const renderUserTable = (userList: User[]) => {
    if (userList.length === 0) {
      return (
        <div className="py-8 text-center">
          <Users className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-medium">{t('common.noResults')}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('common.tryAdjustingFilters')}
          </p>
        </div>
      );
    }

    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">{t('common.name')}</TableHead>
              <TableHead className="text-center">{t('common.email')}</TableHead>
              <TableHead className="text-center">{t('common.phone')}</TableHead>
              <TableHead className="text-center">
                {t('common.status')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userList.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center justify-center gap-3">
                    <span className="font-medium">{user.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    {user.email ? (
                      <>
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{user.email}</span>
                        {user.email_confirmed ? (
                          <span title="Email verified">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </span>
                        ) : (
                          <span title="Email not verified">
                            <XCircle className="h-4 w-4 text-red-600" />
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm" dir="ltr">
                      {user.phone_number}
                    </span>
                    {user.phone_confirmed ? (
                      <span title="Phone verified">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </span>
                    ) : (
                      <span title="Phone not verified">
                        <XCircle className="h-4 w-4 text-red-600" />
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <Badge variant={user.is_active ? 'default' : 'secondary'}>
                      {user.is_active
                        ? t('common.active')
                        : t('common.inactive')}
                    </Badge>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  if (isLoading && totals.total === 0) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900" />
            <p className="mt-2 text-sm text-gray-600">{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex-1 space-y-6 p-6"
      dir={language === 'fa' || language === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('users.allUsers')}
          </h1>
          <p className="text-muted-foreground">
            {t('users.manageUsersInStore')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Managers can manage users in their store */}
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute start-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('users.searchUsersPlaceholder')}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="ps-8"
            autoComplete="off"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as UserStatus)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t('common.filter')} />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" className="hidden md:inline-flex">
          <Filter className="me-2 h-4 w-4" />
          {t('common.moreFilters')}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('users.totalUsers')}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.total}</div>
            <p className="text-xs text-muted-foreground">Users in your store</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('users.teachers')}
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.teachers}</div>
            <p className="text-xs text-muted-foreground">
              {t('users.courseInstructors')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('users.students')}
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.students}</div>
            <p className="text-xs text-muted-foreground">
              {t('users.courseLearners')}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
        dir={language === 'fa' || language === 'ar' ? 'rtl' : 'ltr'}
      >
        <TabsList>
          <TabsTrigger value="teachers">
            {t('users.teachers')} ({totals.teachers})
          </TabsTrigger>
          <TabsTrigger value="students">
            {t('users.students')} ({totals.students})
          </TabsTrigger>
          <TabsTrigger value="users">
            {t('users.users')} ({totals.users})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="teachers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('users.teachers')}</CardTitle>
              <CardDescription>{t('users.courseInstructors')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderUserTable(teachers)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('users.students')}</CardTitle>
              <CardDescription>{t('users.courseLearners')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderUserTable(students)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('users.allUsers')}</CardTitle>
              <CardDescription>
                {t('users.generalUsersNoRoles')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderUserTable(users)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
