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
    icon: 'dashboard',
    label: 'dashboard'
  },
  {
    title: 'My Schools',
    href: '/schools',
    icon: 'school',
    label: 'schools',
    children: [
      {
        title: 'All Schools',
        href: '/schools',
        icon: 'list',
        label: 'all-schools'
      },
      {
        title: 'Create School',
        href: '/schools/create',
        icon: 'plus',
        label: 'create-school'
      },
      {
        title: 'School Settings',
        href: '/schools/settings',
        icon: 'settings',
        label: 'school-settings'
      }
    ]
  },
  {
    title: 'Courses',
    href: '/courses',
    icon: 'bookOpen',
    label: 'courses',
    children: [
      {
        title: 'All Courses',
        href: '/courses',
        icon: 'list',
        label: 'all-courses'
      },
      {
        title: 'Create Course',
        href: '/courses/create',
        icon: 'plus',
        label: 'create-course'
      },
      {
        title: 'Course Categories',
        href: '/courses/categories',
        icon: 'folder',
        label: 'course-categories'
      }
    ]
  },
  {
    title: 'Content',
    href: '/content',
    icon: 'fileText',
    label: 'content',
    children: [
      {
        title: 'Lessons',
        href: '/content/lessons',
        icon: 'play',
        label: 'lessons'
      },
      {
        title: 'Seasons',
        href: '/content/seasons',
        icon: 'layers',
        label: 'seasons'
      },
      {
        title: 'Media Library',
        href: '/content/media',
        icon: 'image',
        label: 'media-library'
      }
    ]
  },
  {
    title: 'Students',
    href: '/students',
    icon: 'users',
    label: 'students',
    children: [
      {
        title: 'All Students',
        href: '/students',
        icon: 'list',
        label: 'all-students'
      },
      {
        title: 'Enrollments',
        href: '/students/enrollments',
        icon: 'graduationCap',
        label: 'enrollments'
      },
      {
        title: 'Progress Tracking',
        href: '/students/progress',
        icon: 'trendingUp',
        label: 'progress-tracking'
      }
    ]
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: 'barChart',
    label: 'analytics',
    children: [
      {
        title: 'Overview',
        href: '/analytics',
        icon: 'dashboard',
        label: 'analytics-overview'
      },
      {
        title: 'Revenue',
        href: '/analytics/revenue',
        icon: 'dollarSign',
        label: 'revenue-analytics'
      },
      {
        title: 'Course Performance',
        href: '/analytics/courses',
        icon: 'trendingUp',
        label: 'course-performance'
      },
      {
        title: 'Student Engagement',
        href: '/analytics/engagement',
        icon: 'users',
        label: 'student-engagement'
      }
    ]
  },
  {
    title: 'Payments',
    href: '/payments',
    icon: 'creditCard',
    label: 'payments',
    children: [
      {
        title: 'Transactions',
        href: '/payments/transactions',
        icon: 'list',
        label: 'transactions'
      },
      {
        title: 'Payment Methods',
        href: '/payments/methods',
        icon: 'creditCard',
        label: 'payment-methods'
      },
      {
        title: 'Invoices',
        href: '/payments/invoices',
        icon: 'fileText',
        label: 'invoices'
      }
    ]
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: 'settings',
    label: 'settings',
    children: [
      {
        title: 'Profile',
        href: '/settings/profile',
        icon: 'user',
        label: 'profile-settings'
      },
      {
        title: 'School Settings',
        href: '/settings/school',
        icon: 'school',
        label: 'school-settings'
      },
      {
        title: 'Theme & Branding',
        href: '/settings/theme',
        icon: 'palette',
        label: 'theme-settings'
      },
      {
        title: 'Security',
        href: '/settings/security',
        icon: 'shield',
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
