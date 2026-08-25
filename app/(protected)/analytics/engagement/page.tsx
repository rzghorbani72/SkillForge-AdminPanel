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
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Tooltip,
  BarChart,
  CartesianGrid,
  Bar,
  XAxis,
  YAxis
} from 'recharts';
import { useAnalyticsData } from '../_hooks/use-analytics-data';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { usePercentLabel } from '@/lib/i18n/use-percent-label';

interface EngagementSlice {
  name: string;
  value: number;
  fill: string;
}

export default function StudentEngagementPage() {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const formatPercent = usePercentLabel();
  const { enrollments, courses, isLoading } = useAnalyticsData();

  const {
    engagementDistribution,
    averageProgress,
    laggingStudents,
    completedStudents,
    courseEngagement
  } = useMemo(() => {
    if (enrollments.length === 0) {
      return {
        engagementDistribution: [
          { name: 'No data', value: 1, fill: '#CBD5F5' } as EngagementSlice
        ],
        averageProgress: 0,
        laggingStudents: 0,
        completedStudents: 0,
        courseEngagement: [] as Array<{
          name: string;
          active: number;
          completed: number;
        }>
      };
    }

    const activeCount = enrollments.filter(
      (enrollment) => enrollment.status === 'ACTIVE'
    ).length;
    const completedCount = enrollments.filter(
      (enrollment) => enrollment.status === 'COMPLETED'
    ).length;
    const cancelledCount = enrollments.filter(
      (enrollment) => enrollment.status === 'CANCELLED'
    ).length;

    const averageProgressValue = Math.round(
      enrollments.reduce((sum, enrollment) => {
        if (typeof enrollment.progress_percent === 'number') {
          return sum + enrollment.progress_percent;
        }
        return sum;
      }, 0) / enrollments.length
    );

    const laggingCount = enrollments.filter((enrollment) => {
      if (typeof enrollment.progress_percent === 'number') {
        return enrollment.progress_percent < 50;
      }
      return false;
    }).length;

    const courseEngagementStats = courses.map((course) => {
      const relatedEnrollments = enrollments.filter(
        (enrollment) => enrollment.course_id === course.id
      );
      return {
        name: course.title,
        active: relatedEnrollments.filter(
          (enrollment) => enrollment.status === 'ACTIVE'
        ).length,
        completed: relatedEnrollments.filter(
          (enrollment) => enrollment.status === 'COMPLETED'
        ).length
      };
    });

    return {
      engagementDistribution: [
        { name: t('common.active'), value: activeCount, fill: '#10b981' },
        {
          name: t('students.completed'),
          value: completedCount,
          fill: '#3b82f6'
        },
        {
          name: t('students.cancelled'),
          value: cancelledCount,
          fill: '#ef4444'
        }
      ] as EngagementSlice[],
      averageProgress: averageProgressValue,
      laggingStudents: laggingCount,
      completedStudents: completedCount,
      courseEngagement: courseEngagementStats
    };
  }, [enrollments, courses, t]);

  const topEngagedCourses = useMemo(() => {
    return courseEngagement
      .map((course) => ({
        ...course,
        total: course.active + course.completed
      }))
      .filter((course) => course.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [courseEngagement]);

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
    <div className="flex-1 space-y-6 p-4 sm:p-6" dir={'rtl'}>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {t('analytics.studentEngagement')}
        </h1>
        <p className="text-muted-foreground">
          {t('analytics.studentEngagementDescription')}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t('analytics.averageProgress')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatPercent(averageProgress)}
            </p>
            <Progress value={averageProgress} className="mt-2 h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t('analytics.laggingStudents')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-500">
              {formatNumber(laggingStudents)}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('analytics.laggingStudentsDescription')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t('analytics.completedStudents')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {formatNumber(completedStudents)}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('analytics.completedStudentsDescription')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t('analytics.activeCourses')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-indigo-600">
              {formatNumber(topEngagedCourses.length)}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('analytics.activeCoursesDescription')}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('analytics.engagementBreakdown')}</CardTitle>
            <CardDescription>
              {t('analytics.engagementDistributionDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <RadialBarChart
                innerRadius="20%"
                outerRadius="90%"
                data={engagementDistribution}
                startAngle={90}
                endAngle={-270}
              >
                <RadialBar background dataKey="value" />
                <Tooltip
                  formatter={(value: number) => [formatNumber(value), '']}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
              {engagementDistribution.map((slice) => (
                <div key={slice.name} className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-sm"
                    style={{ backgroundColor: slice.fill }}
                  />
                  <span className="text-muted-foreground">{slice.name}</span>
                  <Badge variant="outline">{formatNumber(slice.value)}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('analytics.coursesByEngagement')}</CardTitle>
            <CardDescription>
              {t('analytics.coursesByEngagementDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={topEngagedCourses}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" hide />
                <YAxis
                  allowDecimals={false}
                  tickFormatter={(value: number) => formatNumber(value)}
                />
                <Tooltip
                  formatter={(value: number) => [formatNumber(value), '']}
                />
                <Bar dataKey="active" stackId="a" fill="#6366f1" />
                <Bar dataKey="completed" stackId="a" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2 text-sm">
              {topEngagedCourses.map((course) => (
                <div
                  key={course.name}
                  className="flex items-center justify-between"
                >
                  <span className="truncate">{course.name}</span>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>
                      {t('common.active')} {formatNumber(course.active)}
                    </span>
                    <span>•</span>
                    <span>
                      {t('students.completed')} {formatNumber(course.completed)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
