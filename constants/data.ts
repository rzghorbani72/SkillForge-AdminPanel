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

// 6-item sidebar per product spec. Role gating is applied in filterNavItemsByRole.
// - dashboard:  everyone
// - academies:  ADMIN / SUPPORT (platform oversight); MANAGER edits own via Settings
// - courses:    TEACHER and up
// - users:      TEACHER and up (TEACHER is scoped to own courses; MANAGER+ wider)
// - payments:   everyone (students see their own; staff see academy/platform)
// - settings:   everyone
export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: 'dashboard' as IconType,
    label: 'dashboard'
  },
  {
    title: 'Academies',
    href: '/academies',
    icon: 'store' as IconType,
    label: 'academies',
    roles: ['ADMIN', 'SUPPORT']
  },
  {
    title: 'Courses',
    href: '/courses',
    icon: 'course' as IconType,
    label: 'courses',
    roles: ['ADMIN', 'SUPPORT', 'MANAGER', 'TEACHER']
  },
  {
    title: 'Users',
    href: '/users',
    icon: 'users' as IconType,
    label: 'users',
    roles: ['ADMIN', 'SUPPORT', 'MANAGER', 'TEACHER']
  },
  {
    title: 'Bundles',
    href: '/bundles',
    icon: 'package' as IconType,
    label: 'bundles',
    roles: ['ADMIN', 'MANAGER']
  },
  {
    title: 'Payments',
    href: '/payments',
    icon: 'creditCard' as IconType,
    label: 'payments',
    roles: ['ADMIN', 'SUPPORT', 'MANAGER']
  },
  {
    title: 'Refunds',
    href: '/refunds',
    icon: 'rotateCcw' as IconType,
    label: 'refunds',
    roles: ['ADMIN', 'MANAGER']
  },
  {
    title: 'Financial',
    href: '/financial',
    icon: 'dollarSign' as IconType,
    label: 'financial',
    roles: ['ADMIN', 'SUPPORT', 'MANAGER']
  },
  {
    title: 'Withdrawals',
    href: '/withdrawals',
    icon: 'banknote' as IconType,
    label: 'withdrawals',
    roles: ['ADMIN'],
    adminOnly: true
  },
  {
    title: 'Teacher Payouts',
    href: '/teacher-payouts',
    icon: 'wallet2' as IconType,
    label: 'teacherPayouts',
    roles: ['ADMIN'],
    adminOnly: true
  },
  {
    title: 'Affiliates',
    href: '/affiliates',
    icon: 'network' as IconType,
    label: 'affiliates',
    roles: ['ADMIN', 'MANAGER']
  },
  {
    title: 'Coupons',
    href: '/coupons',
    icon: 'percent' as IconType,
    label: 'coupons',
    roles: ['ADMIN', 'MANAGER']
  },
  {
    title: 'Subscriptions',
    href: '/subscriptions',
    icon: 'calendarClock' as IconType,
    label: 'subscriptions',
    roles: ['ADMIN'],
    adminOnly: true
  },
  {
    title: 'Plans',
    href: '/plans',
    icon: 'layers' as IconType,
    label: 'plans',
    roles: ['ADMIN', 'MANAGER']
  },
  {
    title: 'Platform Settings',
    href: '/platform-settings',
    icon: 'settings' as IconType,
    label: 'platformSettings',
    roles: ['ADMIN'],
    adminOnly: true
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: 'settings' as IconType,
    label: 'settings'
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
