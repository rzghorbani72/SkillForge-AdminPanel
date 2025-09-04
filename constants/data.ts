import { IconType } from '@/components/icons';
import { NavItem } from '@/types';

export type User = {
  id: number;
  name: string;
  company: string;
  role: string;
  verified: boolean;
  status: string;
};

export const users: User[] = [
  {
    id: 1,
    name: 'Candice Schiner',
    company: 'Dell',
    role: 'Frontend Developer',
    verified: false,
    status: 'Active'
  },
  {
    id: 2,
    name: 'John Doe',
    company: 'TechCorp',
    role: 'Backend Developer',
    verified: true,
    status: 'Active'
  },
  {
    id: 3,
    name: 'Alice Johnson',
    company: 'WebTech',
    role: 'UI Designer',
    verified: true,
    status: 'Active'
  },
  {
    id: 4,
    name: 'David Smith',
    company: 'Innovate Inc.',
    role: 'Fullstack Developer',
    verified: false,
    status: 'Inactive'
  },
  {
    id: 5,
    name: 'Emma Wilson',
    company: 'TechGuru',
    role: 'Product Manager',
    verified: true,
    status: 'Active'
  },
  {
    id: 6,
    name: 'James Brown',
    company: 'CodeGenius',
    role: 'QA Engineer',
    verified: false,
    status: 'Active'
  },
  {
    id: 7,
    name: 'Laura White',
    company: 'SoftWorks',
    role: 'UX Designer',
    verified: true,
    status: 'Active'
  },
  {
    id: 8,
    name: 'Michael Lee',
    company: 'DevCraft',
    role: 'DevOps Engineer',
    verified: false,
    status: 'Active'
  },
  {
    id: 9,
    name: 'Olivia Green',
    company: 'WebSolutions',
    role: 'Frontend Developer',
    verified: true,
    status: 'Active'
  },
  {
    id: 10,
    name: 'Robert Taylor',
    company: 'DataTech',
    role: 'Data Analyst',
    verified: false,
    status: 'Active'
  }
];

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
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: 'dashboard' as IconType,
    label: 'dashboard'
  },
  {
    title: 'My Schools',
    href: '/schools',
    icon: 'school' as IconType,
    label: 'schools',
    children: [
      {
        title: 'All Schools',
        href: '/schools',
        icon: 'list' as IconType,
        label: 'all-schools'
      },
      {
        title: 'Create School',
        href: '/schools/create',
        icon: 'plus' as IconType,
        label: 'create-school'
      },
      {
        title: 'School Settings',
        href: '/schools/settings',
        icon: 'settings' as IconType,
        label: 'school-settings'
      }
    ]
  },

  {
    title: 'Courses',
    href: '/courses',
    icon: 'fileText' as IconType,
    label: 'courses'
  },
  {
    title: 'Users',
    href: '/users',
    icon: 'users' as IconType,
    label: 'users',
    children: [
      {
        title: 'All Users',
        href: '/users',
        icon: 'list' as IconType,
        label: 'all-users'
      },
      {
        title: 'Students',
        href: '/users?role=STUDENT',
        icon: 'user' as IconType,
        label: 'students'
      },
      {
        title: 'Teachers',
        href: '/users?role=TEACHER',
        icon: 'graduationCap' as IconType,
        label: 'teachers'
      },
      {
        title: 'Managers',
        href: '/users?role=MANAGER',
        icon: 'shield' as IconType,
        label: 'managers'
      },
      {
        title: 'Teacher Requests',
        href: '/teacher-requests',
        icon: 'graduationCap' as IconType,
        label: 'teacher-requests'
      }
    ]
  },
  {
    title: 'Categories',
    href: '/categories',
    icon: 'folder' as IconType,
    label: 'categories',
    children: [
      {
        title: 'All Categories',
        href: '/categories',
        icon: 'list' as IconType,
        label: 'all-categories'
      },
      {
        title: 'Course Categories',
        href: '/categories?type=COURSE',
        icon: 'bookOpen' as IconType,
        label: 'course-categories'
      },
      {
        title: 'Content Categories',
        href: '/categories?type=ARTICLE',
        icon: 'fileText' as IconType,
        label: 'content-categories'
      }
    ]
  },
  {
    title: 'Students',
    href: '/students',
    icon: 'users' as IconType,
    label: 'students',
    children: [
      {
        title: 'All Students',
        href: '/students',
        icon: 'list' as IconType,
        label: 'all-students'
      },
      {
        title: 'Enrollments',
        href: '/students/enrollments',
        icon: 'graduationCap' as IconType,
        label: 'enrollments'
      },
      {
        title: 'Progress Tracking',
        href: '/students/progress',
        icon: 'trendingUp' as IconType,
        label: 'progress-tracking'
      }
    ]
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: 'barChart' as IconType,
    label: 'analytics',
    children: [
      {
        title: 'Overview',
        href: '/analytics',
        icon: 'dashboard' as IconType,
        label: 'analytics-overview'
      },
      {
        title: 'Revenue',
        href: '/analytics/revenue',
        icon: 'dollarSign' as IconType,
        label: 'revenue-analytics'
      },
      {
        title: 'Course Performance',
        href: '/analytics/courses',
        icon: 'trendingUp' as IconType,
        label: 'course-performance'
      },
      {
        title: 'Student Engagement',
        href: '/analytics/engagement',
        icon: 'users' as IconType,
        label: 'student-engagement'
      }
    ]
  },
  {
    title: 'Payments',
    href: '/payments',
    icon: 'creditCard' as IconType,
    label: 'payments',
    children: [
      {
        title: 'Transactions',
        href: '/payments/transactions',
        icon: 'list' as IconType,
        label: 'transactions'
      },
      {
        title: 'Payment Methods',
        href: '/payments/methods',
        icon: 'creditCard' as IconType,
        label: 'payment-methods'
      },
      {
        title: 'Invoices',
        href: '/payments/invoices',
        icon: 'fileText' as IconType,
        label: 'invoices'
      }
    ]
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: 'settings' as IconType,
    label: 'settings',
    children: [
      {
        title: 'Profile',
        href: '/settings/profile',
        icon: 'user' as IconType,
        label: 'profile-settings'
      },
      {
        title: 'School Settings',
        href: '/settings/school',
        icon: 'school' as IconType,
        label: 'school-settings'
      },
      {
        title: 'Theme & Branding',
        href: '/settings/theme',
        icon: 'palette' as IconType,
        label: 'theme-settings'
      },
      {
        title: 'Security',
        href: '/settings/security',
        icon: 'shield' as IconType,
        label: 'security-settings'
      }
    ]
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
