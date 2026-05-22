import { NavItem } from '@/types';

type Role = 'ADMIN' | 'SUPPORT' | 'MANAGER' | 'TEACHER' | 'STUDENT' | 'USER';

/**
 * Filter sidebar items by the caller's role.
 * - `roles`: allow-list of roles that can see this item; absence means everyone.
 * - `adminOnly`: only platform-level admins (ADMIN role without a store).
 * - `hasStore`: true when the ADMIN has a specific academy attached.
 */
export function filterNavItemsByRole(
  items: NavItem[],
  userRole: Role | null,
  hasStore?: boolean
): NavItem[] {
  if (!userRole) {
    return items.filter((item) => !item.roles || item.roles.length === 0);
  }
  return items.filter((item) => {
    // Role allow-list
    if (item.roles && item.roles.length > 0) {
      if (!(item.roles as Role[]).includes(userRole)) return false;
    }
    // adminOnly: only visible to ADMIN users who do NOT have a store (platform-level)
    if (item.adminOnly) {
      if (userRole !== 'ADMIN') return false;
      if (hasStore === true) return false;
    }
    return true;
  });
}
