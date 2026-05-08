'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Users, Filter, Plus, RefreshCw, Download } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { Pagination } from '@/components/shared/Pagination';
import { UserFilters } from '@/components/users/UserFilters';
import { User, UserStatus } from '@/types/api';
import { useAuthUser } from '@/hooks/useAuthUser';
import { ChangeUserRoleDialog } from './change-user-role-dialog';
import { useTranslation } from '@/lib/i18n/hooks';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';

type UserCategory = 'all' | 'students' | 'teachers' | 'managers';

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

const CATEGORY_KEY_CONFIG: Record<
  UserCategory,
  {
    titleKey: string;
    descriptionKey: string;
    defaultRole: 'all' | 'ADMIN' | 'MANAGER' | 'TEACHER' | 'STUDENT' | 'USER';
    roleLocked: boolean;
    fetcher: (params: {
      page: number;
      limit: number;
      search?: string;
      status?: string;
      academy_id?: number | null;
    }) => Promise<any>;
  }
> = {
  all: {
    titleKey: 'users.allUsers',
    descriptionKey: 'users.manageAllUsersDescription',
    defaultRole: 'all',
    roleLocked: false,
    fetcher: (params) =>
      apiClient.getUsers({
        page: params.page,
        limit: params.limit,
        search: params.search,
        status: params.status as any,
        academy_id: params.academy_id ?? undefined
      })
  },
  students: {
    titleKey: 'users.students',
    descriptionKey: 'users.studentsDescription',
    defaultRole: 'STUDENT',
    roleLocked: true,
    fetcher: (params) =>
      apiClient.getStudentUsers({
        page: params.page,
        limit: params.limit,
        search: params.search,
        status: params.status as any,
        academy_id: params.academy_id ?? undefined
      })
  },
  teachers: {
    titleKey: 'users.teachers',
    descriptionKey: 'users.teachersDescription',
    defaultRole: 'TEACHER',
    roleLocked: true,
    fetcher: (params) =>
      apiClient.getTeacherUsers({
        page: params.page,
        limit: params.limit,
        search: params.search,
        status: params.status as any,
        academy_id: params.academy_id ?? undefined
      })
  },
  managers: {
    titleKey: 'users.managers',
    descriptionKey: 'users.managersDescription',
    defaultRole: 'MANAGER',
    roleLocked: true,
    fetcher: (params) =>
      apiClient.getManagerUsers({
        page: params.page,
        limit: params.limit,
        search: params.search,
        status: params.status as any,
        academy_id: params.academy_id ?? undefined
      })
  }
};

interface UsersPageContentProps {
  category: UserCategory;
}

