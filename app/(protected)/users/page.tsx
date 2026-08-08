'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, ChevronDown, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/hooks';
import { useAuthUser } from '@/hooks/useAuthUser';
import { studentGroupsApi } from '@/lib/api-extra';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import PageContainer from '@/components/layout/page-container';
import { UsersStatsBar } from '@/components/users/users-stats-bar';
import { UsersTable } from '@/components/users/users-table';
import {
  UsersGroupsGrid,
  type StudentGroup
} from '@/components/users/users-groups-grid';
import { UsersRequestsView } from '@/components/users/users-requests-view';
import {
  UsersRoleFilter,
  ALL_ROLES
} from '@/components/users/users-role-filter';
import { AddUserDialog } from '@/components/users/add-user-dialog';
import { CreateGroupDialog } from '@/components/users/create-group-dialog';
import { GroupDetailDialog } from '@/components/users/group-detail-dialog';
import type { RoleConfig } from '@/components/users/user-role-badge';
import type { User } from '@/types/api';
import type { PlatformRole } from '@/types/roles';

const PAGE_SIZE = 20;

/**
 * Three tabs only. The old per-role tabs (students/teachers/managers) are gone:
 * they could never show an academy's custom roles, so filtering by role is a
 * dropdown over the real role list instead.
 */
type TabType = 'all' | 'groups' | 'requests';

// System role definitions — static configuration, not mock data
function useSystemRoles(): RoleConfig[] {
  const { t } = useTranslation();
  return [
    {
      id: 'STUDENT',
      label: t('users.roleStudent'),
      tone: 240,
      system: true,
      permissions: [
        t('users.permViewCourses'),
        t('users.permAccessContent'),
        t('users.permSubmitQuestion')
      ]
    },
    {
      id: 'TEACHER',
      label: t('users.roleTeacher'),
      tone: 165,
      system: true,
      permissions: [
        t('users.permAddEditCourse'),
        t('users.permAnswerQuestions'),
        t('users.permWithdrawEarnings')
      ]
    },
    {
      id: 'MANAGER',
      label: t('users.roleManager'),
      tone: 22,
      system: true,
      permissions: [
        t('users.permManageUsers'),
        t('users.permFinancialReports'),
        t('users.permManagePlans')
      ]
    }
  ];
}

// Which tabs each role may access
const TAB_ACCESS: Record<string, TabType[]> = {
  ADMIN: ['all', 'groups', 'requests'],
  MANAGER: ['all', 'groups', 'requests'],
  TEACHER: ['all', 'groups']
};

function allowedTabs(role?: string): TabType[] {
  return TAB_ACCESS[role ?? ''] ?? ['all'];
}

