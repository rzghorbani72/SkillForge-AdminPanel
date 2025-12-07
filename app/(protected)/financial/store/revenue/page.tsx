'use client';

import { useState, useEffect, useMemo } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  CreditCard,
  Users,
  BookOpen
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { formatCurrencyWithSchool } from '@/lib/utils';
import { toast } from 'react-toastify';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useTranslation } from '@/lib/i18n/hooks';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SchoolRevenuePage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const school = useCurrentSchool();

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  }, []);

  useEffect(() => {
    loadData();
  }, [selectedYear, selectedMonth, school?.id]);

  const loadData = async () => {
    if (!school?.id) return;

    try {
      setLoading(true);

      const startDate =
        selectedMonth && selectedYear
          ? new Date(selectedYear, selectedMonth - 1, 1)
          : new Date(selectedYear, 0, 1);
      const endDate =
        selectedMonth && selectedYear
          ? new Date(selectedYear, selectedMonth, 0, 23, 59, 59)
          : new Date(selectedYear, 11, 31, 23, 59, 59);

      const data = await apiClient.getSchoolRevenueFromPayments(
        school.id,
        startDate.toISOString(),
        endDate.toISOString()
      );

      setRevenueData(data);
      setPayments(data.payments || []);
    } catch (error: any) {
      console.error('Error loading revenue data:', error);
      toast.error(error?.message || 'Failed to load revenue data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency = 'IRR') => {
    return formatCurrencyWithSchool(amount, {
      currency: currency as any,
      currency_symbol: currency === 'IRR' ? 'Toman' : currency,
      currency_position: 'after'
    });
  };

  // Group payments by course
  const paymentsByCourse = useMemo(() => {
    const grouped: Record<
      string,
      { course: string; count: number; total: number; currency: string }
    > = {};

    payments.forEach((payment: any) => {
      const courseName = payment.course?.title || 'Unknown Course';
      const courseId = payment.course?.id || 'unknown';

      if (!grouped[courseId]) {
        grouped[courseId] = {
          course: courseName,
          count: 0,
          total: 0,
          currency: payment.currency || 'IRR'
        };
      }

      grouped[courseId].count += 1;
      grouped[courseId].total += payment.amount || 0;
    });

    return Object.values(grouped);
  }, [payments]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">
            {t('financial.school.revenue.loading')}
          </p>
        </div>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">
          {t('financial.school.revenue.noSchool')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {t('financial.school.revenue.title')}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {school.name} - {t('financial.school.revenue.description')}
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>{t('financial.school.revenue.filters')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium">
                {t('financial.school.revenue.year')}
              </label>
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => setSelectedYear(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium">
                {t('financial.school.revenue.month')}
              </label>
              <Select
                value={selectedMonth?.toString() || 'all'}
                onValueChange={(value) =>
                  setSelectedMonth(value === 'all' ? null : parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t('financial.school.revenue.allMonths')}
                  </SelectItem>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <SelectItem key={month} value={month.toString()}>
                      {new Date(2000, month - 1).toLocaleString('en-US', {
                        month: 'long'
                      })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {revenueData && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('financial.school.revenue.totalRevenue')}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(
                  revenueData.total_revenue,
                  revenueData.currency
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('financial.school.revenue.fromPayments', {
                  count: revenueData.payment_count
                })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('financial.school.revenue.totalPayments')}
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {revenueData.payment_count}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('financial.school.revenue.successfulTransactions')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('financial.school.revenue.averagePayment')}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {revenueData.payment_count > 0
                  ? formatCurrency(
                      revenueData.total_revenue / revenueData.payment_count,
                      revenueData.currency
                    )
                  : formatCurrency(0, revenueData.currency)}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('financial.school.revenue.perTransaction')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('financial.school.revenue.courses')}
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {paymentsByCourse.length}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('financial.school.revenue.coursesWithPayments')}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed View */}
      <Tabs defaultValue="payments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payments">
            {t('financial.school.revenue.allPayments')}
          </TabsTrigger>
          <TabsTrigger value="courses">
            {t('financial.school.revenue.revenueByCourse')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {t('financial.school.revenue.allPayments')}
                  </CardTitle>
                  <CardDescription>
                    {t('financial.school.revenue.paymentsDescription')}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('financial.school.revenue.date')}</TableHead>
                    <TableHead>
                      {t('financial.school.revenue.student')}
                    </TableHead>
                    <TableHead>
                      {t('financial.school.revenue.course')}
                    </TableHead>
                    <TableHead className="text-right">
                      {t('financial.school.revenue.amount')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-muted-foreground"
                      >
                        {t('financial.school.revenue.noPayments')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    payments.map((payment: any) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              {new Date(
                                payment.created_at
                              ).toLocaleDateString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {payment.profile?.display_name || 'Unknown'}
                        </TableCell>
                        <TableCell>
                          {payment.course?.title || 'Unknown Course'}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(payment.amount, payment.currency)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {t('financial.school.revenue.revenueByCourse')}
              </CardTitle>
              <CardDescription>
                {t('financial.school.revenue.revenueByCourseDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      {t('financial.school.revenue.course')}
                    </TableHead>
                    <TableHead className="text-right">
                      {t('financial.school.revenue.payments')}
                    </TableHead>
                    <TableHead className="text-right">
                      {t('financial.school.revenue.totalRevenue')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentsByCourse.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center text-muted-foreground"
                      >
                        {t('financial.school.revenue.noCourseRevenue')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paymentsByCourse
                      .sort((a, b) => b.total - a.total)
                      .map((course, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {course.course}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant="secondary">{course.count}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(course.total, course.currency)}
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
