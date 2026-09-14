'use client';

import { useMemo } from 'react';
import { apiClient } from '@/lib/api';
import { useTranslation } from '@/lib/i18n/hooks';
import { getRoleDisplayLabel } from '@/lib/i18n/role-label';
import type { PlatformRole } from '@/types/roles';
import { useApiQuery } from '@/hooks/use-api-query';
import { useCurrentAcademyId } from '@/hooks/useCurrentAcademy';
import { queryKeys } from '@/lib/query/keys';

/** Roles change rarely; a long stale window keeps dialogs from refetching. */
const ROLES_STALE_TIME_MS = 5 * 60_000;

const EMPTY_ROLES: PlatformRole[] = [];

/** Manager rank: a role at this level or above consumes a plan seat. */
export const MANAGER_HIERARCHY_LEVEL = 3;

/** Roles that live in AdminProfile, never on an academy profile. */
const NEVER_ASSIGNABLE = new Set(['PLATFORM_OWNER', 'ADMIN']);

export interface AssignableRole {
  id: string;
  name: string;
  label: string;
  hierarchy_level: number;
}

interface UseAssignableRolesResult {
  roles: AssignableRole[];
  loading: boolean;
}

/**
 * The roles the signed-in user may hand to someone in the academy they are
 * working in.
 *
 * The list is not filtered here beyond dropping roles no profile can ever hold:
 * `GET /platform/roles` already returns only roles at or below the caller's rank
 * and, for a manager, only the built-in roles plus their OWN academy's custom
 * roles. Tenant scope stays a server rule.
 */
export function useAssignableRoles(enabled = true): UseAssignableRolesResult {
  const { t } = useTranslation();
  const academyId = useCurrentAcademyId();

  // The cache holds the raw roles, so switching language relabels them from
  // memory instead of refetching.
  const { data, isLoading } = useApiQuery<PlatformRole[]>({
    queryKey: queryKeys.assignableRoles(academyId),
    queryFn: async (signal) => {
      const { roles } = await apiClient.getPlatformRoles({ signal });
      return roles;
    },
    enabled,
    staleTime: ROLES_STALE_TIME_MS,
  });

  const roles = useMemo(() => toAssignable(data ?? EMPTY_ROLES, t), [data, t]);

  return { roles, loading: isLoading };
}

function toAssignable(roles: PlatformRole[], t: (key: string) => string): AssignableRole[] {
  return roles
    .filter((role) => role.is_active && !NEVER_ASSIGNABLE.has(role.name))
    .map((role) => ({
      id: role.id,
      name: role.name,
      label: getRoleDisplayLabel(role, t),
      hierarchy_level: role.hierarchy_level,
    }))
    .sort((a, b) => b.hierarchy_level - a.hierarchy_level || a.label.localeCompare(b.label));
}
