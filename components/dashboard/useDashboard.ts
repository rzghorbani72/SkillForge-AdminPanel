import { useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/lib/api';
import { Course, Enrollment, Payment } from '@/types/api';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { recentActivity } from '@/constants/data';

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
  const [statsTotals, setStatsTotals] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    activeEnrollments: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        const [
          coursesResult,
          enrollmentsResult,
          paymentsResult,
          activeEnrollmentsResult,
          studentsResult
        ] = await Promise.allSettled([
          apiClient.getCourses({ page: 1, limit: 5 }),
          apiClient.getRecentEnrollments(),
          apiClient.getPayments(),
          apiClient.getEnrollments({ status: 'ACTIVE', page: 1, limit: 1 }),
          apiClient.getStudentUsers({ page: 1, limit: 1 })
        ]);

        // Courses list & total
        if (coursesResult.status === 'fulfilled') {
          const coursesPayload = coursesResult.value as any;
          const coursesList: Course[] = Array.isArray(coursesPayload?.courses)
            ? coursesPayload.courses
            : Array.isArray(coursesPayload)
              ? coursesPayload
              : [];
          const coursesTotal =
            coursesPayload?.pagination?.total ??
            coursesPayload?.data?.pagination?.total ??
            coursesList.length;
          setRecentCourses(coursesList);
          setStatsTotals((prev) => ({
            ...prev,
            totalCourses: coursesTotal ?? 0
          }));
        } else {
          setRecentCourses([]);
          setStatsTotals((prev) => ({ ...prev, totalCourses: 0 }));
        }

        // Recent enrollments
        if (enrollmentsResult.status === 'fulfilled') {
          let recentEnrollmentsData: Enrollment[] = [];
          const enrollmentsPayload =
            (enrollmentsResult.value as any)?.data ?? enrollmentsResult.value;
          if (Array.isArray(enrollmentsPayload)) {
            recentEnrollmentsData = enrollmentsPayload as Enrollment[];
          } else if (Array.isArray(enrollmentsPayload?.data)) {
            recentEnrollmentsData = enrollmentsPayload.data as Enrollment[];
          }
          setRecentEnrollments(recentEnrollmentsData);
        } else {
          setRecentEnrollments([]);
        }

        // Payments & totals
        if (paymentsResult.status === 'fulfilled') {
          let paymentsData: Payment[] = [];
          const paymentsPayload =
            (paymentsResult.value as any)?.data ?? paymentsResult.value;
          if (Array.isArray(paymentsPayload)) {
            paymentsData = paymentsPayload as Payment[];
          }
          const sortedPayments = paymentsData.slice().sort((a, b) => {
            const aDate = a.payment_date
              ? new Date(a.payment_date).getTime()
              : 0;
            const bDate = b.payment_date
              ? new Date(b.payment_date).getTime()
              : 0;
            return bDate - aDate;
          });
          setRecentPayments(sortedPayments.slice(0, 5));

          const totalRevenue = paymentsData
            .filter((payment) => payment.status === 'COMPLETED')
            .reduce((sum, payment) => sum + (payment.amount ?? 0), 0);

          setStatsTotals((prev) => ({
            ...prev,
            totalRevenue
          }));
        } else {
          setRecentPayments([]);
          setStatsTotals((prev) => ({ ...prev, totalRevenue: 0 }));
        }

        // Active enrollments total
        if (activeEnrollmentsResult.status === 'fulfilled') {
          const activePayload =
            (activeEnrollmentsResult.value as any)?.data ??
            activeEnrollmentsResult.value;
          const activeTotal =
            activePayload?.pagination?.total ??
            activePayload?.data?.pagination?.total ??
            activePayload?.meta?.total ??
            (Array.isArray(activePayload?.enrollments)
              ? activePayload.enrollments.length
              : 0);

          setStatsTotals((prev) => ({
            ...prev,
            activeEnrollments: activeTotal ?? 0
          }));
        } else {
          setStatsTotals((prev) => ({ ...prev, activeEnrollments: 0 }));
        }

        // Total students (via student users pagination)
        if (studentsResult.status === 'fulfilled') {
          const studentsPayload =
            (studentsResult.value as any)?.data ?? studentsResult.value;
          const studentTotal =
            studentsPayload?.pagination?.total ??
            studentsPayload?.data?.pagination?.total ??
            (Array.isArray(studentsPayload?.users)
              ? studentsPayload.users.length
              : 0);

          setStatsTotals((prev) => ({
            ...prev,
            totalStudents: studentTotal ?? 0
          }));
        } else {
          setStatsTotals((prev) => ({ ...prev, totalStudents: 0 }));
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
        value: formatNumber(statsTotals.totalCourses),
        icon: require('lucide-react').BookOpen,
        change: 'Live',
        changeType: 'increase',
        description: 'Courses across your schools'
      },
      {
        title: 'Total Students',
        value: formatNumber(statsTotals.totalStudents),
        icon: require('lucide-react').Users,
        change: 'Live',
        changeType: 'increase',
        description: 'Students enrolled across schools'
      },
      {
        title: 'Total Revenue',
        value: formatCurrency(statsTotals.totalRevenue),
        icon: require('lucide-react').DollarSign,
        change: 'Live',
        changeType: 'increase',
        description: 'Completed payments to date'
      },
      {
        title: 'Active Enrollments',
        value: formatNumber(statsTotals.activeEnrollments),
        icon: require('lucide-react').TrendingUp,
        change: 'Live',
        changeType: 'increase',
        description: 'Students currently progressing'
      }
    ],
    [statsTotals]
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
