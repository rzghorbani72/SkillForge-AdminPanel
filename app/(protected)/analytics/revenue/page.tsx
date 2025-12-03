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
  Line,
  LineChart,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar
} from 'recharts';
import { useAnalyticsData } from '../_hooks/use-analytics-data';
import { Progress } from '@/components/ui/progress';
import { useCurrentSchool } from '@/hooks/useCurrentSchool';
import { formatCurrencyWithSchool } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/hooks';

interface RevenuePoint {
  month: string;
  revenue: number;
  enrollments: number;
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

function groupPaymentsByMonth(payments: any[]): RevenuePoint[] {
  if (payments.length === 0) return [];

  const map = new Map<string, RevenuePoint>();

  payments.forEach((payment) => {
    if (!payment.payment_date) return;
    const date = new Date(payment.payment_date);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    if (!map.has(key)) {
      map.set(key, {
        month: `${MONTH_NAMES[date.getMonth()]} ${String(
          date.getFullYear()
        ).slice(-2)}`,
        revenue: 0,
        enrollments: 0
      });
    }
    const bucket = map.get(key)!;
    bucket.revenue += payment.amount ?? 0;
    bucket.enrollments += 1;
  });

  return Array.from(map.values()).sort((a, b) => {
    const aDate = new Date(
      Number(`20${a.month.split(' ')[1]}`),
      MONTH_NAMES.indexOf(a.month.split(' ')[0])
    );
    const bDate = new Date(
      Number(`20${b.month.split(' ')[1]}`),
      MONTH_NAMES.indexOf(b.month.split(' ')[0])
    );
    return aDate.getTime() - bDate.getTime();
  });
}

export default function RevenueAnalyticsPage() {
  const { t, language } = useTranslation();
  const { payments, enrollments, isLoading } = useAnalyticsData();
  const school = useCurrentSchool();

  const {
    monthlyRevenue,
    total,
    averageTicket,
    topCourses,
    totalRefunds,
    monthOverMonth
  } = useMemo(() => {
    if (payments.length === 0) {
      return {
        monthlyRevenue: [] as RevenuePoint[],
        total: 0,
        averageTicket: 0,
        totalRefunds: 0,
        monthOverMonth: 0,
        topCourses: [] as Array<{
          name: string;
          amount: number;
          count: number;
        }>
      };
    }

    const monthly = groupPaymentsByMonth(payments);
    const totalAmount = payments.reduce(
      (sum, payment) => sum + (payment.amount ?? 0),
      0
    );
    const refunds = payments
      .filter((payment) => payment.status === 'REFUNDED')
      .reduce((sum, payment) => sum + (payment.amount ?? 0), 0);
    const averageTicketValue =
      payments.length > 0 ? Math.round(totalAmount / payments.length) : 0;

    const revenueByCourse = new Map<
      number,
      { name: string; amount: number; count: number }
    >();
    payments.forEach((payment) => {
      if (!payment.course_id) return;
      if (!revenueByCourse.has(payment.course_id)) {
        revenueByCourse.set(payment.course_id, {
          name: payment.course?.title ?? `Course ${payment.course_id}`,
          amount: 0,
          count: 0
        });
      }
      const entry = revenueByCourse.get(payment.course_id)!;
      entry.amount += payment.amount ?? 0;
      entry.count += 1;
    });

    const topCourseRevenue = Array.from(revenueByCourse.values())
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    const lastTwo = monthly.slice(-2);
    const percentChange =
      lastTwo.length === 2 && lastTwo[0].revenue > 0
        ? Math.round(
            ((lastTwo[1].revenue - lastTwo[0].revenue) / lastTwo[0].revenue) *
              100
          )
        : 0;

    return {
      monthlyRevenue: monthly,
      total: totalAmount,
      averageTicket: averageTicketValue,
      totalRefunds: refunds,
      monthOverMonth: percentChange,
      topCourses: topCourseRevenue
    };
  }, [payments]);

  const enrolmentRevenue = useMemo(() => {
    if (enrollments.length === 0) return [];

    const map = new Map<string, { name: string; value: number }>();
    enrollments.forEach((enrollment) => {
      const courseName =
        enrollment.course?.title ?? `Course ${enrollment.course_id}`;
      if (!map.has(courseName)) {
        map.set(courseName, { name: courseName, value: 0 });
      }
      const bucket = map.get(courseName)!;
      bucket.value +=
        enrollment.payments?.reduce(
          (sum, payment) => sum + (payment.amount ?? 0),
          0
        ) ?? 0;
    });

    return Array.from(map.values())
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [enrollments]);

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900" />
            <p className="mt-2 text-sm text-muted-foreground">
              {t('common.loading')}
            </p>
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
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {t('analytics.revenueAnalytics')}
        </h1>
        <p className="text-muted-foreground">
          {t('analytics.revenueAnalyticsDescription')}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t('analytics.totalRevenue')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrencyWithSchool(total, school)}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('analytics.acrossAllPayments')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t('analytics.averageTicket')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrencyWithSchool(averageTicket, school)}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('analytics.perSuccessfulPayment')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t('analytics.refunds')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-500">
              {formatCurrencyWithSchool(totalRefunds, school)}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('analytics.processedRefunds')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t('analytics.monthOverMonth')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-bold ${
                monthOverMonth >= 0 ? 'text-green-600' : 'text-red-500'
              }`}
            >
              {monthOverMonth >= 0 ? '+' : ''}
              {monthOverMonth}%
            </p>
            <p className="text-xs text-muted-foreground">
              {t('analytics.changeComparedPrevious')}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('analytics.monthlyRevenueVsEnrollments')}</CardTitle>
          <CardDescription>
            {t('analytics.monthlyRevenueDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={360}>
            <LineChart
              data={monthlyRevenue}
              margin={{ top: 16, right: 16, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value: number, name: string) =>
                  name === 'revenue'
                    ? [
                        formatCurrencyWithSchool(value, school),
                        t('analytics.totalRevenue')
                      ]
                    : [value, t('students.enrollments')]
                }
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#6366f1"
                strokeWidth={2}
                name="Revenue"
              />
              <Line
                type="monotone"
                dataKey="enrollments"
                stroke="#22c55e"
                strokeWidth={2}
                name="Transactions"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('analytics.revenueByCourse')}</CardTitle>
            <CardDescription>
              {t('analytics.revenueByCourseDescription')}
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
                  className="flex flex-col gap-2 rounded-md border p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{course.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {course.count} payments
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {formatCurrencyWithSchool(course.amount, school)}
                    </Badge>
                  </div>
                  <Progress
                    value={
                      topCourses[0]?.amount
                        ? Math.round(
                            (course.amount / topCourses[0].amount) * 100
                          )
                        : 0
                    }
                    className="h-2"
                  />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('analytics.enrollmentValueByCourse')}</CardTitle>
            <CardDescription>
              {t('analytics.enrollmentValueDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={enrolmentRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" hide />
                <YAxis />
                <Tooltip
                  formatter={(value: number) =>
                    formatCurrencyWithSchool(value, school)
                  }
                />
                <Bar dataKey="value" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-1 text-xs text-muted-foreground">
              {enrolmentRevenue.map((item) => (
                <div key={item.name} className="flex justify-between">
                  <span>{item.name}</span>
                  <span>{formatCurrencyWithSchool(item.value, school)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
