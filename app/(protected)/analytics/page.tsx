'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  YAxis,
} from 'recharts';
import { Progress } from '@/components/ui/progress';
import { useAnalyticsData } from './_hooks/use-analytics-data';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { formatTrendPeriod } from './_components/format-trend-period';
import { AnalyticsLoading } from './_components/analytics-loading';
import { PaymentDetailsTable } from './_components/payment-details-table';
import { OverviewKpis } from './_components/overview-kpis';

export default function AnalyticsPage() {
  const { t, language } = useTranslation();
  const formatNumber = useNumberFormat();
  const { overview, isLoading } = useAnalyticsData();
  const isRtl = language === 'fa' || language === 'ar';

  const revenueTrend = useMemo(
    () =>
      overview.revenueTrend.map((point) => ({
        month: formatTrendPeriod(point.period, language),
        revenue: point.revenue,
        enrollments: point.enrollments,
      })),
    [overview.revenueTrend, language],
  );

  const engagementSlices = [
    {
      name: t('common.active'),
      value: overview.activeEnrollments,
      color: '#10b981',
    },
    {
      name: t('students.completed'),
      value: overview.completedEnrollments,
      color: '#3b82f6',
    },
    {
      name: t('students.cancelled'),
      value: overview.cancelledEnrollments,
      color: '#ef4444',
    },
  ].filter((slice) => slice.value > 0);

  const slices =
    engagementSlices.length > 0
      ? engagementSlices
      : [{ name: t('analytics.noData'), value: 1, color: '#CBD5F5' }];

  const enrollmentLeader =
    overview.topCourses.length > 0
      ? Math.max(...overview.topCourses.map((course) => course.students))
      : 0;

  if (isLoading) return <AnalyticsLoading />;

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('analytics.overview')}</h1>
        <p className="text-muted-foreground">{t('analytics.overviewDescription')}</p>
      </div>

      <OverviewKpis overview={overview} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('analytics.revenueTrend')}</CardTitle>
            <CardDescription>{t('analytics.revenueTrendDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value: number) => formatNumber(Math.round(value))} />
                <Tooltip
                  formatter={(value: number) => [
                    `${formatNumber(value)} ${t('common.toman')}`,
                    t('analytics.totalRevenue'),
                  ]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="#10b98155" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('analytics.engagementBreakdown')}</CardTitle>
            <CardDescription>{t('analytics.engagementBreakdownDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={slices}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis
                  allowDecimals={false}
                  tickFormatter={(value: number) => formatNumber(value)}
                />
                <Tooltip
                  formatter={(value: number) => [
                    formatNumber(value),
                    t('analytics.engagementBreakdown'),
                  ]}
                />
                <Bar dataKey="value">
                  {slices.map((slice) => (
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
          <CardDescription>{t('analytics.topPerformingCoursesDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {overview.topCourses.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('analytics.noCourseRevenueData')}</p>
          ) : (
            overview.topCourses.map((course, index) => (
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
                    <Badge variant="outline">{formatNumber(course.students)}</Badge>
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

      <PaymentDetailsTable payments={overview.recentPayments} />
    </div>
  );
}
