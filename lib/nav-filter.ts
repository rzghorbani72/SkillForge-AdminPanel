import { NavItem } from '@/types';

type Role = 'ADMIN' | 'SUPPORT' | 'MANAGER' | 'TEACHER' | 'STUDENT' | 'USER';

/**
 * Filter sidebar items by the caller's role. Each NavItem may declare a
 * `roles: Role[]` allow-list; absence means "show to everyone authenticated".
 * `hasStore` is retained for backward compatibility but no longer needed for
 * the current 6-item sidebar.
 */
export function filterNavItemsByRole(
  items: NavItem[],
  userRole: Role | null,
  _hasStore?: boolean
): NavItem[] {
  if (!userRole) {
    return items.filter((item) => !item.roles || item.roles.length === 0);
  }
  return items.filter((item) => {
    if (!item.roles || item.roles.length === 0) return true;
    return (item.roles as Role[]).includes(userRole);
  });
}
