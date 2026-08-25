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
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { usePercentLabel } from '@/lib/i18n/use-percent-label';
import { formatMonthYear } from '@/lib/i18n/format-month-year';
import type { LanguageCode } from '@/lib/i18n/config';
import { isPaidPayment, paymentDateOf } from '@/lib/payment-date';

interface RevenuePoint {
  month: string;
  revenue: number;
  enrollments: number;
}

function groupPaymentsByMonth(
  payments: any[],
  language: LanguageCode
): RevenuePoint[] {
  if (payments.length === 0) return [];

  const map = new Map<string, RevenuePoint>();

  payments.forEach((payment) => {
    if (!isPaidPayment(payment.status)) return;
    const rawDate = paymentDateOf(payment);
    if (!rawDate) return;
    const date = new Date(rawDate);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    if (!map.has(key)) {
      const labelDate = new Date(date.getFullYear(), date.getMonth(), 1);
      map.set(key, {
        month: formatMonthYear(labelDate, language),
        revenue: 0,
        enrollments: 0
      });
    }
    const bucket = map.get(key)!;
    bucket.revenue += payment.amount ?? 0;
    bucket.enrollments += 1;
  });

  return Array.from(map.entries())
    .sort(([a], [b]) => {
      const [aYear, aMonth] = a.split('-').map(Number);
      const [bYear, bMonth] = b.split('-').map(Number);
      return (
        new Date(aYear, aMonth, 1).getTime() -
        new Date(bYear, bMonth, 1).getTime()
      );
    })
    .map(([, value]) => value);
}

export default function RevenueAnalyticsPage() {
  const { t, language } = useTranslation();
  const formatNumber = useNumberFormat();
  const formatPercent = usePercentLabel();
  const formatCurrency = useFormatCurrency();
  const { payments, enrollments, isLoading } = useAnalyticsData();

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

    const monthly = groupPaymentsByMonth(payments, language);
    const paidPayments = payments.filter((payment) =>
      isPaidPayment(payment.status)
    );
    const totalAmount = paidPayments.reduce(
      (sum, payment) => sum + (payment.amount ?? 0),
      0
    );
    const refunds = payments
      .filter((payment) => payment.status === 'REFUNDED')
      .reduce((sum, payment) => sum + (payment.amount ?? 0), 0);
    const averageTicketValue =
      paidPayments.length > 0
        ? Math.round(totalAmount / paidPayments.length)
        : 0;

    const revenueByCourse = new Map<
      string,
      { name: string; amount: number; count: number }
    >();
    paidPayments.forEach((payment) => {
      if (!payment.course_id) return;
      if (!revenueByCourse.has(payment.course_id)) {
        revenueByCourse.set(payment.course_id, {
          name:
            payment.course?.title ??
            `${t('courses.courseName')} ${payment.course_id}`,
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
  }, [payments, language]);

  const enrolmentRevenue = useMemo(() => {
    if (enrollments.length === 0) return [];

    const map = new Map<string, { name: string; value: number }>();
    enrollments.forEach((enrollment) => {
      const courseName =
        enrollment.course?.title ??
        `${t('courses.courseName')} ${enrollment.course_id}`;
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
  }, [enrollments, t]);

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
            <p className="text-2xl font-bold">{formatCurrency(total)}</p>
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
              {formatCurrency(averageTicket)}
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
              {formatCurrency(totalRefunds)}
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
              {formatPercent(monthOverMonth)}
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
              <YAxis tickFormatter={(value: number) => formatNumber(value)} />
              <Tooltip
                formatter={(value: number, name: string) =>
                  name === 'revenue'
                    ? [formatCurrency(value), t('analytics.totalRevenue')]
                    : [formatNumber(value), t('students.enrollments')]
                }
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#6366f1"
                strokeWidth={2}
                name={t('analytics.revenue')}
              />
              <Line
                type="monotone"
                dataKey="enrollments"
                stroke="#22c55e"
                strokeWidth={2}
                name={t('payments.transactions')}
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
                        {formatNumber(index + 1)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{course.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatNumber(course.count)}{' '}
                          {t('financial.store.payments.payments')}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {formatCurrency(course.amount)}
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
                <YAxis tickFormatter={(value: number) => formatNumber(value)} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="value" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-1 text-xs text-muted-foreground">
              {enrolmentRevenue.map((item) => (
                <div key={item.name} className="flex justify-between">
                  <span>{item.name}</span>
                  <span>{formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
