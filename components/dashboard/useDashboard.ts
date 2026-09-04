import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Users, DollarSign, TrendingUp } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Course, Enrollment, Payment } from '@/types/api';
import {
  formatNumber,
  formatCurrencyWithStore,
  formatRelativeTime
} from '@/lib/utils';
import { useStore } from '@/hooks/useStore';
import { useTranslation } from '@/lib/i18n/hooks';
import { useAuthUser } from '@/hooks/useAuthUser';
import {
  bucketByWeekday,
  completionRate,
  journeySteps,
  lastMonths,
  monthOverMonth,
  monthlyCount,
  monthlyRevenue,
  statusSegments
} from './dashboard-metrics';

/** A settled payment. The API's PaymentStatus enum spells this `PAID`. */
const isSettledPayment = (status?: string | null) => status === 'PAID';

/**
 * `GET /payments` answers `{ data: { payments: [...] } }`, and apiClient already
 * unwraps one level. Reading `.data` again therefore yielded undefined, the
 * array check failed, and every revenue figure on the dashboard read zero.
 */
const readPaymentsList = (payload: unknown): Payment[] => {
  if (Array.isArray(payload)) return payload as Payment[];
  const nested = (payload as { payments?: unknown } | null)?.payments;
  if (Array.isArray(nested)) return nested as Payment[];
  const inner = (payload as { data?: unknown } | null)?.data;
  if (Array.isArray(inner)) return inner as Payment[];
  const innerNested = (inner as { payments?: unknown } | null)?.payments;
  return Array.isArray(innerNested) ? (innerNested as Payment[]) : [];
};

/** The API dates a settled payment with `paid_at`; `payment_date` is legacy. */
const paymentDateOf = (payment: {
  paid_at?: string | null;
  payment_date?: string | null;
  created_at?: string | null;
}) => payment.paid_at ?? payment.payment_date ?? payment.created_at ?? null;

/** `GET /payments` caps a page at 100 rows and defaults to 20, so a single
    request under-reports the revenue of any academy past its first sales.
    Page until the API runs out, bounded so a busy academy cannot turn one
    dashboard load into an unbounded request storm. */
const PAYMENTS_PAGE_SIZE = 100;
const PAYMENTS_MAX_PAGES = 10;

const fetchSettledPayments = async (): Promise<Payment[]> => {
  const collected: Payment[] = [];

  for (let page = 1; page <= PAYMENTS_MAX_PAGES; page += 1) {
    const payload = await apiClient.getPayments({
      page,
      limit: PAYMENTS_PAGE_SIZE,
      status: 'PAID'
    });
    const rows = readPaymentsList(payload);
    collected.push(...rows);
    if (rows.length < PAYMENTS_PAGE_SIZE) break;
  }

  return collected;
};

export type DashboardStatsCard = {
  title: string;
  value: string | number;
  icon: React.ElementType;
  change: string;
  changeType: 'increase' | 'decrease';
  description: string;
  /** Real six-month series behind the number, drawn as the card sparkline. */
  trend: number[];
};

export type ChartDataPoint = {
  month: string;
  revenue: number;
  enrollments: number;
  courses: number;
};

export type CoursePerformance = {
  name: string;
  students: number;
  revenue: number;
  completionRate: number;
};

