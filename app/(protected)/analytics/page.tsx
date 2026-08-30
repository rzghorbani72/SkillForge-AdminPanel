'use client';

import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { DollarSign, Eye, Star, Users } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useAnalyticsData } from './_hooks/use-analytics-data';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { usePercentLabel } from '@/lib/i18n/use-percent-label';
import { formatMonthYear } from '@/lib/i18n/format-month-year';
import { isPaidPayment, paymentDateOf } from '@/lib/payment-date';

interface RevenuePoint {
  month: string;
  revenue: number;
  enrollments: number;
}

interface EngagementSlice {
  name: string;
  value: number;
  color: string;
}

export default function AnalyticsPage() {
  const { t, language } = useTranslation();
  const formatNumber = useNumberFormat();
  const formatPercent = usePercentLabel();
  const formatCurrency = useFormatCurrency();
  const { courses, enrollments, payments, isLoading } = useAnalyticsData();
  const isRtl = language === 'fa' || language === 'ar';

  const { revenueTrend, totalRevenue, totalEnrollments, activeEnrollments } =
    useMemo(() => {
      if (payments.length === 0 && enrollments.length === 0) {
        return {
          revenueTrend: [] as RevenuePoint[],
          totalRevenue: 0,
          totalEnrollments: 0,
          activeEnrollments: 0
        };
      }

      const paidPayments = payments.filter((payment) =>
        isPaidPayment(payment.status)
      );

      const revenueMap = new Map<
        string,
        { revenue: number; enrollments: number }
      >();

      paidPayments.forEach((payment) => {
        const rawDate = paymentDateOf(payment);
        if (!rawDate) return;
        const date = new Date(rawDate);
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        if (!revenueMap.has(key)) {
          revenueMap.set(key, { revenue: 0, enrollments: 0 });
        }
        const bucket = revenueMap.get(key)!;
        bucket.revenue += payment.amount ?? 0;
      });

      enrollments.forEach((enrollment) => {
        if (!enrollment.enrolled_at) return;
        const date = new Date(enrollment.enrolled_at);
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        if (!revenueMap.has(key)) {
          revenueMap.set(key, { revenue: 0, enrollments: 0 });
        }
        const bucket = revenueMap.get(key)!;
        bucket.enrollments += 1;
      });

      const trend = Array.from(revenueMap.entries())
        .map(([key, value]) => {
          const [year, month] = key.split('-').map((item) => Number(item));
          const date = new Date(year, month, 1);
          return {
            month: formatMonthYear(date, language),
            timestamp: date.getTime(),
            revenue: value.revenue,
            enrollments: value.enrollments
          };
        })
        .sort((a, b) => a.timestamp - b.timestamp)
        .map(({ timestamp, ...item }) => item);

      const totalRevenueAccum = paidPayments.reduce(
        (sum, payment) => sum + (payment.amount ?? 0),
        0
      );
      const totalEnrollmentsAccum = enrollments.length;
      const activeEnrollmentsAccum = enrollments.filter(
        (enrollment) => enrollment.status === 'ACTIVE'
      ).length;

      return {
        revenueTrend: trend,
        totalRevenue: totalRevenueAccum,
        totalEnrollments: totalEnrollmentsAccum,
        activeEnrollments: activeEnrollmentsAccum
      };
    }, [payments, enrollments, language]);

  const completionRate = useMemo(() => {
    if (totalEnrollments === 0) return 0;
    const completed = enrollments.filter(
      (enrollment) => enrollment.status === 'COMPLETED'
    ).length;
    return Math.round((completed / totalEnrollments) * 100);
  }, [enrollments, totalEnrollments]);

  const engagementSlices = useMemo<EngagementSlice[]>(() => {
    if (enrollments.length === 0) {
      return [{ name: t('analytics.noData'), value: 1, color: '#CBD5F5' }];
    }

    return [
      {
        name: t('common.active'),
        value: enrollments.filter((e) => e.status === 'ACTIVE').length,
        color: '#10b981'
      },
      {
        name: t('students.completed'),
        value: enrollments.filter((e) => e.status === 'COMPLETED').length,
        color: '#3b82f6'
      },
      {
        name: t('students.cancelled'),
        value: enrollments.filter((e) => e.status === 'CANCELLED').length,
        color: '#ef4444'
      }
    ].filter((slice) => slice.value > 0);
  }, [enrollments, t]);

  const topCourses = useMemo(() => {
    if (courses.length === 0) return [];

    return courses
      .map((course) => ({
        name: course.title,
        students: course.students_count ?? course?.enrollments_count ?? 0
      }))
      .sort((a, b) => b.students - a.students)
      .slice(0, 5);
  }, [courses]);

  const enrollmentLeader = useMemo(
    () =>
      topCourses.length > 0
        ? Math.max(...topCourses.map((course) => course.students))
        : 0,
    [topCourses]
  );

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-4 sm:p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
            <p className="mt-2 text-sm text-muted-foreground">
              {t('common.loading')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('analytics.overview')}
          </h1>
          <p className="text-muted-foreground">
            {t('analytics.overviewDescription')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('analytics.totalRevenue')}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('analytics.combinedPayments')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('analytics.totalEnrollments')}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(totalEnrollments)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('analytics.recentEnrollmentActivity')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('analytics.activeStudents')}
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(activeEnrollments)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('analytics.currentlyProgressingCourses')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('analytics.completionRate')}
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercent(completionRate)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('analytics.shareOfFinishedEnrollments')}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('analytics.revenueTrend')}</CardTitle>
            <CardDescription>
              {t('analytics.revenueTrendDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickFormatter={(label) => String(label)}
                />
                <YAxis
                  tickFormatter={(value: number) =>
                    formatNumber(Math.round(value / 1_000_000))
                  }
                />
                <Tooltip
                  formatter={(value: number) => [
                    formatCurrency(value),
                    t('analytics.totalRevenue')
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  fill="#10b98155"
                  name="revenue"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('analytics.engagementBreakdown')}</CardTitle>
            <CardDescription>
              {t('analytics.engagementBreakdownDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={engagementSlices}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis
                  allowDecimals={false}
                  tickFormatter={(value: number) => formatNumber(value)}
                />
                <Tooltip
                  formatter={(value: number) => [
                    formatNumber(value),
                    t('analytics.engagementBreakdown')
                  ]}
                />
                <Bar dataKey="value">
                  {engagementSlices.map((slice, index) => (
                    <Cell key={slice.name} fill={slice.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('analytics.topPerformingCourses')}</CardTitle>
          <CardDescription>
            {t('analytics.topPerformingCoursesDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {topCourses.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t('analytics.noCourseRevenueData')}
            </p>
          ) : (
            topCourses.map((course, index) => (
              <div
                key={course.name}
                className="flex flex-col gap-2 rounded-md border p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                    {formatNumber(index + 1)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{course.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatNumber(course.students)} {t('users.students')}
                    </p>
                  </div>
                </div>
                <div className="flex w-full flex-col gap-2 md:w-64">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{t('analytics.totalEnrollments')}</span>
                    <Badge variant="outline">
                      {formatNumber(course.students)}
                    </Badge>
                  </div>
                  <Progress
                    value={
                      enrollmentLeader > 0
                        ? Math.round((course.students / enrollmentLeader) * 100)
                        : 0
                    }
                    className="h-2"
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
