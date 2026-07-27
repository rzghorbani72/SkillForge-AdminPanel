export interface PermissionUser {
  role?: string | null;
  granularPermissions?: string[] | null;
}

/**
 * Checks the roles/permissions engine's (resource, action) grid — distinct
 * from the role-name checks in lib/roles.ts. PLATFORM_OWNER always bypasses
 * the grid server-side (see PermissionsGuard), so it does the same here.
 */
export function hasPermission(
  user: PermissionUser | null | undefined,
  resource: string,
  action: string
): boolean {
  if (!user) return false;
  if (user.role === 'PLATFORM_OWNER') return true;
  return (user.granularPermissions ?? []).includes(`${resource}:${action}`);
}
