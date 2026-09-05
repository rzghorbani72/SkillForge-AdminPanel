import type { IconType } from '@/components/icons';
import type { NavItem } from '@/types';

export enum OtpType {
  LOGIN_BY_PHONE = 'LOGIN_BY_PHONE',
  LOGIN_BY_EMAIL = 'LOGIN_BY_EMAIL',
  RESET_PASSWORD_BY_PHONE = 'RESET_PASSWORD_BY_PHONE',
  RESET_PASSWORD_BY_EMAIL = 'RESET_PASSWORD_BY_EMAIL',
  REGISTER_PHONE_VERIFICATION = 'REGISTER_PHONE_VERIFICATION',
  REGISTER_EMAIL_VERIFICATION = 'REGISTER_EMAIL_VERIFICATION'
}

export type User = {
  id: number;
  name: string;
  company: string;
  role: string;
  verified: boolean;
  status: string;
};

export const users: User[] = [];

export type Employee = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: string;
  date_of_birth: string; // Consider using a proper date type if possible
  street: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
  longitude?: number; // Optional field
  latitude?: number; // Optional field
  job: string;
  profile_picture?: string | null; // Profile picture can be a string (URL) or null (if no picture)
};

export type Product = {
  photo_url: string;
  name: string;
  description: string;
  created_at: string;
  price: number;
  id: number;
  category: string;
  updated_at: string;
};

