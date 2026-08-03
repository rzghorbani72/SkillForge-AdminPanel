import { apiClient } from '@/lib/api';
import type { InterpolationParams } from '@/lib/i18n';
import type { User } from '@/types/api';

export type UserCategory = 'all' | 'students' | 'teachers' | 'managers';
export type UserRoleFilter =
  | 'all'
  | 'ADMIN'
  | 'MANAGER'
  | 'TEACHER'
  | 'STUDENT'
  | 'USER';
export type UserStatusFilter =
  | 'all'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'SUSPENDED'
  | 'BANNED';

export interface UsersQuery {
  page: number;
  limit: number;
  search?: string;
  role: UserRoleFilter;
  status: UserStatusFilter;
  academy_id: string | null;
}

export interface UsersPage {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  } | null;
}

interface CategoryConfig {
  titleKey: string;
  descriptionKey: string;
  defaultRole: UserRoleFilter;
  roleLocked: boolean;
  fetch: (query: UsersQuery) => Promise<UsersPage>;
}

/** The list endpoints answer with `users` or `profiles`, paginated or bare. */
function normalize(payload: unknown): UsersPage {
  if (Array.isArray(payload)) {
    return { users: payload as User[], pagination: null };
  }
  if (!payload || typeof payload !== 'object') {
    return { users: [], pagination: null };
  }

  const record = payload as {
    users?: unknown;
    profiles?: unknown;
    pagination?: UsersPage['pagination'];
  };
  const list = (record.users ?? record.profiles ?? []) as (User & {
    full_name?: string;
  })[];

  return {
    users: list.map((item) => ({
      ...item,
      name: item.full_name ?? item.display_name ?? item.name,
      display_name: item.full_name ?? item.display_name ?? item.name ?? ''
    })),
    pagination: record.pagination ?? null
  };
}

function baseParams(query: UsersQuery) {
  return {
    page: query.page,
    limit: query.limit,
    search: query.search,
    status: query.status === 'all' ? undefined : query.status,
    academy_id: query.academy_id ?? undefined
  };
}

export const CATEGORY_CONFIG: Record<UserCategory, CategoryConfig> = {
  all: {
    titleKey: 'users.allUsers',
    descriptionKey: 'users.manageAllUsersDescription',
    defaultRole: 'all',
    roleLocked: false,
    fetch: async (query) =>
      normalize(
        await apiClient.getUsers({
          ...baseParams(query),
          role: query.role === 'all' ? undefined : query.role
        })
      )
  },
  students: {
    titleKey: 'users.students',
    descriptionKey: 'users.studentsDescription',
    defaultRole: 'STUDENT',
    roleLocked: true,
    fetch: async (query) =>
      normalize(await apiClient.getStudentUsers(baseParams(query)))
  },
  teachers: {
    titleKey: 'users.teachers',
    descriptionKey: 'users.teachersDescription',
    defaultRole: 'TEACHER',
    roleLocked: true,
    fetch: async (query) =>
      normalize(await apiClient.getTeacherUsers(baseParams(query)))
  },
  managers: {
    titleKey: 'users.managers',
    descriptionKey: 'users.managersDescription',
    defaultRole: 'MANAGER',
    roleLocked: true,
    fetch: async (query) =>
      normalize(await apiClient.getManagerUsers(baseParams(query)))
  }
};

export function exportUsersCsv(
  users: readonly User[],
  category: UserCategory,
  t: (key: string, params?: InterpolationParams) => string
): void {
  const headers = [
    t('users.id'),
    t('common.name'),
    t('common.email'),
    t('common.phone'),
    t('common.status'),
    t('users.createdAt')
  ];
  const rows = users.map((user) => [
    user.id,
    user.display_name || user.name || '',
    user.email ?? '',
    user.phone_number,
    user.status ?? (user.is_active ? 'ACTIVE' : 'INACTIVE'),
    new Date(user.created_at).toLocaleDateString()
  ]);

  const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
  const url = URL.createObjectURL(
    new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = `users-${category}-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
