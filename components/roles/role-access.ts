import { hasPermission, type PermissionUser } from '@/lib/permissions';
import type { PlatformRole } from '@/types/roles';

/**
 * What the current user may do with one role card. This mirrors the server rules
 * in Backend/src/roles/roles.service.ts — it decides which buttons to draw, it
 * never decides access. The server checks again on every write.
 */
export interface RoleAbilities {
  canEdit: boolean;
  canDelete: boolean;
  canAssign: boolean;
  /** i18n key explaining why editing is off, when it is. */
  readOnlyReasonKey?: string;
}

const OWNER = 'PLATFORM_OWNER';

export function getRoleAbilities(
  role: PlatformRole,
  user: PermissionUser | null,
  /** Highest level the user may create/manage; see ROLE_CREATION_CAP. */
  capLevel: number,
  ownLevel: number
): RoleAbilities {
  const canWrite = hasPermission(user, 'roles', 'write');
  const isOwner = user?.role === OWNER;

  const canAssign =
    canWrite &&
    role.is_active &&
    role.hierarchy_level <= ownLevel &&
    role.name !== OWNER &&
    role.name !== 'ADMIN';

  const reasonKey = readOnlyReason(role, user, capLevel, isOwner, canWrite);

  return {
    canEdit: !reasonKey,
    canDelete:
      !reasonKey && !role.is_system && hasPermission(user, 'roles', 'delete'),
    canAssign,
    readOnlyReasonKey: reasonKey
  };
}

function readOnlyReason(
  role: PlatformRole,
  user: PermissionUser | null,
  capLevel: number,
  isOwner: boolean,
  canWrite: boolean
): string | undefined {
  if (!canWrite) return 'roles.readOnlyNoPermission';
  if (role.name === user?.role) return 'roles.readOnlyOwnRole';
  if (role.name === OWNER) return 'roles.readOnlyOwner';
  // Built-in roles are part of the platform contract: nobody edits them from the
  // dashboard, not even the platform owner (the server refuses it too).
  if (role.is_system) return 'roles.readOnlySystem';
  if (!isOwner && role.hierarchy_level > capLevel) return 'roles.readOnlyRank';
  return undefined;
}
