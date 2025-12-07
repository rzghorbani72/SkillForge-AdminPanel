import { NavItem } from '@/types';

/**
 * Filter navigation items based on user role
 * If an item has a roles array, only show it if user role is in that array
 * If an item doesn't have roles, show it to everyone
 */
export function filterNavItemsByRole(
  items: NavItem[],
  userRole: 'ADMIN' | 'MANAGER' | 'TEACHER' | 'STUDENT' | null
): NavItem[] {
  if (!userRole) {
    // If no role, only show items without role restrictions
    return items
      .filter((item) => !item.roles || item.roles.length === 0)
      .map((item) => ({
        ...item,
        children: item.children
          ? filterNavItemsByRole(item.children, userRole)
          : undefined
      }));
  }

  return items
    .filter((item) => {
      // If item has no role restriction, show it
      if (!item.roles || item.roles.length === 0) {
        return true;
      }
      // Otherwise, check if user role is in the allowed roles
      return item.roles.includes(userRole);
    })
    .map((item) => ({
      ...item,
      children: item.children
        ? filterNavItemsByRole(item.children, userRole)
        : undefined
    }))
    .map((item) => {
      // Remove empty parent items (items with children but all children were filtered out)
      if (item.children && item.children.length === 0 && !item.href) {
        return null;
      }
      return item;
    })
    .filter((item): item is NavItem => item !== null);
}
