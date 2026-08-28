'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import type { PermissionCatalog, PlatformRole } from '@/types/roles';

// A non-owner actor's creation ceiling: the named reference role whose
// hierarchy_level bounds what they may create (mirrors the backend's
// ROLE_CREATION_CAP in Backend/src/roles/permission-catalog.ts).
const CREATION_CAP_ROLE: Record<string, string> = {
  ADMIN: 'MANAGER',
  MANAGER: 'TEACHER'
};

const OWNER_MAX_CUSTOM_LEVEL = 5;

interface UseRolesDataResult {
  roles: PlatformRole[];
  catalog: PermissionCatalog | null;
  loading: boolean;
  reload: () => Promise<void>;
  /** Highest level this user may create or manage. */
  capLevel: number;
  /** This user's own rank — the ceiling for assigning a role to someone. */
  ownLevel: number;
}

export function useRolesData(currentRole?: string): UseRolesDataResult {
  const [roles, setRoles] = useState<PlatformRole[]>([]);
  const [catalog, setCatalog] = useState<PermissionCatalog | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      const [rolesRes, catalogRes] = await Promise.all([
        apiClient.getPlatformRoles(),
        apiClient.getPermissionCatalog()
      ]);
      setRoles(rolesRes.roles);
      setCatalog(catalogRes);
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const ownLevel = useMemo(
    () => roles.find((role) => role.name === currentRole)?.hierarchy_level ?? 0,
    [roles, currentRole]
  );

  const capLevel = useMemo(() => {
    if (!currentRole) return 0;
    const capRoleName = CREATION_CAP_ROLE[currentRole];
    if (!capRoleName) {
      // No cap role means PLATFORM_OWNER; anyone else falls back to their own
      // rank rather than to the widest ceiling.
      return currentRole === 'PLATFORM_OWNER'
        ? OWNER_MAX_CUSTOM_LEVEL
        : ownLevel;
    }
    return (
      roles.find((role) => role.name === capRoleName)?.hierarchy_level ??
      ownLevel
    );
  }, [roles, currentRole, ownLevel]);

  return { roles, catalog, loading, reload, capLevel, ownLevel };
}

/**
 * The viewer's own role first, then custom roles (newest first) — those are the
 * ones a manager works with. The built-in platform roles come after, ranked high
 * to low.
 */
export function sortRoles(
  roles: PlatformRole[],
  currentRole?: string
): PlatformRole[] {
  return [...roles].sort((a, b) => {
    const aIsOwn = a.name === currentRole;
    const bIsOwn = b.name === currentRole;
    if (aIsOwn !== bIsOwn) return aIsOwn ? -1 : 1;
    if (a.is_system !== b.is_system) return a.is_system ? 1 : -1;
    if (!a.is_system) {
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
    return (
      b.hierarchy_level - a.hierarchy_level || a.name.localeCompare(b.name)
    );
  });
}
