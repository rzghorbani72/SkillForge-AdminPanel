'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import {
  EMPTY_COURSES,
  EMPTY_OVERVIEW,
  EMPTY_REVENUE,
  type AnalyticsCourses,
  type AnalyticsOverview,
  type AnalyticsRevenue
} from '@/types/analytics';

export interface AnalyticsSnapshots {
  overview: AnalyticsOverview;
  revenue: AnalyticsRevenue;
  courses: AnalyticsCourses;
  isLoading: boolean;
  refresh: () => void;
}

export function useAnalyticsData(options?: {
  revenue?: boolean;
}): AnalyticsSnapshots {
  const includeRevenue = options?.revenue === true;
  const [overview, setOverview] = useState<AnalyticsOverview>(EMPTY_OVERVIEW);
  const [revenue, setRevenue] = useState<AnalyticsRevenue>(EMPTY_REVENUE);
  const [courses, setCourses] = useState<AnalyticsCourses>(EMPTY_COURSES);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshToken, setRefreshToken] = useState(0);

  const refresh = useCallback(() => {
    setRefreshToken(Date.now());
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [overviewRes, coursesRes, revenueRes] = await Promise.allSettled([
          apiClient.getAnalyticsOverview(),
          apiClient.getAnalyticsCourses(),
          includeRevenue
            ? apiClient.getAnalyticsRevenue()
            : Promise.resolve(null)
        ]);

        if (!isMounted) return;

        if (overviewRes.status === 'fulfilled' && overviewRes.value) {
          setOverview({ ...EMPTY_OVERVIEW, ...overviewRes.value });
        } else {
          setOverview(EMPTY_OVERVIEW);
          if (overviewRes.status === 'rejected') {
            ErrorHandler.handleApiError(overviewRes.reason);
          }
        }

        if (coursesRes.status === 'fulfilled' && coursesRes.value) {
          setCourses({
            courses: coursesRes.value.courses ?? [],
            totalCourses: coursesRes.value.totalCourses ?? 0
          });
        } else {
          setCourses(EMPTY_COURSES);
        }

        if (revenueRes.status === 'fulfilled' && revenueRes.value) {
          setRevenue({ ...EMPTY_REVENUE, ...revenueRes.value });
        } else if (overviewRes.status === 'fulfilled' && overviewRes.value) {
          setRevenue({
            ...EMPTY_REVENUE,
            totalRevenue: overviewRes.value.totalRevenue,
            totalTransactions: overviewRes.value.totalTransactions,
            totalRefunds: overviewRes.value.totalRefunds,
            recentPayments: overviewRes.value.recentPayments,
            revenueTrend: overviewRes.value.revenueTrend.map((point) => ({
              period: point.period,
              revenue: point.revenue,
              transactions: point.enrollments
            }))
          });
        } else {
          setRevenue(EMPTY_REVENUE);
        }
      } catch (error) {
        ErrorHandler.handleApiError(error);
        if (isMounted) {
          setOverview(EMPTY_OVERVIEW);
          setRevenue(EMPTY_REVENUE);
          setCourses(EMPTY_COURSES);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void fetchData();
    return () => {
      isMounted = false;
    };
  }, [refreshToken, includeRevenue]);

  return useMemo(
    () => ({ overview, revenue, courses, isLoading, refresh }),
    [overview, revenue, courses, isLoading, refresh]
  );
}
