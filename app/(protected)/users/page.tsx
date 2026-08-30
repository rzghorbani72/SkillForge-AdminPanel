'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import { useAuthUser } from '@/hooks/useAuthUser';
import { studentGroupsApi } from '@/lib/api-extra';
import { ErrorHandler } from '@/lib/error-handler';
import PageContainer from '@/components/layout/page-container';
import { LearningNavGate } from '@/components/access-control/learning-nav-gate';
import {
  UsersStatsBar,
  type UserStat
} from '@/components/users/users-stats-bar';
import { UsersTable } from '@/components/users/users-table';
import {
  UsersGroupsGrid,
  type StudentGroup
} from '@/components/users/users-groups-grid';
import { UsersRequestsView } from '@/components/users/users-requests-view';
import { UsersEnrollmentsView } from '@/components/users/users-enrollments-view';
import { UsersPendingBanner } from '@/components/users/users-pending-banner';
import {
  UsersTabBar,
  type UsersTab,
  type UsersTabItem
} from '@/components/users/users-tab-bar';
import {
  UsersRoleFilter,
  ALL_ROLES
} from '@/components/users/users-role-filter';
import { UsersPageHeader } from '@/components/users/users-page-header';
import { CreateGroupDialog } from '@/components/users/create-group-dialog';
import { GroupDetailDialog } from '@/components/users/group-detail-dialog';
import { useUserStats } from './_components/use-user-stats';
import { useSystemRoles } from './_components/use-system-roles';
import { useAvailableRoles, useUsersList } from './_components/use-users-list';

const PAGE_SIZE = 20;

/**
 * One people hub: roles are a dropdown filter (so academy-defined roles work
 * like built-in ones), and everything a manager does with people — groups,
 * course enrollments and teacher requests — lives in a tab next to the list.
 */
const TAB_ACCESS: Record<string, UsersTab[]> = {
  PLATFORM_OWNER: ['all', 'groups', 'enrollments', 'requests'],
  ADMIN: ['all', 'groups', 'enrollments', 'requests'],
  MANAGER: ['all', 'groups', 'enrollments', 'requests'],
  TEACHER: ['all', 'groups', 'enrollments']
};

function allowedTabs(role?: string): UsersTab[] {
  return TAB_ACCESS[role ?? ''] ?? ['all'];
}

/** Holds the row's height while a tab loads its own numbers. */
const PLACEHOLDER_STATS: UserStat[] = [
  { labelKey: 'common.loading', value: 0 },
  { labelKey: 'common.loading', value: 0 },
  { labelKey: 'common.loading', value: 0 },
  { labelKey: 'common.loading', value: 0 }
];