export function UsersPageContent({ category }: UsersPageContentProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryConfig = CATEGORY_KEY_CONFIG[category];
  const { user: authUser } = useAuthUser();
  const [roleChangeDialog, setRoleChangeDialog] = useState<{
    open: boolean;
    user: User | null;
  }>({ open: false, user: null });

  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUserDetails, setSelectedUserDetails] = useState<any>(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<
    'all' | 'ADMIN' | 'MANAGER' | 'TEACHER' | 'STUDENT' | 'USER'
  >(categoryConfig.defaultRole);
  const [selectedStatus, setSelectedStatus] = useState<
    'all' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BANNED'
  >('all');
  const [selectedStore, setSelectedStore] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;
  const queryKey = JSON.stringify({
    category,
    currentPage,
    pageSize,
    searchTerm,
    selectedRole,
    selectedStatus,
    selectedStore,
    roleLocked: categoryConfig.roleLocked,
    defaultRole: categoryConfig.defaultRole
  });
  const previousQueryKeyRef = useRef<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const params: {
        page: number;
        limit: number;
        search?: string;
        status?: string;
        academy_id?: number | null;
      } = {
        page: currentPage,
        limit: pageSize,
        academy_id: selectedStore
      };

      if (searchTerm) params.search = searchTerm;
      if (selectedStatus !== 'all') params.status = selectedStatus;

      let data;

      if (!categoryConfig.roleLocked && selectedRole !== 'all') {
        data = await apiClient.getUsers({
          page: params.page,
          limit: params.limit,
          search: params.search,
          status: params.status as any,
          academy_id: params.academy_id ?? undefined,
          role: selectedRole
        });
      } else {
        data = await categoryConfig.fetcher(params);
      }

      if (data && typeof data === 'object') {
        if ('users' in data || 'profiles' in data) {
          const list = (data as any).users || (data as any).profiles || [];
          setUsers(
            list.map((item: any) => ({
              ...item,
              name: item.full_name || item.display_name || item.name,
              display_name: item.full_name || item.display_name || item.name
            }))
          );
          setPagination((data as any).pagination || null);
        } else if (Array.isArray(data)) {
          setUsers(data as any);
          setPagination(null);
        } else {
          setUsers([]);
          setPagination(null);
        }
      } else {
        setUsers([]);
        setPagination(null);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error(t('error.failedToLoad'));
      setUsers([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, [
    categoryConfig,
    currentPage,
    pageSize,
    searchTerm,
    selectedRole,
    selectedStatus,
    selectedStore
  ]);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    if (previousQueryKeyRef.current === queryKey) {
      return;
    }

    previousQueryKeyRef.current = queryKey;
    fetchUsers();
  }, [fetchUsers, isInitialized, queryKey]);

  useEffect(() => {
    const roleParam = searchParams.get('role');
    const statusParam = searchParams.get('status');
    const storeParam = searchParams.get('academy_id');

    if (
      roleParam &&
      ['ADMIN', 'MANAGER', 'TEACHER', 'STUDENT', 'USER'].includes(roleParam) &&
      !categoryConfig.roleLocked
    ) {
      setSelectedRole((prev) =>
        prev === roleParam ? prev : (roleParam as any)
      );
    }

    if (
      statusParam &&
      ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'BANNED'].includes(statusParam)
    ) {
      setSelectedStatus((prev) =>
        prev === statusParam ? prev : (statusParam as any)
      );
    }

    if (storeParam) {
      const parsedStore = parseInt(storeParam);
      setSelectedStore((prev) => (prev === parsedStore ? prev : parsedStore));
    } else {
      setSelectedStore((prev) => (prev === null ? prev : null));
    }

    setIsInitialized(true);
  }, [categoryConfig.roleLocked, searchParams]);

  useEffect(() => {
    if (categoryConfig.roleLocked) {
      setSelectedRole((prev) =>
        prev === categoryConfig.defaultRole ? prev : categoryConfig.defaultRole
      );
    }
  }, [categoryConfig.defaultRole, categoryConfig.roleLocked]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleRoleFilter = (role: string) => {
    if (categoryConfig.roleLocked) return;
    setSelectedRole(role as any);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status as any);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRefresh = () => {
    fetchUsers();
    toast.success(t('success.refreshed'));
  };

  const handleViewUser = async (user: User) => {
    setSelectedUser(user);
    setIsDetailsLoading(true);
    try {
      const details = await apiClient.getUserDetails(user.id);
      setSelectedUserDetails(details?.data || details);
    } catch (error) {
      toast.error('Failed to load user details');
      setSelectedUserDetails(null);
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    router.push(`/user/${user.id}/edit`);
  };

  const handleRoleChange = (user: User) => {
    setRoleChangeDialog({ open: true, user });
  };

  const canChangeRole = authUser?.role === 'MANAGER' && category === 'students';

  const canManageUser =
    authUser?.role === 'ADMIN' || authUser?.role === 'MANAGER';

  const handleResetPassword = async () => {
    if (!selectedUser || !canManageUser) return;
    const newPassword = window.prompt('Enter new password (min 6 chars)');
    if (!newPassword) return;
    try {
      await apiClient.resetUserPassword(selectedUser.id, newPassword);
      toast.success('Password reset successfully');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to reset password');
    }
  };

  const handleGrantCourse = async () => {
    if (!selectedUser || !canManageUser) return;
    const courseId = window.prompt('Enter course ID to grant');
    if (!courseId) return;
    try {
      await apiClient.grantCourseAccess(selectedUser.id, {
        course_id: Number(courseId)
      });
      toast.success('Course access granted');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to grant course access');
    }
  };

  const handleAssignVoucher = async () => {
    if (!selectedUser || !canManageUser) return;
    const prefix = window.prompt('Voucher code prefix', 'SUPPORT');
    const value = window.prompt('Voucher value');
    if (!prefix || !value) return;
    try {
      const result = await apiClient.assignVoucher(selectedUser.id, {
        code_prefix: prefix,
        discount_type: 'PERCENT',
        discount_value: Number(value)
      });
      toast.success(
        `Voucher created: ${result?.data?.code || result?.code || 'success'}`
      );
    } catch (error: any) {
      toast.error(error?.message || 'Failed to assign voucher');
    }
  };

  const handleExport = () => {
    // Export users data as CSV
    if (users.length === 0) {
      toast.error(t('error.noDataToExport'));
      return;
    }

    const csvHeaders = [
      t('users.id'),
      t('common.name'),
      t('common.email'),
      t('common.phone'),
      t('common.status'),
      t('users.createdAt')
    ];
    const csvRows = users.map((user) => [
      user.id,
      user.name,
      user.email || '',
      user.phone_number,
      user.status || (user.is_active ? 'ACTIVE' : 'INACTIVE'),
      new Date(user.created_at).toLocaleDateString()
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map((row) => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `users-${category}-${new Date().toISOString().split('T')[0]}.csv`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(t('success.exported'));
  };

  if (isLoading) {
    return <LoadingSpinner message={t('users.loadingUsersData')} />;
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <PageHeader
        title={t(categoryConfig.titleKey)}
        description={t(categoryConfig.descriptionKey)}
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {t('common.refresh')}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            {t('payments.exportCsv')}
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            {t('users.addUser')}
          </Button>
        </div>
      </PageHeader>

      <UserFilters
        searchTerm={searchTerm}
        onSearchChange={handleSearch}
        selectedRole={selectedRole}
        onRoleChange={handleRoleFilter}
        selectedStatus={selectedStatus}
        onStatusChange={handleStatusFilter}
        roleDisabled={categoryConfig.roleLocked}
      />

      <div className="rounded-md border">
        {users.length === 0 ? (
          <div className="py-10">
            <EmptyState
              icon={<Users className="h-12 w-12" />}
              title={t('users.noUsersFound')}
              description={
                searchTerm ||
                selectedStatus !== 'all' ||
                (!categoryConfig.roleLocked && selectedRole !== 'all')
                  ? t('common.tryAdjustingFilters')
                  : t('users.getStartedByAddingUser')
              }
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>UUID</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell className="max-w-[180px] truncate">
                    {(user as any).uuid || (user as any).user_uuid || '-'}
                  </TableCell>
                  <TableCell>{user.name || user.display_name}</TableCell>
                  <TableCell>
                    {(
                      (user as any).role_name ||
                      user.profiles?.[0]?.role?.name ||
                      user.profiles?.[0]?.Role?.name ||
                      '-'
                    ).toString()}
                  </TableCell>
                  <TableCell>{user.email || '-'}</TableCell>
                  <TableCell>{user.phone_number || '-'}</TableCell>
                  <TableCell>
                    {user.is_active ? 'ACTIVE' : 'INACTIVE'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewUser(user)}
                      >
                        Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                      >
                        Edit
                      </Button>
                      {canChangeRole && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRoleChange(user)}
                        >
                          Role
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
          hasNextPage={pagination.hasNextPage}
          hasPreviousPage={pagination.hasPreviousPage}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
        />
      )}

      <ChangeUserRoleDialog
        open={roleChangeDialog.open}
        onOpenChange={(open) => setRoleChangeDialog({ open, user: null })}
        user={roleChangeDialog.user}
        currentRole={authUser?.role || null}
        onSuccess={() => {
          fetchUsers();
        }}
      />

      <Sheet
        open={!!selectedUser}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedUser(null);
            setSelectedUserDetails(null);
          }
        }}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>
              {selectedUser?.name || selectedUser?.display_name}
            </SheetTitle>
            <SheetDescription>
              User detail, purchase history, academy roles, and support actions
            </SheetDescription>
          </SheetHeader>

          {isDetailsLoading ? (
            <div className="py-8 text-sm text-muted-foreground">
              Loading details...
            </div>
          ) : selectedUserDetails ? (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>ID: {selectedUserDetails.profile?.id}</div>
                <div>UUID: {selectedUserDetails.profile?.uuid || '-'}</div>
                <div>
                  Name:{' '}
                  {selectedUserDetails.profile?.full_name ||
                    selectedUserDetails.profile?.display_name}
                </div>
                <div>Role: {selectedUserDetails.profile?.role_name}</div>
              </div>

              {canManageUser && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleResetPassword}
                  >
                    Reset Password
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleGrantCourse}
                  >
                    Grant Course
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAssignVoucher}
                  >
                    Assign Voucher
                  </Button>
                </div>
              )}

              <div>
                <h3 className="mb-2 font-medium">Roles in Academies</h3>
                <div className="space-y-2 text-sm">
                  {(selectedUserDetails.roles_across_academies || []).map(
                    (item: any) => (
                      <div key={item.profile_id} className="rounded border p-2">
                        {item.academy_name || 'Platform'} - {item.role}
                      </div>
                    )
                  )}
                </div>
              </div>

              <div>
                <h3 className="mb-2 font-medium">Purchase History</h3>
                <div className="space-y-2 text-sm">
                  {(selectedUserDetails.purchase_history || [])
                    .slice(0, 20)
                    .map((item: any) => (
                      <div key={item.id} className="rounded border p-2">
                        #{item.id} - {item.Course?.title || 'N/A'} -{' '}
                        {item.status} - {item.amount}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-sm text-muted-foreground">
              No detail data available.
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
