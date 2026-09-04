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
import { useIranMoney, rialToToman } from '../_hooks/use-iran-money';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { formatTrendPeriod } from '../_components/format-trend-period';
import { AnalyticsLoading } from '../_components/analytics-loading';
import { PaymentDetailsTable } from '../_components/payment-details-table';
import { RevenueKpis } from '../_components/revenue-kpis';

export default function RevenueAnalyticsPage() {
  const { t, language } = useTranslation();
  const formatNumber = useNumberFormat();
  const { formatTomanFromRial } = useIranMoney();
  const { revenue, isLoading } = useAnalyticsData({ revenue: true });
  const isRtl = language === 'fa' || language === 'ar';

  const monthlyRevenue = useMemo(
    () =>
      revenue.revenueTrend.map((point) => ({
        month: formatTrendPeriod(point.period, language),
        revenue: rialToToman(point.revenue),
        transactions: point.transactions
      })),
    [revenue.revenueTrend, language]
  );

  const averageTicket =
    revenue.totalTransactions > 0
      ? Math.round(revenue.totalRevenue / revenue.totalTransactions)
      : 0;

  const lastTwo = monthlyRevenue.slice(-2);
  const monthOverMonth =
    lastTwo.length === 2 && lastTwo[0].revenue > 0
      ? Math.round(
          ((lastTwo[1].revenue - lastTwo[0].revenue) / lastTwo[0].revenue) * 100
        )
      : 0;

  const topCourses = revenue.revenueByCourse;
  const methodBars = revenue.revenueByMethod.map((row) => ({
    name: row.method,
    value: rialToToman(row.revenue)
  }));

  if (isLoading) return <AnalyticsLoading />;

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {t('analytics.revenueAnalytics')}
        </h1>
        <p className="text-muted-foreground">
          {t('analytics.revenueAnalyticsDescription')}
        </p>
      </div>

      <RevenueKpis
        totalRevenue={revenue.totalRevenue}
        averageTicket={averageTicket}
        totalRefunds={revenue.totalRefunds}
        monthOverMonth={monthOverMonth}
      />

      <Card>
        <CardHeader>
          <CardTitle>{t('analytics.monthlyRevenueVsEnrollments')}</CardTitle>
          <CardDescription>
            {t('analytics.monthlyRevenueDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={360}>
            <LineChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value: number) => formatNumber(value)} />
              <Tooltip
                formatter={(value: number, name: string) =>
                  name === 'revenue'
                    ? [
                        `${formatNumber(value)} ${t('common.toman')}`,
                        t('analytics.totalRevenue')
                      ]
                    : [formatNumber(value), t('payments.transactions')]
                }
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#6366f1"
                strokeWidth={2}
                name="revenue"
              />
              <Line
                type="monotone"
                dataKey="transactions"
                stroke="#22c55e"
                strokeWidth={2}
                name="transactions"
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
                      {formatTomanFromRial(course.amount)}
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
            <CardTitle>{t('analytics.revenueByMethod')}</CardTitle>
            <CardDescription>
              {t('analytics.revenueByMethodDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={methodBars}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" hide />
                <YAxis tickFormatter={(value: number) => formatNumber(value)} />
                <Tooltip
                  formatter={(value: number) =>
                    `${formatNumber(value)} ${t('common.toman')}`
                  }
                />
                <Bar dataKey="value" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-1 text-xs text-muted-foreground">
              {revenue.revenueByMethod.map((item) => (
                <div key={item.method} className="flex justify-between">
                  <span>{item.method}</span>
                  <span>{formatTomanFromRial(item.revenue)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <PaymentDetailsTable payments={revenue.recentPayments} />
    </div>
  );
}