export default function UsersPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: authUser } = useAuthUser();
  const systemRoles = useSystemRoles();
  const availableRoles = useAvailableRoles();
  const allowed = useMemo(() => allowedTabs(authUser?.role), [authUser?.role]);

  const [tab, setTab] = useState<UsersTab>('all');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>(ALL_ROLES);
  const [groups, setGroups] = useState<StudentGroup[]>([]);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);

  const { stats: userStats, refresh: refreshStats } = useUserStats();
  const pendingRequestsCount = userStats.pendingRequests;
  const isUserTab = tab === 'all';

  const { users, totalCount, isLoading, refresh } = useUsersList({
    page,
    limit: PAGE_SIZE,
    search,
    role: roleFilter,
    enabled: isUserTab
  });

  // The sidebar links straight to a filtered view (e.g. /users?role=STUDENT),
  // so the URL opens the right tab and filter. It only re-applies when the URL
  // itself changes, otherwise it would undo the user's own dropdown choice.
  const roleParam = searchParams.get('role');
  const tabParam = searchParams.get('tab');
  useEffect(() => {
    if (roleParam) setRoleFilter(roleParam.toUpperCase());
    if (
      tabParam &&
      allowedTabs(authUser?.role).includes(tabParam as UsersTab)
    ) {
      setTab(tabParam as UsersTab);
    }
  }, [roleParam, tabParam, authUser?.role]);

  const refreshAll = useCallback(() => {
    void refresh();
    void refreshStats();
  }, [refresh, refreshStats]);

  const fetchGroups = useCallback(async () => {
    try {
      const result = await studentGroupsApi.list();
      const raw = (result?.data ?? []) as StudentGroup[];
      setGroups(raw.map((g, i) => ({ ...g, tone: (22 + i * 80) % 360 })));
    } catch (error) {
      ErrorHandler.handleApiError(error);
    }
  }, []);

  useEffect(() => {
    if (tab === 'groups') void fetchGroups();
  }, [tab, fetchGroups]);

  useEffect(() => {
    setPage(1);
  }, [tab, search, roleFilter]);

  // The stats row is always four tiles, on every tab, so switching tabs never
  // moves the content under the reader. Tabs that own their own data report it
  // through onStats; the list and groups tabs are computed here.
  const [reportedStats, setReportedStats] = useState<UserStat[] | null>(null);
  useEffect(() => {
    setReportedStats(null);
  }, [tab]);

  // Every number here is a server-side total for its own filter — see
  // useUserStats. Deriving them from the loaded page counted one page of
  // teachers as "all teachers", and invented the active figure outright.
  const userTabStats: UserStat[] = [
    { labelKey: 'users.totalUsers', value: userStats.total },
    { labelKey: 'users.activeUsers', value: userStats.active },
    { labelKey: 'users.teachers', value: userStats.teachers },
    { labelKey: 'users.pendingApproval', value: userStats.pendingRequests }
  ];

  const groupTabStats: UserStat[] = [
    { labelKey: 'users.groups', value: groups.length },
    {
      labelKey: 'common.active',
      value: groups.filter((group) => group.is_active).length
    },
    {
      labelKey: 'users.groupMembers',
      value: groups.reduce((sum, g) => sum + (g._count?.Members ?? 0), 0)
    },
    {
      labelKey: 'users.groupCourseAccess',
      value: groups.reduce((sum, g) => sum + (g._count?.CourseGrants ?? 0), 0)
    }
  ];

  const statsForTab = (): UserStat[] => {
    if (tab === 'all') return userTabStats;
    if (tab === 'groups') return groupTabStats;
    return reportedStats ?? PLACEHOLDER_STATS;
  };

  const allTabs: UsersTabItem[] = [
    { value: 'all', label: t('users.users'), count: totalCount },
    { value: 'groups', label: t('users.groups'), count: groups.length },
    { value: 'enrollments', label: t('students.enrollments') },
    {
      value: 'requests',
      label: t('users.requests'),
      count: pendingRequestsCount,
      urgent: true
    }
  ];
  const tabs = allTabs.filter((item) => allowed.includes(item.value));

  return (
    <PageContainer>
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
      <UsersPageHeader onChanged={refreshAll} />

      {pendingRequestsCount > 0 &&
        tab !== 'requests' &&
        allowed.includes('requests') && (
          <UsersPendingBanner
            count={pendingRequestsCount}
            onReview={() => setTab('requests')}
          />
        )}

      <UsersStatsBar stats={statsForTab()} />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <UsersTabBar tabs={tabs} value={tab} onChange={setTab} />
        {isUserTab && (
          <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto">
            <div className="relative w-full min-w-0 sm:w-56">
              <Search className="pointer-events-none absolute start-[10px] top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                className="h-9 w-full rounded-lg border border-border bg-card pe-3 ps-8 text-[13px] outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10"
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

      {isUserTab &&
        (isLoading ? (
          <div className="flex h-48 items-center justify-center text-muted-foreground">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <UsersTable
            users={users}
            roles={systemRoles}
            totalCount={totalCount}
            page={page}
            onPageChange={setPage}
            onRoleClick={() => router.push('/settings/roles')}
            onChanged={refresh}
          />
        ))}
      {tab === 'groups' && (
        <UsersGroupsGrid
          groups={groups}
          onCreate={() => setCreateGroupOpen(true)}
          onOpen={setOpenGroupId}
        />
      )}
      {tab === 'enrollments' && (
        <LearningNavGate requiredCapability="students">
          <UsersEnrollmentsView onStats={setReportedStats} />
        </LearningNavGate>
      )}
      {tab === 'requests' && (
        <UsersRequestsView
          onPendingCountChange={refreshStats}
          onStats={setReportedStats}
        />
      )}
    </PageContainer>
  );
}
