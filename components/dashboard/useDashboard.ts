import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Users, GraduationCap, TrendingUp } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Course, Enrollment } from '@/types/api';
import { formatNumber } from '@/lib/utils';
import { useStore } from '@/hooks/useStore';
import { useTranslation } from '@/lib/i18n/hooks';
import { useAuthUser } from '@/hooks/useAuthUser';
import {
  bucketCount,
  completionRate,
  countBetween,
  enrollmentsBetween,
  journeySteps,
  percentChange,
  statusSegments,
} from './dashboard-metrics';
import { periodWindow, type DashboardPeriod } from './dashboard-periods';

/** `GET /enrollments` silently clamps its page to 100 rows, so asking for one
    wide page loses every enrolment past the hundredth. Page through instead:
    rows arrive newest first, so this covers the dashboard's longest window. */
const ENROLLMENTS_PAGE_SIZE = 100;
const ENROLLMENTS_MAX_PAGES = 5;

const fetchEnrollmentWindow = async (academyId: string | null): Promise<Enrollment[]> => {
  const collected: Enrollment[] = [];

  for (let page = 1; page <= ENROLLMENTS_MAX_PAGES; page += 1) {
    const payload = await apiClient.getEnrollments({
      page,
      limit: ENROLLMENTS_PAGE_SIZE,
      ...(academyId ? { academy_id: academyId } : {}),
    });
    const rows = Array.isArray(payload?.enrollments) ? payload.enrollments : [];
    collected.push(...rows);
    if (rows.length < ENROLLMENTS_PAGE_SIZE) break;
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
  /** Real per-bucket series for the selected period, drawn as the sparkline. */
  trend: number[];
};

const useDashboard = (period: DashboardPeriod = '30d', periodLabel: string = '') => {
  const { t, language } = useTranslation();
  const { selectedAcademy: currentAcademy, isLoading: storeLoading } = useStore();
  const { user } = useAuthUser();
  const [recentCourses, setRecentCourses] = useState<Course[]>([]);
  /** A wide enrolment window; the recent list is only 10 rows and cannot
      support the weekday, status or period breakdowns. */
  const [analyticsEnrollments, setAnalyticsEnrollments] = useState<Enrollment[]>([]);
  const [statsTotals, setStatsTotals] = useState({
    totalCourses: 0,
    totalStudents: 0,
    activeEnrollments: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is platform-level admin (AdminProfile)
  const isAdminWithoutStore = useMemo(() => {
    if (!user || user.role !== 'ADMIN') return false;

    // Use explicit flags from API (preferred)
    const isAdminProfile = user.isAdminProfile ?? user.profile?.isAdminProfile ?? false;
    const platformLevel = user.platformLevel ?? user.profile?.platformLevel ?? false;

    if (isAdminProfile || platformLevel) {
      return true; // Platform-level admin
    }

    // Fallback: Check academyId
    const userStoreId =
      user.academyId ?? user.profile?.academyId ?? user.profile?.academy_id ?? null;
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
                academy_id: effectiveAcademyId,
              }
            : { status: 'ACTIVE' as const, page: 1, limit: 1 };

        const studentsParams = isAdminWithoutStore
          ? { page: 1, limit: 1, filter: 'none' as const }
          : effectiveAcademyId
            ? { page: 1, limit: 1, academy_id: effectiveAcademyId }
            : { page: 1, limit: 1 };

        const [
          coursesResult,
          activeEnrollmentsResult,
          studentsResult,
          analyticsEnrollmentsResult,
          overviewResult,
        ] = await Promise.allSettled([
          apiClient.getCourses(coursesParams),
          apiClient.getEnrollments(enrollmentsParams),
          apiClient.getStudentUsers(studentsParams),
          fetchEnrollmentWindow(effectiveAcademyId),
          apiClient.getAnalyticsOverview(),
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
            totalCourses: coursesTotal ?? 0,
          }));
        } else {
          setRecentCourses([]);
          setStatsTotals((prev) => ({ ...prev, totalCourses: 0 }));
        }

        // Active enrollments total
        if (activeEnrollmentsResult.status === 'fulfilled') {
          const activePayload =
            (activeEnrollmentsResult.value as any)?.data ?? activeEnrollmentsResult.value;
          const activeTotal =
            activePayload?.pagination?.total ??
            activePayload?.data?.pagination?.total ??
            activePayload?.meta?.total ??
            (Array.isArray(activePayload?.enrollments) ? activePayload.enrollments.length : 0);

          setStatsTotals((prev) => ({
            ...prev,
            activeEnrollments: activeTotal ?? 0,
          }));
        } else {
          setStatsTotals((prev) => ({ ...prev, activeEnrollments: 0 }));
        }

        // Total students (via student users pagination)
        if (studentsResult.status === 'fulfilled') {
          const studentsPayload = (studentsResult.value as any)?.data ?? studentsResult.value;
          const studentTotal =
            studentsPayload?.pagination?.total ??
            studentsPayload?.data?.pagination?.total ??
            (Array.isArray(studentsPayload?.users) ? studentsPayload.users.length : 0);

          setStatsTotals((prev) => ({
            ...prev,
            totalStudents: studentTotal ?? 0,
          }));
        } else {
          setStatsTotals((prev) => ({ ...prev, totalStudents: 0 }));
        }

        // Wide enrolment window for the breakdown charts
        if (analyticsEnrollmentsResult.status === 'fulfilled') {
          setAnalyticsEnrollments(analyticsEnrollmentsResult.value);
        } else {
          setAnalyticsEnrollments([]);
        }

        // Server totals win over paginated list counts — those lists cap
        // and under-report once an academy grows past a page.
        if (overviewResult.status === 'fulfilled' && overviewResult.value) {
          const overview = overviewResult.value;
          setStatsTotals((prev) => ({
            ...prev,
            totalCourses: overview.totalCourses ?? prev.totalCourses,
            totalStudents: overview.totalStudents ?? prev.totalStudents,
            activeEnrollments: overview.activeEnrollments ?? prev.activeEnrollments,
          }));
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

  const range = useMemo(() => periodWindow(period), [period]);

  // Everything below is scoped to the selected period, so the page's "last N"
  // headline and the numbers under it describe the same span of time.
  const periodEnrollments = useMemo(
    () => enrollmentsBetween(analyticsEnrollments, range.start, range.end),
    [analyticsEnrollments, range],
  );

  const enrollmentSeries = useMemo(
    () =>
      bucketCount(
        periodEnrollments.map((e) => e.enrolled_at),
        range.buckets,
        range.end,
      ),
    [periodEnrollments, range],
  );

  const courseSeries = useMemo(
    () =>
      bucketCount(
        recentCourses.map((c) => c.created_at),
        range.buckets,
        range.end,
      ),
    [recentCourses, range],
  );

  const statusData = useMemo(() => statusSegments(periodEnrollments), [periodEnrollments]);

  const overallCompletion = useMemo(() => completionRate(periodEnrollments), [periodEnrollments]);

  // The funnel keeps every known student at its top and narrows to what
  // happened in the period, so it reads "of all students, this many acted".
  const journeyData = useMemo(
    () => journeySteps(periodEnrollments, statsTotals.totalStudents),
    [periodEnrollments, statsTotals.totalStudents],
  );

  const previousEnrollments = useMemo(
    () => enrollmentsBetween(analyticsEnrollments, range.previousStart, range.start),
    [analyticsEnrollments, range],
  );

  const courseDates = useMemo(() => recentCourses.map((c) => c.created_at), [recentCourses]);

  const statsCards: DashboardStatsCard[] = useMemo(() => {
    // A card shows its real move against the previous window of equal length,
    // or the "live" label when that window has no base — never a made-up number.
    const delta = (current: number, previous: number) => {
      const change = percentChange(current, previous);
      return change === null
        ? { change: t('dashboard.live'), changeType: 'increase' as const }
        : {
            change: `${change > 0 ? '+' : ''}${formatNumber(change, language)}%`,
            changeType: (change < 0 ? 'decrease' : 'increase') as 'increase' | 'decrease',
          };
    };

    const activeInPeriod = periodEnrollments.filter((e) => e.status === 'ACTIVE').length;

    // Cards 1 and 2 are stock counters: a total has no window, so the value
    // stays all-time and only its move and sparkline follow the period.
    return [
      {
        title: t('dashboard.cards.courses'),
        value: formatNumber(statsTotals.totalCourses, language),
        icon: BookOpen,
        ...delta(
          countBetween(courseDates, range.start, range.end),
          countBetween(courseDates, range.previousStart, range.start),
        ),
        description: isAdminWithoutStore
          ? t('dashboard.allPlatformCourses')
          : t('dashboard.cards.coursesHint'),
        trend: courseSeries,
      },
      {
        title: t('dashboard.cards.students'),
        value: formatNumber(statsTotals.totalStudents, language),
        icon: Users,
        ...delta(periodEnrollments.length, previousEnrollments.length),
        description: isAdminWithoutStore
          ? t('dashboard.allPlatformStudents')
          : t('dashboard.cards.studentsHint'),
        trend: enrollmentSeries,
      },
      {
        title: t('dashboard.cards.completion'),
        value: t('common.percentValue', {
          value: formatNumber(overallCompletion, language),
        }),
        icon: GraduationCap,
        ...delta(overallCompletion, completionRate(previousEnrollments)),
        description: t('dashboard.cards.completionHint', {
          period: periodLabel,
        }),
        trend: enrollmentSeries,
      },
      {
        title: t('dashboard.cards.active'),
        value: formatNumber(activeInPeriod, language),
        icon: TrendingUp,
        ...delta(activeInPeriod, previousEnrollments.filter((e) => e.status === 'ACTIVE').length),
        description: t('dashboard.cards.activeHint', {
          period: periodLabel,
        }),
        trend: enrollmentSeries,
      },
    ];
  }, [
    statsTotals,
    isAdminWithoutStore,
    t,
    language,
    periodLabel,
    range,
    courseDates,
    periodEnrollments,
    previousEnrollments,
    overallCompletion,
    courseSeries,
    enrollmentSeries,
  ]);

  const safeRecentCourses = Array.isArray(recentCourses) ? recentCourses : [];
  return {
    isLoading,
    recentCourses: safeRecentCourses,
    statsCards,
    statsTotals,
    statusData,
    overallCompletion,
    journeyData,
  };
};

export default useDashboard;
