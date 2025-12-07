'use client';

import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { Calendar, DollarSign, Eye, Filter, Star, Users } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useAnalyticsData } from './_hooks/use-analytics-data';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { formatCurrencyWithStore } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/hooks';

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

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
];

export default function AnalyticsPage() {
  const { t, language } = useTranslation();
  const { courses, enrollments, payments, isLoading } = useAnalyticsData();
  const store = useCurrentStore();

  // Debug: Log store currency info
  if (process.env.NODE_ENV === 'development' && store) {
    console.log('Store currency config:', {
      currency: store.currency,
      currency_symbol: store.currency_symbol,
      currency_position: store.currency_position,
      country_code: store.country_code
    });
  }

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

      const revenueMap = new Map<
        string,
        { revenue: number; enrollments: number }
      >();

      payments.forEach((payment) => {
        if (!payment.payment_date) return;
        const date = new Date(payment.payment_date);
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
          return {
            month: `${MONTH_NAMES[month]} ${String(year).slice(-2)}`,
            revenue: value.revenue,
            enrollments: value.enrollments
          };
        })
        .sort((a, b) => {
          const [aMonth, aYear] = a.month.split(' ');
          const [bMonth, bYear] = b.month.split(' ');
          const yearDiff = Number(aYear) - Number(bYear);
          if (yearDiff !== 0) return yearDiff;
          return MONTH_NAMES.indexOf(aMonth) - MONTH_NAMES.indexOf(bMonth);
        });

      const totalRevenueAccum = payments.reduce(
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
    }, [payments, enrollments]);

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
        students: course.students_count ?? course?.enrollments_count ?? 0,
        revenue: (course.students_count ?? 0) * 9900
      }))
      .sort((a, b) => b.students - a.students)
      .slice(0, 5);
  }, [courses]);

  const revenueLeader = useMemo(
    () =>
      topCourses.length > 0
        ? Math.max(...topCourses.map((course) => course.revenue))
        : 0,
    [topCourses]
  );

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900" />
            <p className="mt-2 text-sm text-gray-600">{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex-1 space-y-6 p-6"
      dir={language === 'fa' || language === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('analytics.overview')}
          </h1>
          <p className="text-muted-foreground">
            {t('analytics.overviewDescription')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Calendar className="me-2 h-4 w-4" />
            {t('analytics.last30Days')}
          </Button>
          <Button variant="outline">
            <Filter className="me-2 h-4 w-4" />
            {t('analytics.export')}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('analytics.totalRevenue')}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrencyWithStore(totalRevenue, store)}
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
            <div className="text-2xl font-bold">{totalEnrollments}</div>
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
            <div className="text-2xl font-bold">{activeEnrollments}</div>
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
            <div className="text-2xl font-bold">{completionRate}%</div>
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
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value: number, name: string) =>
                    name === 'revenue'
                      ? [
                          formatCurrencyWithStore(value, store),
                          t('analytics.totalRevenue')
                        ]
                      : [value, t('students.enrollments')]
                  }
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  fill="#6366f1"
                  name="revenue"
                />
                <Area
                  type="monotone"
                  dataKey="enrollments"
                  stroke="#22c55e"
                  fill="#22c55e33"
                  name="enrollments"
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
                <YAxis allowDecimals={false} />
                <Tooltip />
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
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{course.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {course.students} students
                    </p>
                  </div>
                </div>
                <div className="flex w-full flex-col gap-2 md:w-64">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Revenue</span>
                    <Badge variant="outline">
                      {formatCurrencyWithStore(course.revenue, store)}
                    </Badge>
                  </div>
                  <Progress
                    value={
                      revenueLeader > 0
                        ? Math.round((course.revenue / revenueLeader) * 100)
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