export const navItems: NavItem[] = [
  // ── Platform mode ──────────────────────────────────────────────────────────
  // The daily destinations stay at the top level; everything a staff member
  // visits occasionally lives one click deeper, inside a group.
  {
    title: 'Platform Overview',
    href: '/platform',
    icon: 'dashboard' as IconType,
    label: 'platformOverview',
    roles: ['PLATFORM_OWNER', 'ADMIN', 'FINANCE', 'SUPPORT'],
    scope: 'platform'
  },
  {
    title: 'Academies',
    href: '/academies',
    icon: 'store' as IconType,
    label: 'allAcademies',
    roles: ['PLATFORM_OWNER', 'ADMIN', 'FINANCE', 'SUPPORT'],
    scope: 'platform'
  },
  {
    title: 'Users',
    href: '/platform/users',
    icon: 'users' as IconType,
    label: 'users',
    roles: ['PLATFORM_OWNER', 'ADMIN', 'SUPPORT'],
    scope: 'platform'
  },
  {
    title: 'Support Inbox',
    href: '/support',
    icon: 'help' as IconType,
    label: 'supportInbox',
    roles: ['PLATFORM_OWNER', 'ADMIN', 'SUPPORT'],
    supportOnly: true,
    scope: 'platform'
  },
  // Money — platform cash out
  {
    title: 'Money',
    icon: 'dollarSign' as IconType,
    label: 'financeHub',
    roles: ['PLATFORM_OWNER', 'ADMIN', 'FINANCE'],
    scope: 'platform',
    children: [
      {
        title: 'Investor Report',
        href: '/platform/metrics',
        icon: 'trendingUp' as IconType,
        label: 'investorReport',
        roles: ['PLATFORM_OWNER', 'ADMIN', 'FINANCE'],
        scope: 'platform'
      },
      {
        title: 'Platform costs',
        href: '/platform/costs',
        icon: 'dollarSign' as IconType,
        label: 'platformCosts',
        roles: ['PLATFORM_OWNER', 'ADMIN'],
        adminOnly: true,
        scope: 'platform'
      },
      {
        title: 'Financial',
        href: '/financial/desk',
        icon: 'dollarSign' as IconType,
        label: 'financialDesk',
        roles: ['PLATFORM_OWNER', 'ADMIN', 'FINANCE'],
        financeOnly: true,
        scope: 'platform',
        paymentGated: true
      },
      {
        title: 'Withdrawals',
        href: '/withdrawals',
        icon: 'banknote' as IconType,
        label: 'withdrawals',
        roles: ['PLATFORM_OWNER', 'ADMIN', 'FINANCE'],
        financeOnly: true,
        scope: 'platform',
        paymentGated: true
      },
      {
        title: 'Teacher Payouts',
        href: '/teacher-payouts',
        icon: 'wallet2' as IconType,
        label: 'teacherPayouts',
        roles: ['PLATFORM_OWNER', 'ADMIN', 'FINANCE'],
        financeOnly: true,
        adminOnly: true,
        scope: 'platform',
        paymentGated: true
      },
      {
        title: 'Subscriptions',
        href: '/subscriptions',
        icon: 'calendarClock' as IconType,
        label: 'subscriptions',
        roles: ['PLATFORM_OWNER', 'ADMIN', 'FINANCE'],
        financeOnly: true,
        adminOnly: true,
        scope: 'platform',
        paymentGated: true
      }
    ]
  },
  // Content — what the platform publishes, and the templates academies start from
  {
    title: 'Content & Templates',
    icon: 'gallery' as IconType,
    label: 'contentHub',
    roles: ['PLATFORM_OWNER', 'ADMIN'],
    scope: 'platform',
    children: [
      {
        title: 'Platform Blog',
        href: '/platform/blog',
        icon: 'fileText' as IconType,
        label: 'platformBlog',
        roles: ['PLATFORM_OWNER', 'ADMIN'],
        adminOnly: true,
        scope: 'platform'
      },
      {
        title: 'Broadcasts',
        href: '/platform/broadcasts',
        icon: 'megaphone' as IconType,
        label: 'broadcasts',
        roles: ['PLATFORM_OWNER', 'ADMIN'],
        adminOnly: true,
        scope: 'platform'
      },
      {
        title: 'Dashboard Banners',
        href: '/platform/dashboard-banners',
        icon: 'image' as IconType,
        label: 'dashboardBanners',
        roles: ['PLATFORM_OWNER', 'ADMIN'],
        adminOnly: true,
        scope: 'platform'
      },
      {
        title: 'Templates Gallery',
        href: '/website/appearance',
        icon: 'gallery' as IconType,
        label: 'templatesGallery',
        roles: ['PLATFORM_OWNER', 'ADMIN'],
        adminOnly: true,
        scope: 'platform'
      },
      {
        title: 'Template Covers',
        href: '/settings/template-covers',
        icon: 'media' as IconType,
        label: 'templateCovers',
        roles: ['PLATFORM_OWNER', 'ADMIN'],
        adminOnly: true,
        scope: 'platform'
      }
    ]
  },
  // Configuration — what the platform sells
  {
    title: 'Configuration',
    icon: 'settings' as IconType,
    label: 'configurationHub',
    roles: ['PLATFORM_OWNER', 'ADMIN'],
    scope: 'platform',
    children: [
      {
        title: 'Platform Settings',
        href: '/platform-settings',
        icon: 'settings' as IconType,
        label: 'platformSettings',
        roles: ['PLATFORM_OWNER', 'ADMIN'],
        adminOnly: true,
        scope: 'platform'
      },
      {
        title: 'Plan Pricing',
        href: '/platform/pricing',
        icon: 'layers' as IconType,
        label: 'planPricing',
        roles: ['PLATFORM_OWNER', 'ADMIN'],
        adminOnly: true,
        scope: 'platform'
      },
      {
        title: 'Platform Vouchers',
        href: '/coupons',
        icon: 'percent' as IconType,
        label: 'platformVouchers',
        roles: ['PLATFORM_OWNER', 'ADMIN'],
        adminOnly: true,
        scope: 'platform'
      }
    ]
  },
  // Governance — trust, legal and audit surfaces
  {
    title: 'Trust & Legal',
    icon: 'shield' as IconType,
    label: 'governanceHub',
    roles: ['PLATFORM_OWNER', 'ADMIN', 'SUPPORT'],
    scope: 'platform',
    children: [
      {
        title: 'Content Review',
        href: '/platform/moderation',
        icon: 'shield' as IconType,
        label: 'contentReview',
        roles: ['PLATFORM_OWNER', 'ADMIN', 'SUPPORT'],
        adminOnly: true,
        scope: 'platform'
      },
      {
        title: 'Legal Documents',
        href: '/platform/legal',
        icon: 'fileText' as IconType,
        label: 'legalDocuments',
        roles: ['PLATFORM_OWNER', 'ADMIN'],
        adminOnly: true,
        scope: 'platform'
      },
      {
        title: 'Support Access Logs',
        href: '/support-access-logs',
        icon: 'shield' as IconType,
        label: 'supportAccessLogs',
        roles: ['PLATFORM_OWNER', 'ADMIN'],
        adminOnly: true,
        scope: 'platform'
      },
      {
        title: 'Roles & Permissions',
        href: '/platform/roles',
        icon: 'shield' as IconType,
        label: 'rolesPermissions',
        roles: ['PLATFORM_OWNER', 'ADMIN'],
        adminOnly: true,
        scope: 'platform'
      }
    ]
  },
  // Ordered by how often a manager needs it: the daily destinations are flat
  // and always visible; only the occasional screens sit inside a group.
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: 'dashboard' as IconType,
    label: 'dashboard',
    scope: 'academy'
  },
  {
    title: 'Courses',
    href: '/courses',
    icon: 'course' as IconType,
    label: 'courses',
    scope: 'academy'
  },
  {
    title: 'Users',
    href: '/users',
    icon: 'users' as IconType,
    label: 'users',
    roles: [
      'PLATFORM_OWNER',
      'ADMIN',
      'FINANCE',
      'SUPPORT',
      'MANAGER',
      'TEACHER'
    ],
    scope: 'academy'
  },
  // Teaching — every child is capability-gated, so an academy that sells only
  // recorded courses never sees this group at all.
  {
    title: 'Teaching',
    icon: 'bookOpen' as IconType,
    label: 'teaching',
    roles: [
      'PLATFORM_OWNER',
      'ADMIN',
      'FINANCE',
      'SUPPORT',
      'MANAGER',
      'TEACHER'
    ],
    scope: 'academy',
    children: [
      {
        title: 'Assignments',
        href: '/assignments',
        icon: 'bookOpen' as IconType,
        label: 'assignments',
        scope: 'academy',
        requiresLearningCapability: 'assignments'
      },
      {
        title: 'Tutoring',
        href: '/tutoring',
        icon: 'userPlus' as IconType,
        label: 'tutoring',
        scope: 'academy',
        requiresLearningCapability: 'tutoring'
      },
      {
        title: 'Group Classes',
        href: '/tutoring/groups',
        icon: 'users' as IconType,
        label: 'tutoringGroups',
        scope: 'academy',
        requiresLearningCapability: 'tutoring'
      },
      {
        title: 'Ops Queue',
        href: '/learning/ops-queue',
        icon: 'trendingUp' as IconType,
        label: 'opsQueue',
        scope: 'academy',
        requiresLearningCapability: 'ops_queue'
      }
    ]
  },
  // Money — academy cash in and out. Everything but the overview is payment
  // gated, so before payments go live this collapses to a single flat row.
  {
    title: 'Money',
    icon: 'dollarSign' as IconType,
    label: 'financeHub',
    roles: ['PLATFORM_OWNER', 'ADMIN', 'FINANCE', 'MANAGER'],
    scope: 'academy',
    children: [
      {
        title: 'Financial',
        href: '/financial',
        icon: 'dollarSign' as IconType,
        label: 'financialOverview',
        roles: ['PLATFORM_OWNER', 'ADMIN', 'FINANCE', 'MANAGER'],
        scope: 'academy'
      },
      {
        title: 'Settlement',
        href: '/financial/academy/settlement',
        icon: 'banknote' as IconType,
        label: 'settlement',
        roles: ['PLATFORM_OWNER', 'ADMIN', 'MANAGER'],
        scope: 'academy',
        paymentGated: true
      },
      {
        title: 'Discounts',
        href: '/coupons',
        icon: 'percent' as IconType,
        label: 'discounts',
        roles: ['PLATFORM_OWNER', 'ADMIN', 'MANAGER'],
        scope: 'academy'
      },
      {
        title: 'Student Plans',
        href: '/plans?tab=academy',
        icon: 'layers' as IconType,
        label: 'studentPlans',
        roles: ['PLATFORM_OWNER', 'ADMIN', 'MANAGER'],
        scope: 'academy',
        paymentGated: true
      }
    ]
  },
  {
    title: 'Website',
    href: '/website',
    icon: 'layout' as IconType,
    label: 'academyWebsite',
    roles: ['PLATFORM_OWNER', 'ADMIN', 'MANAGER'],
    scope: 'academy'
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
        scope: 'academy'
      },
      {
        title: 'Blog',
        href: '/website/blog',
        icon: 'fileText' as IconType,
        label: 'academyBlog',
        roles: ['PLATFORM_OWNER', 'ADMIN', 'MANAGER', 'TEACHER'],
        scope: 'academy'
      },
      {
        title: 'Marketing',
        href: '/affiliates',
        icon: 'network' as IconType,
        label: 'affiliates',
        roles: ['PLATFORM_OWNER', 'ADMIN', 'MANAGER'],
        scope: 'academy'
      },
      {
        title: 'Academy health',
        href: '/monitoring',
        icon: 'activity' as IconType,
        label: 'monitoring',
        roles: ['PLATFORM_OWNER', 'ADMIN', 'MANAGER'],
        scope: 'academy'
      }
    ]
  },
  // The owner's own account and setup, not the academy's day-to-day
  {
    title: 'Account',
    icon: 'settings' as IconType,
    label: 'accountHub',
    roles: ['PLATFORM_OWNER', 'ADMIN', 'MANAGER', 'TEACHER'],
    scope: 'academy',
    children: [
      {
        title: 'Settings',
        href: '/settings',
        icon: 'settings' as IconType,
        label: 'settingsHub',
        roles: ['PLATFORM_OWNER', 'ADMIN', 'MANAGER', 'TEACHER'],
        scope: 'academy'
      },
      {
        title: 'Academy Subscription',
        href: '/plans',
        icon: 'billing' as IconType,
        label: 'platformPlan',
        roles: ['PLATFORM_OWNER', 'ADMIN', 'MANAGER', 'TEACHER'],
        scope: 'academy',
        paymentGated: true
      },
      {
        title: 'Storage',
        href: '/settings/storage',
        icon: 'hardDrive' as IconType,
        label: 'storage',
        roles: ['PLATFORM_OWNER', 'ADMIN', 'MANAGER'],
        scope: 'academy'
      },
      {
        title: 'Roles & Permissions',
        href: '/settings/roles',
        icon: 'shield' as IconType,
        label: 'rolesPermissions',
        roles: ['MANAGER'],
        scope: 'academy'
      },
      {
        title: 'My Academies',
        href: '/academies',
        icon: 'store' as IconType,
        label: 'myAcademies',
        roles: ['MANAGER', 'TEACHER'],
        scope: 'academy'
      }
    ]
  },
  {
    title: 'My Affiliate',
    href: '/my-affiliate',
    icon: 'network' as IconType,
    label: 'my-affiliate',
    roles: ['STUDENT', 'TEACHER', 'AFFILIATE']
  }
];

