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
import { UserCard } from '@/components/users/UserCard';
import { UserFilters } from '@/components/users/UserFilters';
import { User, UserStatus } from '@/types/api';
import { useAuthUser } from '@/hooks/useAuthUser';
import { ChangeUserRoleDialog } from './change-user-role-dialog';
import { useTranslation } from '@/lib/i18n/hooks';

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
  const pageSize = 10;
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
        if ('users' in data) {
          setUsers((data as any).users || []);
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

  const handleViewUser = (user: User) => {
    router.push(`/user/${user.id}`);
  };

  const handleEditUser = (user: User) => {
    router.push(`/user/${user.id}/edit`);
  };

  const handleRoleChange = (user: User) => {
    setRoleChangeDialog({ open: true, user });
  };

  const canChangeRole = authUser?.role === 'MANAGER' && category === 'students';

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

      <div className="grid gap-4 md:grid-cols-2">
        {users.length === 0 ? (
          <div className="col-span-full">
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
          users.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onEdit={handleEditUser}
              onView={handleViewUser}
              onRoleChange={handleRoleChange}
              canChangeRole={canChangeRole}
            />
          ))
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
    </div>
  );
}