const useDashboard = () => {
  const { t, language } = useTranslation();
  const { selectedAcademy: currentAcademy, isLoading: storeLoading } =
    useStore();
  const { user } = useAuthUser();
  const [recentCourses, setRecentCourses] = useState<Course[]>([]);
  const [recentEnrollments, setRecentEnrollments] = useState<Enrollment[]>([]);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [allPayments, setAllPayments] = useState<Payment[]>([]);
  /** A wide enrolment window; the recent list is only 10 rows and cannot
      support the weekday, status or six-month breakdowns. */
  const [analyticsEnrollments, setAnalyticsEnrollments] = useState<
    Enrollment[]
  >([]);
  const [statsTotals, setStatsTotals] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    activeEnrollments: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is platform-level admin (AdminProfile)
  const isAdminWithoutStore = useMemo(() => {
    if (!user || user.role !== 'ADMIN') return false;

    // Use explicit flags from API (preferred)
    const isAdminProfile =
      user.isAdminProfile ?? user.profile?.isAdminProfile ?? false;
    const platformLevel =
      user.platformLevel ?? user.profile?.platformLevel ?? false;

    if (isAdminProfile || platformLevel) {
      return true; // Platform-level admin
    }

    // Fallback: Check academyId
    const userStoreId =
      user.academyId ??
      user.profile?.academyId ??
      user.profile?.academy_id ??
      null;
    return !userStoreId;
  }, [user]);

  // For admins without stores, don't use store context
  // For managers/admins with stores, use the selected store
  const effectiveAcademy = isAdminWithoutStore ? null : currentAcademy;
  // The academies list is re-fetched in the background, which hands back a new
  // academy object with the same id. Keying the fetch on the id keeps that
  // refresh from replaying all five dashboard requests.
  const effectiveAcademyId = effectiveAcademy?.id ?? null;
  const userId = user?.id ?? null;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        // For admins without stores, fetch platform-wide data (no store filter)
        // For managers/admins with stores, fetch store-specific data
        // A 10-row page cannot rank "top courses" or plot course growth for an
        // academy with a real catalogue, so the dashboard reads a wider window.
        const coursesParams = isAdminWithoutStore
          ? { page: 1, limit: 50, filter: 'none' as const } // Platform-wide for admins
          : effectiveAcademyId
            ? { page: 1, limit: 50, academy_id: effectiveAcademyId } // Store-specific for managers
            : { page: 1, limit: 50 }; // Default

        const enrollmentsParams = isAdminWithoutStore
          ? { status: 'ACTIVE' as const, page: 1, limit: 1 }
          : effectiveAcademyId
            ? {
                status: 'ACTIVE' as const,
                page: 1,
                limit: 1,
                academy_id: effectiveAcademyId
              }
            : { status: 'ACTIVE' as const, page: 1, limit: 1 };

        const studentsParams = isAdminWithoutStore
          ? { page: 1, limit: 1, filter: 'none' as const }
          : effectiveAcademyId
            ? { page: 1, limit: 1, academy_id: effectiveAcademyId }
            : { page: 1, limit: 1 };

        const [
          coursesResult,
          enrollmentsResult,
          paymentsResult,
          activeEnrollmentsResult,
          studentsResult,
          analyticsEnrollmentsResult
        ] = await Promise.allSettled([
          apiClient.getCourses(coursesParams),
          apiClient.getRecentEnrollments(),
          fetchSettledPayments(),
          apiClient.getEnrollments(enrollmentsParams),
          apiClient.getStudentUsers(studentsParams),
          apiClient.getEnrollments(
            effectiveAcademyId
              ? { page: 1, limit: 500, academy_id: effectiveAcademyId }
              : { page: 1, limit: 500 }
          )
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
          const paymentsData = paymentsResult.value;
          const sortedPayments = paymentsData.slice().sort((a, b) => {
            const aRaw = paymentDateOf(a);
            const bRaw = paymentDateOf(b);
            const aDate = aRaw ? new Date(aRaw).getTime() : 0;
            const bDate = bRaw ? new Date(bRaw).getTime() : 0;
            return bDate - aDate;
          });
          setRecentPayments(sortedPayments.slice(0, 5));
          setAllPayments(sortedPayments);

          const totalRevenue = paymentsData
            .filter((payment) => isSettledPayment(payment.status))
            .reduce((sum, payment) => sum + (payment.amount ?? 0), 0);

          setStatsTotals((prev) => ({
            ...prev,
            totalRevenue
          }));
        } else {
          setRecentPayments([]);
          setAllPayments([]);
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

        // Wide enrolment window for the breakdown charts
        if (analyticsEnrollmentsResult.status === 'fulfilled') {
          const payload = analyticsEnrollmentsResult.value;
          setAnalyticsEnrollments(
            Array.isArray(payload?.enrollments) ? payload.enrollments : []
          );
        } else {
          setAnalyticsEnrollments([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Without an academy the requests carry no X-Academy-ID header and the
    // backend rejects them all, so an academy-less user gets the empty state
    // straight away instead of five failed calls.
    if (!userId) return;
    if (!isAdminWithoutStore && !effectiveAcademyId) {
      // Still resolving which academy is selected — stay in the loading state
      // instead of flashing the empty dashboard for one render.
      if (!storeLoading) setIsLoading(false);
      return;
    }
    void fetchDashboardData();
  }, [userId, isAdminWithoutStore, effectiveAcademyId, storeLoading]);

  const months = useMemo(() => lastMonths(6), []);

  const revenueSeries = useMemo(
    () => monthlyRevenue(allPayments, months),
    [allPayments, months]
  );

  const enrollmentSeries = useMemo(
    () =>
      monthlyCount(
        analyticsEnrollments.map((e) => e.enrolled_at),
        months
      ),
    [analyticsEnrollments, months]
  );

  const courseSeries = useMemo(
    () =>
      monthlyCount(
        recentCourses.map((c) => c.created_at),
        months
      ),
    [recentCourses, months]
  );

  const monthlyChartData: ChartDataPoint[] = useMemo(
    () =>
      months.map((date, i) => ({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        revenue: revenueSeries[i],
        enrollments: enrollmentSeries[i],
        courses: courseSeries[i]
      })),
    [months, revenueSeries, enrollmentSeries, courseSeries]
  );

  const weekdayData = useMemo(
    () => bucketByWeekday(analyticsEnrollments),
    [analyticsEnrollments]
  );

  const statusData = useMemo(
    () => statusSegments(analyticsEnrollments),
    [analyticsEnrollments]
  );

  const overallCompletion = useMemo(
    () => completionRate(analyticsEnrollments),
    [analyticsEnrollments]
  );

  const journeyData = useMemo(
    () => journeySteps(analyticsEnrollments, statsTotals.totalStudents),
    [analyticsEnrollments, statsTotals.totalStudents]
  );

  // Course performance data
  const coursePerformanceData: CoursePerformance[] = useMemo(() => {
    const safeRecentCourses = Array.isArray(recentCourses) ? recentCourses : [];

    return safeRecentCourses.slice(0, 5).map((course) => ({
      name:
        course.title.length > 20
          ? course.title.substring(0, 20) + '...'
          : course.title,
      students: course.students_count ?? 0,
      revenue: course.revenue ?? course.price * (course.students_count ?? 0),
      completionRate: course.completion_rate ?? 0
    }));
  }, [recentCourses]);

  const statsCards: DashboardStatsCard[] = useMemo(() => {
    // A card shows a real month-over-month move, or the "live" label when the
    // previous month has no base to compare against — never a made-up number.
    const delta = (series: number[]) => {
      const change = monthOverMonth(series);
      return change === null
        ? { change: t('dashboard.live'), changeType: 'increase' as const }
        : {
            change: `${change > 0 ? '+' : ''}${formatNumber(change, language)}%`,
            changeType: (change < 0 ? 'decrease' : 'increase') as
              | 'increase'
              | 'decrease'
          };
    };

    return [
      {
        title: t('dashboard.totalCourses'),
        value: formatNumber(statsTotals.totalCourses, language),
        icon: BookOpen,
        ...delta(courseSeries),
        description: isAdminWithoutStore
          ? t('dashboard.allPlatformCourses')
          : t('dashboard.coursesAcrossStores'),
        trend: courseSeries
      },
      {
        title: t('dashboard.totalStudents'),
        value: formatNumber(statsTotals.totalStudents, language),
        icon: Users,
        ...delta(enrollmentSeries),
        description: isAdminWithoutStore
          ? t('dashboard.allPlatformStudents')
          : t('dashboard.studentsEnrolledAcrossStores'),
        trend: enrollmentSeries
      },
      {
        title: t('dashboard.totalRevenue'),
        value: formatCurrencyWithStore(
          statsTotals.totalRevenue,
          effectiveAcademy,
          undefined,
          language
        ),
        icon: DollarSign,
        ...delta(revenueSeries),
        description: isAdminWithoutStore
          ? t('dashboard.platformRevenue')
          : t('dashboard.completedPaymentsToDate'),
        trend: revenueSeries
      },
      {
        title: t('dashboard.activeEnrollments'),
        value: formatNumber(statsTotals.activeEnrollments, language),
        icon: TrendingUp,
        ...delta(enrollmentSeries),
        description: t('dashboard.studentsCurrentlyProgressing'),
        trend: enrollmentSeries
      }
    ];
  }, [
    statsTotals,
    effectiveAcademy,
    isAdminWithoutStore,
    t,
    language,
    courseSeries,
    enrollmentSeries,
    revenueSeries
  ]);

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
      .filter((payment) => isSettledPayment(payment.status))
      .slice(0, 3)
      .forEach((payment) => {
        const paidAt = paymentDateOf(payment);
        if (paidAt) {
          const userName = payment.user?.name || t('dashboard.unknownUser');
          const courseName =
            payment.course?.title || t('dashboard.unknownCourse');
          const amount = formatCurrencyWithStore(
            payment.amount ?? 0,
            effectiveAcademy,
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
            timestamp: paidAt,
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
    effectiveAcademy,
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
    statsTotals,
    monthlyChartData,
    coursePerformanceData,
    weekdayData,
    statusData,
    overallCompletion,
    journeyData
  };
};

export default useDashboard;
