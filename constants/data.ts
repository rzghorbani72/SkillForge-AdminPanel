import { IconType } from '@/components/icons';
import { NavItem } from '@/types';

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
  {
    title: 'Platform Overview',
    href: '/platform',
    icon: 'dashboard' as IconType,
    label: 'platformOverview',
    roles: ['PLATFORM_OWNER', 'ADMIN', 'FINANCE', 'SUPPORT'],
    scope: 'platform',
    section: 'platform'
  },
  {
    title: 'Academies',
    href: '/academies',
    icon: 'store' as IconType,
    label: 'allAcademies',
    roles: ['PLATFORM_OWNER', 'ADMIN', 'FINANCE', 'SUPPORT'],
    scope: 'platform',
    section: 'platform'
  },
  {
    title: 'Support Inbox',
    href: '/support',
    icon: 'help' as IconType,
    label: 'supportInbox',
    roles: ['PLATFORM_OWNER', 'ADMIN', 'SUPPORT'],
    supportOnly: true,
    scope: 'platform',
    section: 'platform'
  },
  // Templates section
  {
    title: 'Templates Gallery',
    href: '/website/appearance',
    icon: 'gallery' as IconType,
    label: 'templatesGallery',
    roles: ['PLATFORM_OWNER', 'ADMIN'],
    adminOnly: true,
    scope: 'platform',
    section: 'templates'
  },
  {
    title: 'Template Covers',
    href: '/settings/template-covers',
    icon: 'media' as IconType,
    label: 'templateCovers',
    roles: ['PLATFORM_OWNER', 'ADMIN'],
    adminOnly: true,
    scope: 'platform',
    section: 'templates'
  },
  // Finance section
  {
    title: 'Withdrawals',
    href: '/withdrawals',
    icon: 'banknote' as IconType,
    label: 'withdrawals',
    roles: ['PLATFORM_OWNER', 'ADMIN', 'FINANCE'],
    financeOnly: true,
    adminOnly: true,
    scope: 'platform',
    section: 'finance',
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
    section: 'finance',
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
    section: 'finance',
    paymentGated: true
  },
  // Configuration section
  {
    title: 'Platform Settings',
    href: '/platform-settings',
    icon: 'settings' as IconType,
    label: 'platformSettings',
    roles: ['PLATFORM_OWNER', 'ADMIN'],
    adminOnly: true,
    scope: 'platform',
    section: 'configuration'
  },
  {
    title: 'Plan Pricing',
    href: '/platform/pricing',
    icon: 'layers' as IconType,
    label: 'planPricing',
    roles: ['PLATFORM_OWNER', 'ADMIN'],
    adminOnly: true,
    scope: 'platform',
    section: 'configuration'
  },
  {
    title: 'Platform Vouchers',
    href: '/coupons',
    icon: 'percent' as IconType,
    label: 'platformVouchers',
    roles: ['PLATFORM_OWNER', 'ADMIN'],
    adminOnly: true,
    scope: 'platform',
    section: 'configuration'
  },
  {
    title: 'Broadcasts',
    href: '/platform/broadcasts',
    icon: 'megaphone' as IconType,
    label: 'broadcasts',
    roles: ['PLATFORM_OWNER', 'ADMIN'],
    adminOnly: true,
    scope: 'platform',
    section: 'configuration'
  },
  {
    title: 'Content Review',
    href: '/platform/moderation',
    icon: 'shield' as IconType,
    label: 'contentReview',
    roles: ['PLATFORM_OWNER', 'ADMIN', 'SUPPORT'],
    adminOnly: true,
    scope: 'platform',
    section: 'configuration'
  },
  {
    title: 'Legal Documents',
    href: '/platform/legal',
    icon: 'fileText' as IconType,
    label: 'legalDocuments',
    roles: ['PLATFORM_OWNER', 'ADMIN'],
    adminOnly: true,
    scope: 'platform',
    section: 'configuration'
  },
  {
    title: 'Support Access Logs',
    href: '/support-access-logs',
    icon: 'shield' as IconType,
    label: 'supportAccessLogs',
    roles: ['PLATFORM_OWNER', 'ADMIN'],
    adminOnly: true,
    scope: 'platform',
    section: 'configuration'
  },
  {
    title: 'Roles & Permissions',
    href: '/platform/roles',
    icon: 'shield' as IconType,
    label: 'rolesPermissions',
    roles: ['PLATFORM_OWNER', 'ADMIN'],
    adminOnly: true,
    scope: 'platform',
    section: 'configuration'
  },
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: 'dashboard' as IconType,
    label: 'dashboard',
    scope: 'academy'
  },
  // Teaching — the daily work
  {
    title: 'Courses',
    href: '/courses',
    icon: 'course' as IconType,
    label: 'courses',
    roles: [
      'PLATFORM_OWNER',
      'ADMIN',
      'FINANCE',
      'SUPPORT',
      'MANAGER',
      'TEACHER'
    ],
    scope: 'academy',
    section: 'learning'
  },
  {
    title: 'Assignments',
    href: '/assignments',
    icon: 'bookOpen' as IconType,
    label: 'assignments',
    roles: [
      'PLATFORM_OWNER',
      'ADMIN',
      'FINANCE',
      'SUPPORT',
      'MANAGER',
      'TEACHER'
    ],
    scope: 'academy',
    section: 'learning',
    requiresLearningCapability: 'assignments'
  },
  {
    title: 'Tutoring',
    href: '/tutoring',
    icon: 'userPlus' as IconType,
    label: 'tutoring',
    roles: [
      'PLATFORM_OWNER',
      'ADMIN',
      'FINANCE',
      'SUPPORT',
      'MANAGER',
      'TEACHER'
    ],
    scope: 'academy',
    section: 'learning',
    requiresLearningCapability: 'tutoring'
  },
  {
    title: 'Ops Queue',
    href: '/learning/ops-queue',
    icon: 'trendingUp' as IconType,
    label: 'opsQueue',
    roles: [
      'PLATFORM_OWNER',
      'ADMIN',
      'FINANCE',
      'SUPPORT',
      'MANAGER',
      'TEACHER'
    ],
    scope: 'academy',
    section: 'learning',
    requiresLearningCapability: 'ops_queue'
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
    scope: 'academy',
    section: 'people',
    children: [
      {
        title: 'Users',
        href: '/users',
        label: 'users-list'
      },
      {
        title: 'Groups',
        href: '/users?tab=groups',
        label: 'groups'
      },
      {
        title: 'Requests',
        href: '/users?tab=requests',
        label: 'requests'
      }
    ]
  },
  // One destination for the public site: appearance, pages, SEO, trust, domain.
  {
    title: 'Website',
    href: '/website',
    icon: 'layout' as IconType,
    label: 'academyWebsite',
    roles: ['PLATFORM_OWNER', 'ADMIN', 'MANAGER'],
    scope: 'academy',
    section: 'website'
  },
  // Money
  {
    title: 'Financial',
    href: '/financial',
    icon: 'dollarSign' as IconType,
    label: 'financial',
    roles: ['PLATFORM_OWNER', 'ADMIN', 'FINANCE', 'MANAGER'],
    scope: 'academy',
    section: 'finance'
  },
  {
    title: 'Discounts',
    href: '/coupons',
    icon: 'percent' as IconType,
    label: 'discounts',
    roles: ['PLATFORM_OWNER', 'ADMIN', 'MANAGER'],
    scope: 'academy',
    section: 'finance'
  },
  {
    title: 'Student Plans',
    href: '/plans?tab=academy',
    icon: 'layers' as IconType,
    label: 'studentPlans',
    roles: ['PLATFORM_OWNER', 'ADMIN', 'MANAGER'],
    scope: 'academy',
    section: 'finance',
    paymentGated: true
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: 'barChart' as IconType,
    label: 'analytics',
    roles: ['PLATFORM_OWNER', 'ADMIN', 'MANAGER'],
    scope: 'academy',
    section: 'insights'
  },
  {
    title: 'Marketing',
    href: '/affiliates',
    icon: 'network' as IconType,
    label: 'affiliates',
    roles: ['PLATFORM_OWNER', 'ADMIN', 'MANAGER'],
    scope: 'academy',
    section: 'growth'
  },
  // The owner's own account, not the academy's day-to-day
  {
    title: 'My Academies',
    href: '/academies',
    icon: 'store' as IconType,
    label: 'myAcademies',
    roles: ['MANAGER', 'TEACHER'],
    scope: 'academy',
    section: 'account'
  },
  {
    title: 'Academy Subscription',
    href: '/plans',
    icon: 'billing' as IconType,
    label: 'platformPlan',
    roles: ['PLATFORM_OWNER', 'ADMIN', 'MANAGER', 'TEACHER'],
    scope: 'academy',
    section: 'account',
    paymentGated: true
  },
  {
    title: 'Roles & Permissions',
    href: '/platform/roles',
    icon: 'shield' as IconType,
    label: 'rolesPermissions',
    roles: ['MANAGER'],
    scope: 'academy',
    section: 'account'
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: 'settings' as IconType,
    label: 'settingsHub',
    roles: ['PLATFORM_OWNER', 'ADMIN', 'MANAGER', 'TEACHER'],
    scope: 'academy',
    section: 'account'
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
