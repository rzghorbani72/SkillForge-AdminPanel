import { NavItem } from '@/types';

/**
 * Store-specific navigation item labels that should be hidden for admins without a store
 */
const STORE_SPECIFIC_LABELS = [
  'dashboard',
  'stores',
  'categories',
  'courses',
  'products',
  'videos',
  'images',
  'audios',
  'documents',
  'students',
  'analytics',
  'payments',
  'store-financial',
  'store-settings'
];

/**
 * Filter navigation items based on user role and store presence
 * If an item has a roles array, only show it if user role is in that array
 * If an item doesn't have roles, show it to everyone
 * For admins without a store, hide store-specific items
 */
export function filterNavItemsByRole(
  items: NavItem[],
  userRole: 'ADMIN' | 'MANAGER' | 'TEACHER' | 'STUDENT' | null,
  hasStore?: boolean
): NavItem[] {
  if (!userRole) {
    // If no role, only show items without role restrictions
    return items
      .filter((item) => !item.roles || item.roles.length === 0)
      .map((item) => ({
        ...item,
        children: item.children
          ? filterNavItemsByRole(item.children, userRole, hasStore)
          : undefined
      }));
  }

  // For platform-level admins (AdminProfile), filter out store-specific items
  // Check both hasStore === false and explicit platform-level flags
  const isAdminWithoutStore = userRole === 'ADMIN' && hasStore === false;

  return items
    .filter((item) => {
      // Check if item is admin-only (only show to admins without stores)
      if ((item as any).adminOnly === true) {
        return isAdminWithoutStore;
      }

      // If item has no role restriction, check if it's store-specific
      if (!item.roles || item.roles.length === 0) {
        // For admins without store, hide store-specific items
        if (
          isAdminWithoutStore &&
          item.label &&
          STORE_SPECIFIC_LABELS.includes(item.label)
        ) {
          return false;
        }
        return true;
      }
      // Otherwise, check if user role is in the allowed roles
      const roleMatches = item.roles.includes(userRole);

      // If role matches but admin has no store, check if item is store-specific
      if (
        roleMatches &&
        isAdminWithoutStore &&
        item.label &&
        STORE_SPECIFIC_LABELS.includes(item.label)
      ) {
        return false;
      }

      return roleMatches;
    })
    .map((item) => ({
      ...item,
      children: item.children
        ? filterNavItemsByRole(item.children, userRole, hasStore)
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
