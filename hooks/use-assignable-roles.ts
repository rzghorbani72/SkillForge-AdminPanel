'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { getRoleDisplayLabel } from '@/lib/i18n/role-label';
import type { PlatformRole } from '@/types/roles';

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
  const [roles, setRoles] = useState<AssignableRole[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { roles: fetched } = await apiClient.getPlatformRoles();
      setRoles(toAssignable(fetched, t));
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (enabled) void load();
  }, [enabled, load]);

  return { roles, loading };
}

function toAssignable(
  roles: PlatformRole[],
  t: (key: string) => string
): AssignableRole[] {
  return roles
    .filter((role) => role.is_active && !NEVER_ASSIGNABLE.has(role.name))
    .map((role) => ({
      id: role.id,
      name: role.name,
      label: getRoleDisplayLabel(role, t),
      hierarchy_level: role.hierarchy_level
    }))
    .sort(
      (a, b) =>
        b.hierarchy_level - a.hierarchy_level || a.label.localeCompare(b.label)
    );
}
