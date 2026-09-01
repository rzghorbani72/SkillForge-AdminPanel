import type { NavItem } from '@/types';
import type { PanelRole } from '@/lib/roles';

type Role = PanelRole;

export type LearningNavVisibility = {
  students: boolean;
  assignments: boolean;
  ops_queue: boolean;
  tutoring: boolean;
};

type FilterNavOptions = {
  role: Role | null;
  hasStore?: boolean;
  learningVisibility?: LearningNavVisibility | null;
  /** False only for a non-staff user who has not created/joined an academy yet. */
  hasAcademy?: boolean;
};

/**
 * The single destination an academy-less user is offered: every other page is
 * academy-scoped, so listing it would only lead to a blocked screen.
 */
const ACADEMY_LESS_HREF = '/academies';

const paymentEnabled = process.env.NEXT_PUBLIC_PAYMENT_ENABLED === 'true';

const ACADEMY_CAPABILITY_ROLES: Role[] = [
  'TEACHER',
  'MANAGER',
  'ADMIN',
  'SUPPORT',
  'FINANCE',
  'PLATFORM_OWNER'
];

/**
 * Platform mode = platform staff who have not scoped into an academy. Shared so
 * the sidebar and the scope banner never disagree about which mode we are in.
 */
export function isPlatformMode(role: Role | null, hasStore?: boolean): boolean {
  if (!role) return false;
  const isPlatformRole =
    role === 'PLATFORM_OWNER' ||
    role === 'ADMIN' ||
    role === 'FINANCE' ||
    role === 'SUPPORT';
  return isPlatformRole && hasStore === false;
}

export function shouldApplyLearningNavGating(
  userRole: Role,
  hasStore?: boolean
): boolean {
  if (!ACADEMY_CAPABILITY_ROLES.includes(userRole)) return false;
  if (isPlatformMode(userRole, hasStore)) return false;
  if (userRole === 'TEACHER' || userRole === 'MANAGER') return true;
  return hasStore === true;
}

function passesRoleFilters(
  item: NavItem,
  userRole: Role,
  hasStore?: boolean,
  platformMode?: boolean
): boolean {
  if (item.paymentGated && !paymentEnabled) return false;
  if (item.roles && item.roles.length > 0) {
    if (!(item.roles as Role[]).includes(userRole)) return false;
  }
  if (item.adminOnly) {
    if (userRole !== 'ADMIN' && userRole !== 'PLATFORM_OWNER') return false;
    if (hasStore === true) return false;
  }
  if (item.financeOnly) {
    if (
      userRole !== 'PLATFORM_OWNER' &&
      userRole !== 'ADMIN' &&
      userRole !== 'FINANCE'
    ) {
      return false;
    }
  }
  if (item.supportOnly) {
    if (
      userRole !== 'PLATFORM_OWNER' &&
      userRole !== 'ADMIN' &&
      userRole !== 'SUPPORT'
    ) {
      return false;
    }
  }
  if (platformMode && item.scope === 'academy') return false;
  if (!platformMode && item.scope === 'platform') return false;
  return true;
}

function passesLearningCapability(
  item: NavItem,
  userRole: Role,
  hasStore: boolean | undefined,
  learningVisibility: LearningNavVisibility | null | undefined
): boolean {
  if (!item.requiresLearningCapability) return true;
  if (!shouldApplyLearningNavGating(userRole, hasStore)) return true;
  if (!learningVisibility) return false;
  return learningVisibility[item.requiresLearningCapability] === true;
}

function filterItem(
  item: NavItem,
  options: FilterNavOptions,
  platformMode: boolean
): NavItem | null {
  const { role, hasStore, learningVisibility } = options;
  if (!role) {
    if (item.roles && item.roles.length > 0) return null;
    return item;
  }
  if (!passesRoleFilters(item, role, hasStore, platformMode)) return null;
  if (!passesLearningCapability(item, role, hasStore, learningVisibility)) {
    return null;
  }

  if (!item.children?.length) return item;

  const children = item.children
    .filter((child) => !child.disabled)
    .map((child) => filterItem(child, options, platformMode))
    .filter((child): child is NavItem => child !== null);

  if (item.requiresLearningCapability && children.length === 0) {
    return null;
  }

  // A single remaining child collapses into its parent: no submenu,
  // the parent link itself is the default page (e.g. Users -> /users).
  if (children.length <= 1) {
    const { children: _omit, ...itemWithoutChildren } = item;
    return itemWithoutChildren;
  }

  return { ...item, children };
}

/**
 * Filter sidebar items by role, platform/academy mode, payment gate,
 * and learning capabilities from course selling types.
 */
export function filterNavItems(
  items: NavItem[],
  options: FilterNavOptions
): NavItem[] {
  const { role, hasStore } = options;
  if (!role) {
    return items.filter((item) => !item.roles || item.roles.length === 0);
  }

  const platformMode = isPlatformMode(role, hasStore);

  const visible = items
    .map((item) => filterItem(item, options, platformMode))
    .filter((item): item is NavItem => item !== null);

  if (options.hasAcademy === false) {
    return visible
      .filter((item) => item.href === ACADEMY_LESS_HREF)
      .slice(0, 1);
  }

  return visible;
}

/** @deprecated Use filterNavItems */
export function filterNavItemsByRole(
  items: NavItem[],
  userRole: Role | null,
  hasStore?: boolean
): NavItem[] {
  return filterNavItems(items, { role: userRole, hasStore });
}
