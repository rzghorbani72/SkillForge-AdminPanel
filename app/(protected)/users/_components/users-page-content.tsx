'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Users, Plus, RefreshCw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Pagination } from '@/components/shared/Pagination';
import { DataList, DataPanel } from '@/components/shared/data-list';
import { UserFilters } from '@/components/users/UserFilters';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import type { User } from '@/types/api';
import { ChangeUserRoleDialog } from './change-user-role-dialog';
import { UserDetailsSheet } from './user-details-sheet';
import { UserCard } from '@/components/users/user-card';
import { buildUserColumns } from './user-columns';
import {
  CATEGORY_CONFIG,
  exportUsersCsv,
  type UserCategory,
  type UsersQuery
} from './users-query';

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

const PAGE_SIZE = 20;

interface UsersPageContentProps {
  category: UserCategory;
}

export function UsersPageContent({ category }: UsersPageContentProps) {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryConfig = CATEGORY_CONFIG[category];
  const { user: authUser } = useAuthUser();

  const [users, setUsers] = useState<User[]>([]);
  const [roleChangeUser, setRoleChangeUser] = useState<User | null>(null);
  const [detailsUser, setDetailsUser] = useState<User | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<UsersQuery['role']>(
    categoryConfig.defaultRole
  );
  const [selectedStatus, setSelectedStatus] =
    useState<UsersQuery['status']>('all');
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const queryKey = JSON.stringify({
    category,
    currentPage,
    searchTerm,
    selectedRole,
    selectedStatus,
    selectedStore
  });
  const previousQueryKeyRef = useRef<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await categoryConfig.fetch({
        page: currentPage,
        limit: PAGE_SIZE,
        search: searchTerm || undefined,
        status: selectedStatus,
        role: selectedRole,
        academy_id: selectedStore
      });
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error) {
      toast.error(t('error.failedToLoad'));
      setUsers([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, [
    categoryConfig,
    currentPage,
    searchTerm,
    selectedRole,
    selectedStatus,
    selectedStore,
    t
  ]);

  useEffect(() => {
    if (!isInitialized || previousQueryKeyRef.current === queryKey) return;
    previousQueryKeyRef.current = queryKey;
    fetchUsers();
  }, [fetchUsers, isInitialized, queryKey]);

  useEffect(() => {
    const roleParam = searchParams.get('role');
    const statusParam = searchParams.get('status');
    const storeParam = searchParams.get('academy_id');

    if (roleParam && !categoryConfig.roleLocked) {
      setSelectedRole(roleParam as UsersQuery['role']);
    }
    if (statusParam) {
      setSelectedStatus(statusParam as UsersQuery['status']);
    }
    setSelectedStore(storeParam || null);
    setIsInitialized(true);
  }, [categoryConfig.roleLocked, searchParams]);

  const canChangeRole = authUser?.role === 'MANAGER' && category === 'students';
  const canManageUser =
    authUser?.role === 'ADMIN' || authUser?.role === 'MANAGER';

  const columns = useMemo(
    () =>
      buildUserColumns({
        t,
        formatNumber,
        canChangeRole,
        onView: setDetailsUser,
        onEdit: (user) => router.push(`/user/${user.id}/edit`),
        onRoleChange: setRoleChangeUser
      }),
    [t, formatNumber, canChangeRole, router]
  );

  const isFiltered =
    searchTerm !== '' || selectedStatus !== 'all' || selectedRole !== 'all';

  const handleExport = () => {
    if (users.length === 0) {
      toast.error(t('error.noDataToExport'));
      return;
    }
    exportUsersCsv(users, category, t);
    toast.success(t('success.exported'));
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <PageHeader
        icon={<Users className="h-5 w-5" />}
        title={t(categoryConfig.titleKey)}
        description={t(categoryConfig.descriptionKey)}
      >
        <Button
          variant="outline"
          size="sm"
          className="rounded-lg"
          onClick={fetchUsers}
        >
          <RefreshCw className="me-1.5 h-4 w-4" />
          {t('common.refresh')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="rounded-lg"
          onClick={handleExport}
        >
          <Download className="me-1.5 h-4 w-4" />
          {t('payments.exportCsv')}
        </Button>
        <Button size="sm" className="rounded-lg">
          <Plus className="me-1.5 h-4 w-4" />
          {t('users.addUser')}
        </Button>
      </PageHeader>

      <DataPanel
        title={t('users.listTitle')}
        subtitle={
          pagination
            ? `${formatNumber(pagination.total)} ${t('users.users')}`
            : undefined
        }
        filters={
          <UserFilters
            searchTerm={searchTerm}
            onSearchChange={(value) => {
              setSearchTerm(value);
              setCurrentPage(1);
            }}
            selectedRole={selectedRole}
            onRoleChange={(role) => {
              if (categoryConfig.roleLocked) return;
              setSelectedRole(role as UsersQuery['role']);
              setCurrentPage(1);
            }}
            selectedStatus={selectedStatus}
            onStatusChange={(status) => {
              setSelectedStatus(status as UsersQuery['status']);
              setCurrentPage(1);
            }}
            roleDisabled={categoryConfig.roleLocked}
          />
        }
        footer={
          pagination && pagination.totalPages > 1 ? (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={setCurrentPage}
              hasNextPage={pagination.hasNextPage}
              hasPreviousPage={pagination.hasPreviousPage}
              totalItems={pagination.total}
              itemsPerPage={pagination.limit}
            />
          ) : null
        }
      >
        <DataList
          items={users}
          columns={columns}
          rowKey={(user) => user.id}
          isLoading={isLoading}
          renderCard={(user) => (
            <UserCard
              user={user}
              actions={
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-lg"
                    onClick={() => setDetailsUser(user)}
                  >
                    {t('common.view')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-lg"
                    onClick={() => router.push(`/user/${user.id}/edit`)}
                  >
                    {t('common.edit')}
                  </Button>
                </>
              }
            />
          )}
          emptyState={
            <div className="py-12">
              <EmptyState
                icon={<Users className="h-10 w-10" />}
                title={t('users.noUsersFound')}
                description={
                  isFiltered
                    ? t('common.tryAdjustingFilters')
                    : t('users.getStartedByAddingUser')
                }
              />
            </div>
          }
        />
      </DataPanel>

      <ChangeUserRoleDialog
        open={!!roleChangeUser}
        onOpenChange={(open) => !open && setRoleChangeUser(null)}
        user={roleChangeUser}
        currentRole={authUser?.role || null}
        onSuccess={fetchUsers}
      />

      <UserDetailsSheet
        user={detailsUser}
        canManage={canManageUser}
        onClose={() => setDetailsUser(null)}
      />
    </div>
  );
}
