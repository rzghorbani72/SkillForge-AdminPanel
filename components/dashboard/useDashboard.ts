import { useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/lib/api';
import { Course, Enrollment, Payment } from '@/types/api';
import { dashboardStats, recentActivity } from '@/constants/data';
import { formatCurrency, formatNumber } from '@/lib/utils';

export type DashboardStatsCard = {
  title: string;
  value: string | number;
  icon: any;
  change: string;
  changeType: 'increase' | 'decrease';
  description: string;
};

const useDashboard = () => {
  const [recentCourses, setRecentCourses] = useState<Course[]>([]);
  const [recentEnrollments, setRecentEnrollments] = useState<Enrollment[]>([]);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        // Courses
        try {
          const coursesResponse = await apiClient.getCourses({ limit: 5 });
          let coursesData: Course[] = [];
          const responseData = (coursesResponse as any).data as any;
          if (responseData && Array.isArray(responseData))
            coursesData = responseData;
          else if (responseData?.data && Array.isArray(responseData.data))
            coursesData = responseData.data;
          else if (responseData?.courses && Array.isArray(responseData.courses))
            coursesData = responseData.courses;
          setRecentCourses(coursesData);
        } catch (e) {
          setRecentCourses([]);
        }

        // Enrollments
        try {
          const enrollmentsResponse = await apiClient.getRecentEnrollments();
          let enrollmentsData: Enrollment[] = [];
          const r = (enrollmentsResponse as any).data as any;
          if (Array.isArray(r)) enrollmentsData = r;
          else if (r?.data && Array.isArray(r.data)) enrollmentsData = r.data;
          setRecentEnrollments(enrollmentsData);
        } catch (e) {
          setRecentEnrollments([]);
        }

        // Payments
        try {
          const paymentsResponse = await apiClient.getRecentPayments();
          let paymentsData: Payment[] = [];
          const p = (paymentsResponse as any).data as any;
          if (Array.isArray(p)) paymentsData = p;
          else if (p?.data && Array.isArray(p.data)) paymentsData = p.data;
          setRecentPayments(paymentsData);
        } catch (e) {
          setRecentPayments([]);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const statsCards: DashboardStatsCard[] = useMemo(
    () => [
      {
        title: 'Total Courses',
        value: dashboardStats.totalCourses,
        icon: require('lucide-react').BookOpen,
        change: '+12%',
        changeType: 'increase',
        description: 'From last month'
      },
      {
        title: 'Total Students',
        value: formatNumber(dashboardStats.totalStudents),
        icon: require('lucide-react').Users,
        change: '+8%',
        changeType: 'increase',
        description: 'From last month'
      },
      {
        title: 'Total Revenue',
        value: formatCurrency(dashboardStats.totalRevenue),
        icon: require('lucide-react').DollarSign,
        change: '+23%',
        changeType: 'increase',
        description: 'From last month'
      },
      {
        title: 'Active Enrollments',
        value: dashboardStats.activeEnrollments,
        icon: require('lucide-react').TrendingUp,
        change: '+5%',
        changeType: 'increase',
        description: 'From last month'
      }
    ],
    []
  );

  const safeRecentCourses = Array.isArray(recentCourses) ? recentCourses : [];
  const safeRecentEnrollments = Array.isArray(recentEnrollments)
    ? recentEnrollments
    : [];
  const safeRecentPayments = Array.isArray(recentPayments)
    ? recentPayments
    : [];
  const safeRecentActivity = Array.isArray(recentActivity)
    ? recentActivity
    : [];

  return {
    isLoading,
    recentCourses: safeRecentCourses,
    recentEnrollments: safeRecentEnrollments,
    recentPayments: safeRecentPayments,
    recentActivity: safeRecentActivity,
    statsCards
  };
};

export default useDashboard;
