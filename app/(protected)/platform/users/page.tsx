'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, UserPlus } from 'lucide-react';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pagination } from '@/components/shared/Pagination';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { CreateAdminUserDialog } from '@/app/(protected)/users/_components/create-admin-user-dialog';
import { PromoteStaffDialog } from '@/components/users/promote-staff-dialog';
import {
  AcademyMembersTable,
  PlatformStaffTable
} from '@/components/users/platform-users-tables';
import {
  UsersRoleFilter,
  ALL_ROLES
} from '@/components/users/users-role-filter';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { useAuthUser } from '@/hooks/useAuthUser';
import {
  canManagePlatformStaff,
  isPlatformOwner,
  isPlatformStaff
} from '@/lib/roles';
import { useDebouncedValue } from '@/lib/use-debounced-value';
import type { PlatformRole } from '@/types/roles';
import type { PlatformStaffRecord, User } from '@/types/api';

type HubTab = 'staff' | 'academy';

const PAGE_SIZE = 20;

const ACADEMY_ROLE_FILTERS = (
  [
    ['MANAGER', 3],
    ['TEACHER', 2],
    ['STUDENT', 1],
    ['AFFILIATE', 0]
  ] as const
).map(
  ([name, level]) =>
    ({
      id: name,
      name,
      label: name,
      description: null,
      is_system: true,
      is_active: true,
      hierarchy_level: level,
      academy_id: null,
      created_at: '',
      user_count: 0,
      permissions: []
    }) satisfies PlatformRole
);

export default function PlatformUsersPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, isLoading: userLoading } = useAuthUser();
  const canManage = canManagePlatformStaff(user);
  const [tab, setTab] = useState<HubTab>('staff');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 350);
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState(ALL_ROLES);
  const [staff, setStaff] = useState<PlatformStaffRecord[]>([]);
  const [academyUsers, setAcademyUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [promoteOpen, setPromoteOpen] = useState(false);

  useEffect(() => {
    if (userLoading) return;
    if (!isPlatformStaff(user)) router.replace('/unauthorized');
  }, [user, userLoading, router]);

  const load = useCallback(async () => {
    if (userLoading || !user) return;
    setLoading(true);
    try {
      if (tab === 'staff') {
        const data = await apiClient.getPlatformStaff({
          page,
          limit: PAGE_SIZE,
          search: debouncedSearch || undefined
        });
        const profiles = data?.profiles ?? [];
        setStaff(profiles);
        setTotal(data?.pagination?.total ?? profiles.length);
      } else {
        const data = await apiClient.getUsers({
          page,
          limit: PAGE_SIZE,
          search: debouncedSearch || undefined,
          role: roleFilter === ALL_ROLES ? undefined : roleFilter,
          filter: 'none'
        });
        const list: User[] = data?.users ?? data?.profiles ?? [];
        setAcademyUsers(list);
        setTotal(data?.pagination?.total ?? list.length);
      }
    } catch (error) {
      ErrorHandler.handleApiError(error);
      setStaff([]);
      setAcademyUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [userLoading, user, tab, page, debouncedSearch, roleFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [tab, debouncedSearch, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const staffRoleLabel = useMemo(
    () =>
      ({
        PLATFORM_OWNER: t('admins.platformStaff.PLATFORM_OWNER'),
        ADMIN: t('admins.platformStaff.ADMIN'),
        FINANCE: t('admins.platformStaff.FINANCE'),
        SUPPORT: t('admins.platformStaff.SUPPORT')
      }) as Record<string, string>,
    [t]
  );

  if (userLoading || !isPlatformStaff(user)) {
    return (
      <PageContainer>
        <LoadingSpinner />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <CreateAdminUserDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={load}
      />
      <PromoteStaffDialog
        open={promoteOpen}
        onOpenChange={setPromoteOpen}
        onSuccess={load}
      />

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-1.5 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            {t('platformUsers.eyebrow')}
          </div>
          <h1 className="text-[24px] font-bold leading-none tracking-tight">
            {t('platformUsers.title')}
          </h1>
          <p className="mt-1 text-[14px] text-muted-foreground">
            {t('platformUsers.description')}
          </p>
        </div>
        {canManage && tab === 'staff' && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={() => setPromoteOpen(true)}
            >
              <UserPlus className="h-3.5 w-3.5" />
              {t('platformUsers.promote')}
            </Button>
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              {t('platformUsers.addStaff')}
            </Button>
          </div>
        )}
      </div>

      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value as HubTab)}
        className="mb-4"
      >
        <TabsList>
          <TabsTrigger value="staff">{t('platformUsers.staffTab')}</TabsTrigger>
          <TabsTrigger value="academy">
            {t('platformUsers.academyTab')}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute start-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="ps-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('users.searchUsersPlaceholder')}
          />
        </div>
        {tab === 'academy' && (
          <UsersRoleFilter
            roles={ACADEMY_ROLE_FILTERS}
            value={roleFilter}
            onChange={setRoleFilter}
          />
        )}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : tab === 'staff' ? (
        <PlatformStaffTable
          rows={staff}
          roleLabel={staffRoleLabel}
          canManage={canManage}
          currentUserId={String(user?.id ?? '')}
          isOwner={isPlatformOwner(user)}
          onChanged={load}
        />
      ) : (
        <AcademyMembersTable
          rows={academyUsers}
          canModerate={canManage}
          onChanged={() => void load()}
        />
      )}

      {total > PAGE_SIZE && (
        <div className="mt-4">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            hasNextPage={page < totalPages}
            hasPreviousPage={page > 1}
            totalItems={total}
            itemsPerPage={PAGE_SIZE}
          />
        </div>
      )}
    </PageContainer>
  );
}