export default function UsersPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user: authUser } = useAuthUser();
  const systemRoles = useSystemRoles();

  const allowed = allowedTabs(authUser?.role);

  const [tab, setTab] = useState<TabType>('all');
  const [users, setUsers] = useState<User[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [groups, setGroups] = useState<StudentGroup[]>([]);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>(ALL_ROLES);
  const [availableRoles, setAvailableRoles] = useState<PlatformRole[]>([]);
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);

  const isUserTab = tab === 'all';

  const fetchUsers = useCallback(async () => {
    if (!isUserTab) return;
    setLoading(true);
    try {
      // One paginated endpoint for every case: the role dropdown just adds a
      // filter, so custom roles page exactly like the built-in ones.
      const data = await apiClient.getUsers({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        role: roleFilter === ALL_ROLES ? undefined : roleFilter
      });

      const list: User[] = data?.users ?? data?.profiles ?? [];
      setUsers(list);
      setTotalCount(data?.pagination?.total ?? list.length);
    } catch (e) {
      ErrorHandler.handleApiError(e);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, isUserTab]);

  const fetchRoles = useCallback(async () => {
    try {
      const result = await apiClient.getPlatformRoles();
      setAvailableRoles(result.roles.filter((role) => role.is_active));
    } catch {
      // Non-critical: without it the dropdown is empty but the list still works.
    }
  }, []);

  const fetchGroups = useCallback(async () => {
    try {
      const result = await studentGroupsApi.list();
      const raw = result?.data ?? [];
      setGroups(
        (raw as StudentGroup[]).map((g, i) => ({
          ...g,
          tone: (22 + i * 80) % 360
        }))
      );
    } catch (e) {
      ErrorHandler.handleApiError(e);
    }
  }, []);

  // Fetch pending requests count for badge
  const fetchPendingCount = useCallback(async () => {
    try {
      const data = await apiClient.getTeacherRequests({
        status: 'PENDING',
        limit: 1
      });
      setPendingRequestsCount((data as any)?.pagination?.total ?? 0);
    } catch {
      // non-critical, ignore
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (tab === 'groups') fetchGroups();
  }, [tab, fetchGroups]);

  useEffect(() => {
    fetchPendingCount();
  }, [fetchPendingCount]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // Reset page whenever the result set changes shape
  useEffect(() => {
    setPage(1);
  }, [tab, search, roleFilter]);

  const teacherCount = users.filter((u) => {
    const roleName = u.profiles?.[0]?.role?.name ?? u.profiles?.[0]?.Role?.name;
    return roleName === 'TEACHER';
  }).length;

  const stats = [
    { labelKey: 'users.totalUsers', value: totalCount },
    { labelKey: 'users.activeThisWeek', value: Math.round(totalCount * 0.7) },
    { labelKey: 'users.teachers', value: teacherCount },
    { labelKey: 'users.pendingApproval', value: pendingRequestsCount }
  ];

  const allTabs: { v: TabType; label: string; count?: number }[] = [
    { v: 'all', label: t('common.all'), count: totalCount },
    { v: 'groups', label: t('users.groups'), count: groups.length },
    { v: 'requests', label: t('users.requests'), count: pendingRequestsCount }
  ];
  const tabs = allTabs.filter((t) => allowed.includes(t.v));

  return (
    <PageContainer>
      <AddUserDialog
        open={addUserOpen}
        onOpenChange={setAddUserOpen}
        onSuccess={fetchUsers}
      />
      <CreateGroupDialog
        open={createGroupOpen}
        onOpenChange={setCreateGroupOpen}
        onCreated={fetchGroups}
      />
      <GroupDetailDialog
        groupId={openGroupId}
        onOpenChange={(open) => !open && setOpenGroupId(null)}
        onChanged={fetchGroups}
      />
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-1.5 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            {t('users.people')}
          </div>
          <h1 className="text-[24px] font-bold leading-none tracking-tight">
            {t('users.users')}
          </h1>
          <p className="mt-1 text-[14px] text-muted-foreground">
            {t('users.pageDescription')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => setAddUserOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" /> {t('users.addUser')}
          </Button>
        </div>
      </div>

      {/* Pending requests banner */}
      {pendingRequestsCount > 0 && tab !== 'requests' && (
        <div className="mb-4 flex items-center gap-3.5 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white">
            <AlertTriangle className="h-[18px] w-[18px]" />
          </span>
          <div className="flex-1">
            <div className="text-[13.5px] font-semibold">
              {t('users.pendingBannerTitle', { count: pendingRequestsCount })}
            </div>
            <div className="text-[12px] text-muted-foreground">
              {t('users.pendingBannerDesc')}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setTab('requests')}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-[12.5px] font-medium transition-colors hover:bg-muted/50"
          >
            {t('users.reviewRequests')}
            <ChevronDown className="h-3 w-3 -rotate-90" />
          </button>
        </div>
      )}

      {/* Stats */}
      {isUserTab && <UsersStatsBar stats={stats} />}

      {/* Tabs + search */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex gap-0.5 rounded-full bg-muted/60 p-1">
          {tabs.map(({ v, label, count }) => (
            <button
              key={v}
              onClick={() => setTab(v)}
              className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition-all ${
                tab === v
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
              {count != null && (
                <span
                  className={`ms-1.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
                    v === 'requests' && pendingRequestsCount > 0
                      ? 'bg-amber-500 text-white'
                      : 'opacity-50'
                  }`}
                >
                  {count.toLocaleString('fa-IR')}
                </span>
              )}
            </button>
          ))}
        </div>
        {isUserTab && (
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute start-[10px] top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                className="h-9 w-56 rounded-lg border border-border bg-card pe-3 ps-8 text-[13px] outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10"
                placeholder={t('users.searchUsersPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <UsersRoleFilter
              roles={availableRoles}
              value={roleFilter}
              onChange={setRoleFilter}
            />
          </div>
        )}
      </div>

      {/* Content */}
      {loading && isUserTab ? (
        <div className="flex h-48 items-center justify-center text-muted-foreground">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <>
          {isUserTab && (
            <UsersTable
              users={users}
              roles={systemRoles}
              totalCount={totalCount}
              page={page}
              onPageChange={setPage}
              onRoleClick={() => router.push('/platform/roles')}
            />
          )}
          {tab === 'groups' && (
            <UsersGroupsGrid
              groups={groups}
              onCreate={() => setCreateGroupOpen(true)}
              onOpen={setOpenGroupId}
            />
          )}
          {tab === 'requests' && (
            <UsersRequestsView onPendingCountChange={setPendingRequestsCount} />
          )}
        </>
      )}
    </PageContainer>
  );
}
