'use client';

import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAnalyticsData } from '../_hooks/use-analytics-data';
import { useIranMoney, rialToToman } from '../_hooks/use-iran-money';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { formatTrendPeriod } from '../_components/format-trend-period';
import { AnalyticsLoading } from '../_components/analytics-loading';

export default function CoursePerformancePage() {
  const { t, language } = useTranslation();
  const formatNumber = useNumberFormat();
  const { formatTomanFromRial } = useIranMoney();
  const { courses, overview, isLoading } = useAnalyticsData();
  const isRtl = language === 'fa' || language === 'ar';

  const courseMetrics = courses.courses.map((course) => ({
    name: course.courseTitle,
    enrollments: course.totalEnrollments,
    revenue: course.totalRevenue,
    completion: course.completionRate,
    activeLearners: course.activeEnrollments
  }));

  const topByEnrollment = useMemo(
    () => [...courseMetrics].sort((a, b) => b.enrollments - a.enrollments),
    [courseMetrics]
  );

  const topByRevenue = useMemo(
    () => [...courseMetrics].sort((a, b) => b.revenue - a.revenue),
    [courseMetrics]
  );

  const aggregateTrend = overview.revenueTrend.map((point) => ({
    month: formatTrendPeriod(point.period, language),
    active: point.active,
    completed: point.completed
  }));

  if (isLoading) return <AnalyticsLoading />;

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {t('analytics.coursePerformance')}
        </h1>
        <p className="text-muted-foreground">
          {t('analytics.coursePerformanceDescription')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('analytics.activeVsCompleted')}</CardTitle>
          <CardDescription>
            {t('analytics.activeVsCompletedDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={aggregateTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis
                allowDecimals={false}
                tickFormatter={(value: number) => formatNumber(value)}
              />
              <Tooltip
                formatter={(value: number) => [formatNumber(value), '']}
              />
              <Area
                type="monotone"
                dataKey="active"
                stackId="1"
                stroke="#6366f1"
                fill="#6366f144"
                name={t('common.active')}
              />
              <Area
                type="monotone"
                dataKey="completed"
                stackId="1"
                stroke="#22c55e"
                fill="#22c55e44"
                name={t('students.completed')}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('analytics.topCoursesByEnrollments')}</CardTitle>
            <CardDescription>
              {t('analytics.topCoursesByEnrollmentsDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={topByEnrollment.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" hide />
                <YAxis
                  allowDecimals={false}
                  tickFormatter={(value: number) => formatNumber(value)}
                />
                <Tooltip
                  formatter={(value: number) => [
                    formatNumber(value),
                    t('analytics.totalEnrollments')
                  ]}
                />
                <Bar dataKey="enrollments" fill="#818cf8" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2 text-sm">
              {topByEnrollment.slice(0, 8).map((course) => (
                <div
                  key={course.name}
                  className="flex items-center justify-between"
                >
                  <span className="truncate">{course.name}</span>
                  <Badge variant="outline">
                    {formatNumber(course.enrollments)} {t('users.students')}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('analytics.revenueLeaderboard')}</CardTitle>
            <CardDescription>
              {t('analytics.revenueLeaderboardDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={topByRevenue.slice(0, 8).map((course) => ({
                  ...course,
                  revenueToman: rialToToman(course.revenue)
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" hide />
                <YAxis tickFormatter={(value: number) => formatNumber(value)} />
                <Tooltip
                  formatter={(value: number) =>
                    `${formatNumber(value)} ${t('common.toman')}`
                  }
                />
                <Bar dataKey="revenueToman" fill="#34d399" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2 text-sm">
              {topByRevenue.slice(0, 8).map((course) => (
                <div key={course.name} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="truncate">{course.name}</span>
                    <Badge variant="secondary">
                      {formatTomanFromRial(course.revenue)}
                    </Badge>
                  </div>
                  <Progress value={course.completion} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
