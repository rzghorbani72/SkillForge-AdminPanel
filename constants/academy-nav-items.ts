import type { IconType } from '@/components/icons';
import type { NavItem } from '@/types';

const ACADEMY_SUPPORT_ROLES: NonNullable<NavItem['roles']> = [
  'PLATFORM_OWNER',
  'ADMIN',
  'FINANCE',
  'SUPPORT',
  'MANAGER',
  'TEACHER',
];

// TODO: re-enable when the affiliate program is ready to ship.
const AFFILIATE_NAV_ENABLED = false;

export const academyNavItems: NavItem[] = [
  // Ordered by how often a manager needs it: the daily destinations are flat
  // and always visible; only the occasional screens sit inside a group.
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: 'dashboard' as IconType,
    label: 'dashboard',
    scope: 'academy',
  },
  {
    title: 'Courses',
    href: '/courses',
    icon: 'course' as IconType,
    label: 'courses',
    scope: 'academy',
  },
  {
    title: 'Users',
    href: '/users',
    icon: 'users' as IconType,
    label: 'users',
    roles: ['PLATFORM_OWNER', 'ADMIN', 'FINANCE', 'SUPPORT', 'MANAGER', 'TEACHER'],
    scope: 'academy',
  },
  {
    title: 'My Academies',
    href: '/academies',
    icon: 'store' as IconType,
    label: 'myAcademies',
    roles: ['MANAGER', 'TEACHER'],
    scope: 'academy',
  },
  // Teaching — every child is capability-gated, so an academy that sells only
  // recorded courses never sees this group at all.
  {
    title: 'Teaching',
    icon: 'bookOpen' as IconType,
    label: 'teaching',
    roles: ['PLATFORM_OWNER', 'ADMIN', 'FINANCE', 'SUPPORT', 'MANAGER', 'TEACHER'],
    scope: 'academy',
    children: [
      {
        title: 'Assignments',
        href: '/assignments',
        icon: 'bookOpen' as IconType,
        label: 'assignments',
        scope: 'academy',
        requiresLearningCapability: 'assignments',
      },
      {
        title: 'Ops Queue',
        href: '/learning/ops-queue',
        icon: 'trendingUp' as IconType,
        label: 'opsQueue',
        scope: 'academy',
        requiresLearningCapability: 'ops_queue',
      },
    ],
  },
  // Money — student income, settlement / teacher share, and Mentoma bills in one place
  {
    title: 'Money',
    icon: 'dollarSign' as IconType,
    label: 'financeHub',
    roles: ['PLATFORM_OWNER', 'ADMIN', 'FINANCE', 'MANAGER'],
    scope: 'academy',
    keepGrouped: true,
    children: [
      {
        title: 'Student Payments',
        href: '/financial/academy',
        icon: 'creditCard' as IconType,
        label: 'studentPayments',
        roles: ['PLATFORM_OWNER', 'ADMIN', 'FINANCE', 'MANAGER'],
        scope: 'academy',
      },
      {
        title: 'Settlement',
        href: '/financial/academy/settlement',
        icon: 'banknote' as IconType,
        label: 'settlement',
        roles: ['PLATFORM_OWNER', 'ADMIN', 'FINANCE', 'MANAGER'],
        scope: 'academy',
      },
      {
        title: 'Teacher share',
        href: '/financial/academy/settlement#teacher-share',
        icon: 'percent' as IconType,
        label: 'teacherShareNav',
        roles: ['PLATFORM_OWNER', 'ADMIN', 'FINANCE', 'MANAGER'],
        scope: 'academy',
      },
      {
        title: 'Student Vouchers',
        href: '/coupons',
        icon: 'percent' as IconType,
        label: 'studentVouchers',
        roles: ['PLATFORM_OWNER', 'ADMIN', 'MANAGER'],
        scope: 'academy',
      },
      {
        title: 'Payments to platform',
        href: '/financial/academy/platform-invoices',
        icon: 'creditCard' as IconType,
        label: 'platformPaymentsNav',
        roles: ['PLATFORM_OWNER', 'ADMIN', 'MANAGER'],
        scope: 'academy',
      },
      {
        title: 'Academy Subscription',
        href: '/plans',
        icon: 'billing' as IconType,
        label: 'platformPlan',
        roles: ['PLATFORM_OWNER', 'ADMIN', 'MANAGER'],
        scope: 'academy',
      },
      {
        title: 'Platform vouchers',
        href: '/coupons/plan-vouchers',
        icon: 'percent' as IconType,
        label: 'planVouchers',
        roles: ['PLATFORM_OWNER', 'ADMIN', 'MANAGER'],
        scope: 'academy',
      },
    ],
  },
  {
    title: 'Website',
    href: '/website',
    icon: 'layout' as IconType,
    label: 'academyWebsite',
    roles: ['PLATFORM_OWNER', 'ADMIN', 'MANAGER'],
    scope: 'academy',
  },
  {
    title: 'My Earnings',
    href: '/teacher-earnings',
    icon: 'wallet2' as IconType,
    label: 'teacherEarnings',
    roles: ['TEACHER'],
    scope: 'academy',
  },
  // Growth — what measures or feeds the public site, not the site itself
  {
    title: 'Growth',
    icon: 'trendingUp' as IconType,
    label: 'growthHub',
    roles: ['PLATFORM_OWNER', 'ADMIN', 'MANAGER', 'TEACHER'],
    scope: 'academy',
    children: [
      {
        title: 'Analytics',
        href: '/analytics',
        icon: 'barChart' as IconType,
        label: 'analytics',
        roles: ['PLATFORM_OWNER', 'ADMIN', 'MANAGER'],
        scope: 'academy',
      },
      {
        title: 'Blog',
        href: '/website/blog',
        icon: 'fileText' as IconType,
        label: 'academyBlog',
        roles: ['PLATFORM_OWNER', 'ADMIN', 'MANAGER', 'TEACHER'],
        scope: 'academy',
      },
      {
        title: 'Marketing',
        href: '/affiliates',
        icon: 'network' as IconType,
        label: 'affiliates',
        roles: ['PLATFORM_OWNER', 'ADMIN', 'MANAGER'],
        scope: 'academy',
      },
      {
        title: 'Academy health',
        href: '/monitoring',
        icon: 'activity' as IconType,
        label: 'monitoring',
        roles: ['PLATFORM_OWNER', 'ADMIN', 'MANAGER'],
        scope: 'academy',
      },
    ],
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: 'settings' as IconType,
    label: 'settingsHub',
    roles: ['PLATFORM_OWNER', 'ADMIN', 'MANAGER', 'TEACHER'],
    scope: 'academy',
  },
  {
    title: 'Support',
    href: '/support',
    icon: 'help' as IconType,
    label: 'support',
    roles: ACADEMY_SUPPORT_ROLES,
    scope: 'academy',
  },
  ...(AFFILIATE_NAV_ENABLED
    ? [
        {
          title: 'My Affiliate',
          href: '/my-affiliate',
          icon: 'network' as IconType,
          label: 'my-affiliate',
          roles: ['STUDENT', 'TEACHER', 'AFFILIATE'],
        } satisfies NavItem,
      ]
    : []),
];
