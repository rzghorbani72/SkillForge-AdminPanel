import { NavItem } from '@/types';

type Role = 'ADMIN' | 'SUPPORT' | 'MANAGER' | 'TEACHER' | 'STUDENT' | 'USER';

const paymentEnabled = process.env.NEXT_PUBLIC_PAYMENT_ENABLED === 'true';

/**
 * Filter sidebar items by the caller's role.
 * - `roles`: allow-list of roles that can see this item; absence means everyone.
 * - `adminOnly`: only platform-level admins (ADMIN role without a store).
 * - `hasStore`: true when the ADMIN has a specific academy attached.
 * - `paymentGated`: hidden when NEXT_PUBLIC_PAYMENT_ENABLED !== 'true'.
 */
export function filterNavItemsByRole(
  items: NavItem[],
  userRole: Role | null,
  hasStore?: boolean
): NavItem[] {
  if (!userRole) {
    return items.filter((item) => !item.roles || item.roles.length === 0);
  }
  // Platform mode: a platform-level user (ADMIN/SUPPORT) with no academy selected.
  // hasStore===false means they are at platform level; true means scoped into one.
  const isPlatformRole = userRole === 'ADMIN' || userRole === 'SUPPORT';
  const platformMode = isPlatformRole && hasStore === false;
  return items.filter((item) => {
    // Payment-gated items hidden when payments are disabled for this deployment
    if (item.paymentGated && !paymentEnabled) return false;
    // Role allow-list
    if (item.roles && item.roles.length > 0) {
      if (!(item.roles as Role[]).includes(userRole)) return false;
    }
    // adminOnly: only visible to ADMIN users who do NOT have a store (platform-level)
    if (item.adminOnly) {
      if (userRole !== 'ADMIN') return false;
      if (hasStore === true) return false;
    }
    // Mode separation: academy tools hide in Platform mode; platform tools hide
    // once an academy is selected (Academy mode).
    if (platformMode && item.scope === 'academy') return false;
    if (!platformMode && item.scope === 'platform') return false;
    return true;
  });
}
