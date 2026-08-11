'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { ALL_ROLES } from '@/components/users/users-role-filter';
import type { User } from '@/types/api';
import type { PlatformRole } from '@/types/roles';

interface UseUsersListParams {
  page: number;
  limit: number;
  search: string;
  role: string;
  /** Skips fetching while another tab is open. */
  enabled: boolean;
}

export function useUsersList({
  page,
  limit,
  search,
  role,
  enabled
}: UseUsersListParams) {
  const [users, setUsers] = useState<User[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    if (!enabled) return;
    setIsLoading(true);
    try {
      // One paginated endpoint for every case: the role dropdown just adds a
      // filter, so custom roles page exactly like the built-in ones.
      const data = await apiClient.getUsers({
        page,
        limit,
        search: search || undefined,
        role: role === ALL_ROLES ? undefined : role
      });
      const list: User[] = data?.users ?? data?.profiles ?? [];
      setUsers(list);
      setTotalCount(data?.pagination?.total ?? list.length);
    } catch (error) {
      ErrorHandler.handleApiError(error);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search, role, enabled]);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  return { users, totalCount, isLoading, refresh: fetchUsers };
}

/** Active roles available to filter by, including academy-defined ones. */
export function useAvailableRoles(): PlatformRole[] {
  const [roles, setRoles] = useState<PlatformRole[]>([]);

  useEffect(() => {
    void (async () => {
      try {
        const result = await apiClient.getPlatformRoles();
        setRoles(result.roles.filter((role) => role.is_active));
      } catch {
        // Non-critical: the dropdown stays empty but the list still works.
      }
    })();
  }, []);

  return roles;
}