// Dashboard quick stats
export const dashboardStats = {
  totalCourses: 24,
  totalStudents: 1234,
  totalRevenue: 45678,
  activeEnrollments: 89
};

// Recent activity data
export const recentActivity = [
  {
    id: 1,
    type: 'course_created',
    title: 'New course created',
    description: 'React Fundamentals course was created',
    timestamp: '2 hours ago',
    user: 'John Doe'
  },
  {
    id: 2,
    type: 'student_enrolled',
    title: 'New student enrolled',
    description: 'Alice Johnson enrolled in JavaScript Basics',
    timestamp: '4 hours ago',
    user: 'Alice Johnson'
  },
  {
    id: 3,
    type: 'payment_received',
    title: 'Payment received',
    description: '$99 payment for Advanced React course',
    timestamp: '6 hours ago',
    user: 'Bob Smith'
  }
];

// Course difficulty options
export const courseDifficulties = [
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' }
];

// Media types
export const mediaTypes = [
  { value: 'IMAGE', label: 'Image' },
  { value: 'VIDEO', label: 'Video' },
  { value: 'AUDIO', label: 'Audio' },
  { value: 'DOCUMENT', label: 'Document' }
];

// User roles
export const userRoles = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'TEACHER', label: 'Teacher' },
  { value: 'USER', label: 'User' }
];

// Payment statuses
export const paymentStatuses = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'REFUNDED', label: 'Refunded' }
];

// Enrollment statuses
export const enrollmentStatuses = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'EXPIRED', label: 'Expired' }
];
