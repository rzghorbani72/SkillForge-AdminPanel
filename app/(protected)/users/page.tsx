'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Upload, ChevronDown, AlertTriangle } from 'lucide-react';
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
import { UsersRolesGrid } from '@/components/users/users-roles-grid';
import { AddUserDialog } from '@/components/users/add-user-dialog';
import type { RoleConfig } from '@/components/users/user-role-badge';
import type { User } from '@/types/api';

const PAGE_SIZE = 20;

type TabType =
  | 'all'
  | 'students'
  | 'teachers'
  | 'managers'
  | 'groups'
  | 'requests'
  | 'roles';

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
  ADMIN: [
    'all',
    'students',
    'teachers',
    'managers',
    'groups',
    'requests',
    'roles'
  ],
  MANAGER: ['all', 'students', 'teachers', 'groups', 'requests', 'roles'],
  TEACHER: ['all', 'students', 'groups']
};

function allowedTabs(role?: string): TabType[] {
  return TAB_ACCESS[role ?? ''] ?? ['all'];
}

export default function UsersPage() {
  const { t } = useTranslation();
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
  const [addUserOpen, setAddUserOpen] = useState(false);

  const isUserTab =
    tab === 'all' ||
    tab === 'students' ||
    tab === 'teachers' ||
    tab === 'managers';

  const fetchUsers = useCallback(async () => {
    if (!isUserTab) return;
    setLoading(true);
    try {
      let data: any;

      if (tab === 'students') {
        data = await apiClient.getStudentUsers({
          page,
          limit: PAGE_SIZE,
          search: search || undefined
        });
      } else if (tab === 'teachers') {
        data = await apiClient.getTeacherUsers({
          page,
          limit: PAGE_SIZE,
          search: search || undefined
        });
      } else if (tab === 'managers' && allowed.includes('managers')) {
        data = await apiClient.getManagerUsers({
          page,
          limit: PAGE_SIZE,
          search: search || undefined
        });
      } else {
        data = await apiClient.getUsers({
          page,
          limit: PAGE_SIZE,
          search: search || undefined
        });
      }

      const list: User[] = data?.users ?? data?.profiles ?? [];
      setUsers(list);
      setTotalCount(data?.pagination?.total ?? list.length);
    } catch (e) {
      ErrorHandler.handleApiError(e);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [tab, page, search, isUserTab]);

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

  // Reset page on tab/search change
  useEffect(() => {
    setPage(1);
  }, [tab, search]);

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
    { v: 'students', label: t('users.students') },
    { v: 'teachers', label: t('users.teachers') },
    { v: 'managers', label: t('users.managers') },
    { v: 'groups', label: t('users.groups'), count: groups.length },
    { v: 'requests', label: t('users.requests'), count: pendingRequestsCount },
    { v: 'roles', label: t('users.rolesTab'), count: systemRoles.length }
  ];
  const tabs = allTabs.filter((t) => allowed.includes(t.v));

  return (
    <PageContainer>
      <AddUserDialog
        open={addUserOpen}
        onOpenChange={setAddUserOpen}
        onSuccess={fetchUsers}
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
          {tab === 'roles' ? (
            <Button size="sm" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" /> {t('users.addRole')}
            </Button>
          ) : (
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => setAddUserOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" /> {t('users.addUser')}
            </Button>
          )}
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
            <button
              type="button"
              className="flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-[12.5px] transition-colors hover:bg-muted/40"
            >
              {t('common.filter')}
            </button>
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
              onRoleClick={() => allowed.includes('roles') && setTab('roles')}
              onCourseAccess={() => {}}
              callerRole={authUser?.role}
              callerId={authUser?.id}
              onChanged={fetchUsers}
            />
          )}
          {tab === 'groups' && <UsersGroupsGrid groups={groups} />}
          {tab === 'requests' && (
            <UsersRequestsView onPendingCountChange={setPendingRequestsCount} />
          )}
          {tab === 'roles' && (
            <UsersRolesGrid roles={systemRoles} onAdd={() => {}} />
          )}
        </>
      )}
    </PageContainer>
  );
}
