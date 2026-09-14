export interface AnalyticsPaymentDetail {
  id: string;
  amount: number;
  /** The gateway's own Rial figure; null when no gateway has confirmed one. */
  bank_amount: number | null;
  currency: string;
  status: string;
  paid_at: string | null;
  created_at: string;
  gateway: string | null;
  provider: string | null;
  payment_method: string;
  bank_ref: string | null;
  course_title: string | null;
}

export interface AnalyticsTrendPoint {
  period: string;
  revenue: number;
  enrollments: number;
  active: number;
  completed: number;
}

export interface AnalyticsOverview {
  totalEnrollments: number;
  activeEnrollments: number;
  cancelledEnrollments: number;
  completedEnrollments: number;
  totalRevenue: number;
  totalTransactions: number;
  totalRefunds: number;
  totalCourses: number;
  totalStudents: number;
  completionRate: number;
  averageProgress: number;
  laggingEnrollments: number;
  revenueTrend: AnalyticsTrendPoint[];
  topCourses: Array<{ name: string; students: number }>;
  recentPayments: AnalyticsPaymentDetail[];
}

export interface AnalyticsRevenue {
  totalRevenue: number;
  totalTransactions: number;
  totalRefunds: number;
  revenueByMethod: Array<{ method: string; revenue: number; count: number }>;
  revenueByCourse: Array<{ name: string; amount: number; count: number }>;
  recentPayments: AnalyticsPaymentDetail[];
  revenueTrend: Array<{
    period: string;
    revenue: number;
    transactions: number;
  }>;
}

export interface AnalyticsCourseRow {
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  completionRate: number;
  totalRevenue: number;
  averageProgress: number;
  averageRating: number;
  reviewCount: number;
}

export interface AnalyticsCourses {
  courses: AnalyticsCourseRow[];
  totalCourses: number;
}

export const EMPTY_OVERVIEW: AnalyticsOverview = {
  totalEnrollments: 0,
  activeEnrollments: 0,
  cancelledEnrollments: 0,
  completedEnrollments: 0,
  totalRevenue: 0,
  totalTransactions: 0,
  totalRefunds: 0,
  totalCourses: 0,
  totalStudents: 0,
  completionRate: 0,
  averageProgress: 0,
  laggingEnrollments: 0,
  revenueTrend: [],
  topCourses: [],
  recentPayments: [],
};

export const EMPTY_REVENUE: AnalyticsRevenue = {
  totalRevenue: 0,
  totalTransactions: 0,
  totalRefunds: 0,
  revenueByMethod: [],
  revenueByCourse: [],
  recentPayments: [],
  revenueTrend: [],
};

export const EMPTY_COURSES: AnalyticsCourses = {
  courses: [],
  totalCourses: 0,
};
