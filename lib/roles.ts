export type PanelRole =
  | 'PLATFORM_OWNER'
  | 'ADMIN'
  | 'FINANCE'
  | 'SUPPORT'
  | 'MANAGER'
  | 'TEACHER'
  | 'STUDENT'
  | 'USER';

export interface PlatformStaffUser {
  role?: string | null;
  platformRole?: string | null;
  isAdminProfile?: boolean;
  platformLevel?: boolean;
}

export function isPlatformStaff(
  user: PlatformStaffUser | null | undefined
): boolean {
  if (!user) return false;
  const role = user.role ?? '';
  return (
    !!user.isAdminProfile ||
    !!user.platformLevel ||
    role === 'PLATFORM_OWNER' ||
    role === 'ADMIN' ||
    role === 'FINANCE' ||
    role === 'SUPPORT'
  );
}

export function isPlatformAdmin(
  user: PlatformStaffUser | null | undefined
): boolean {
  if (!user) return false;
  const role = user.role ?? '';
  if (role === 'PLATFORM_OWNER') return true;
  // ADMIN must be an AdminProfile session — never an academy Profile.
  return role === 'ADMIN' && (!!user.isAdminProfile || !!user.platformLevel);
}

export function isPlatformOwner(
  user: PlatformStaffUser | null | undefined
): boolean {
  return user?.role === 'PLATFORM_OWNER';
}

export function canAccessFinance(
  user: PlatformStaffUser | null | undefined
): boolean {
  if (!user) return false;
  const role = user.role ?? '';
  return (
    role === 'PLATFORM_OWNER' ||
    role === 'ADMIN' ||
    role === 'FINANCE' ||
    role === 'MANAGER'
  );
}

export function canAccessSupportOps(
  user: PlatformStaffUser | null | undefined
): boolean {
  if (!user) return false;
  const role = user.role ?? '';
  return role === 'PLATFORM_OWNER' || role === 'ADMIN' || role === 'SUPPORT';
}

export function isPanelStaffRole(role: string | null | undefined): boolean {
  return (
    role === 'PLATFORM_OWNER' ||
    role === 'ADMIN' ||
    role === 'FINANCE' ||
    role === 'SUPPORT' ||
    role === 'MANAGER' ||
    role === 'TEACHER'
  );
}
