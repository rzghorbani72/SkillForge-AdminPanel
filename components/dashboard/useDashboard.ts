import { useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/lib/api';
import { Course, Enrollment, Payment } from '@/types/api';
import {
  formatCurrency,
  formatNumber,
  formatCurrencyWithSchool,
  formatRelativeTime
} from '@/lib/utils';
import { useCurrentSchool } from '@/hooks/useCurrentSchool';
import { useTranslation } from '@/lib/i18n/hooks';

export type DashboardStatsCard = {
  title: string;
  value: string | number;
  icon: any;
  change: string;
  changeType: 'increase' | 'decrease';
  description: string;
};

const useDashboard = () => {
  const { t, language } = useTranslation();
  const school = useCurrentSchool();
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
        title: t('dashboard.totalCourses'),
        value: formatNumber(statsTotals.totalCourses),
        icon: require('lucide-react').BookOpen,
        change: t('dashboard.live'),
        changeType: 'increase',
        description: t('dashboard.coursesAcrossSchools')
      },
      {
        title: t('dashboard.totalStudents'),
        value: formatNumber(statsTotals.totalStudents),
        icon: require('lucide-react').Users,
        change: t('dashboard.live'),
        changeType: 'increase',
        description: t('dashboard.studentsEnrolledAcrossSchools')
      },
      {
        title: t('dashboard.totalRevenue'),
        value: formatCurrencyWithSchool(statsTotals.totalRevenue, school),
        icon: require('lucide-react').DollarSign,
        change: t('dashboard.live'),
        changeType: 'increase',
        description: t('dashboard.completedPaymentsToDate')
      },
      {
        title: t('dashboard.activeEnrollments'),
        value: formatNumber(statsTotals.activeEnrollments),
        icon: require('lucide-react').TrendingUp,
        change: t('dashboard.live'),
        changeType: 'increase',
        description: t('dashboard.studentsCurrentlyProgressing')
      }
    ],
    [statsTotals, school, t]
  );

  const safeRecentCourses = Array.isArray(recentCourses) ? recentCourses : [];
  const safeRecentEnrollments = Array.isArray(recentEnrollments)
    ? recentEnrollments
    : [];
  const safeRecentPayments = Array.isArray(recentPayments)
    ? recentPayments
    : [];

  // Generate real activity items from actual data
  const realActivity = useMemo(() => {
    const activities: any[] = [];

    // Generate activities from recent courses
    safeRecentCourses.slice(0, 3).forEach((course) => {
      if (course.created_at) {
        activities.push({
          id: `course-${course.id}`,
          type: 'course_created',
          title: t('dashboard.activityNewCourseCreated'),
          description: t('dashboard.activityCourseWasCreated').replace(
            /\{\{courseName\}\}/g,
            course.title
          ),
          timestamp: course.created_at,
          user:
            course.author?.user?.name ||
            course.author?.display_name ||
            t('dashboard.unknownUser')
        });
      }
    });

    // Generate activities from recent enrollments
    safeRecentEnrollments.slice(0, 3).forEach((enrollment) => {
      if (enrollment.enrolled_at) {
        const studentName = enrollment.user?.name || t('dashboard.unknownUser');
        const courseName =
          enrollment.course?.title || t('dashboard.unknownCourse');
        activities.push({
          id: `enrollment-${enrollment.id}`,
          type: 'student_enrolled',
          title: t('dashboard.activityNewStudentEnrolled'),
          description: t('dashboard.activityEnrolledIn')
            .replace(/\{\{studentName\}\}/g, studentName)
            .replace(/\{\{courseName\}\}/g, courseName),
          timestamp: enrollment.enrolled_at,
          user: studentName
        });
      }
    });

    // Generate activities from recent payments
    safeRecentPayments
      .filter((payment) => payment.status === 'COMPLETED')
      .slice(0, 3)
      .forEach((payment) => {
        if (payment.payment_date) {
          const userName = payment.user?.name || t('dashboard.unknownUser');
          const courseName =
            payment.course?.title || t('dashboard.unknownCourse');
          const amount = formatCurrencyWithSchool(
            payment.amount ?? 0,
            school,
            undefined,
            language
          );
          activities.push({
            id: `payment-${payment.id}`,
            type: 'payment_received',
            title: t('dashboard.activityPaymentReceived'),
            description: t('dashboard.activityPaymentFor')
              .replace(/\{\{amount\}\}/g, amount)
              .replace(/\{\{courseName\}\}/g, courseName),
            timestamp: payment.payment_date,
            user: userName
          });
        }
      });

    // Sort by timestamp (most recent first)
    return activities
      .sort((a, b) => {
        const dateA = new Date(a.timestamp).getTime();
        const dateB = new Date(b.timestamp).getTime();
        return dateB - dateA;
      })
      .slice(0, 10); // Limit to 10 most recent activities
  }, [
    safeRecentCourses,
    safeRecentEnrollments,
    safeRecentPayments,
    school,
    t,
    language
  ]);

  // Format activity timestamps with translations
  const formattedActivity = useMemo(() => {
    if (!Array.isArray(realActivity)) return [];

    return realActivity.map((activity: any) => {
      // Format timestamp - real activity always has ISO date strings
      let translatedTimestamp = activity.timestamp;
      if (activity.timestamp && typeof activity.timestamp === 'string') {
        // Format ISO date string as relative time
        translatedTimestamp = formatRelativeTime(activity.timestamp, t);
      }

      return {
        ...activity,
        timestamp: translatedTimestamp
      };
    });
  }, [realActivity, t]);

  return {
    isLoading,
    recentCourses: safeRecentCourses,
    recentEnrollments: safeRecentEnrollments,
    recentPayments: safeRecentPayments,
    recentActivity: formattedActivity,
    statsCards,
    statsTotals
  };
};

export default useDashboard;
