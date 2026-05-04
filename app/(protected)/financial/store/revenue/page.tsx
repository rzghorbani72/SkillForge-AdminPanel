'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
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
  BookOpen,
  Eye,
  EyeOff
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { formatCurrencyWithStore } from '@/lib/utils';
import { toast } from 'react-toastify';
import { useCurrentAcademy } from '@/hooks/useCurrentAcademy';
import { useTranslation } from '@/lib/i18n/hooks';
import { getRoleLabel } from '@/lib/i18n/role-label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

export default function StoreRevenuePage() {
  const { t, language } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<any>(null);
  const [monetizationSummary, setMonetizationSummary] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const currentAcademy = useCurrentAcademy();

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  }, []);

  useEffect(() => {
    loadData();
  }, [selectedYear, selectedMonth, currentAcademy?.id]);

  const loadData = async () => {
    if (!currentAcademy?.id) return;

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

      const data = await apiClient.getAcademyRevenueFromPayments(
        currentAcademy.id,
        startDate.toISOString(),
        endDate.toISOString()
      );
      const summary = await apiClient.getMonetizationSummary({
        academy_id: currentAcademy.id,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      });

      setRevenueData(data);
      setPayments(data.payments || []);
      setMonetizationSummary(summary);
    } catch (error: any) {
      console.error('Error loading revenue data:', error);
      toast.error(error?.message || 'Failed to load revenue data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency = 'IRR') => {
    return formatCurrencyWithStore(amount, {
      currency: currency as any,
      currency_symbol: currency === 'IRR' ? 'Toman' : currency,
      currency_position: 'after',
      language
    });
  };

  // Group payments by course
  const canViewRevenue = Boolean(
    monetizationSummary?.visibility?.can_view_store_revenue
  );
  const canViewTeacherRevenue = Boolean(
    monetizationSummary?.visibility?.can_view_teacher_revenue
  );
  const canViewPlatformRevenue = Boolean(
    monetizationSummary?.visibility?.can_view_platform_revenue
  );
  const canSeeAnyRevenue =
    canViewRevenue || canViewTeacherRevenue || canViewPlatformRevenue;
  const revenueCurrency =
    monetizationSummary?.metrics?.currency || revenueData?.currency || 'IRR';

  const primaryRevenue = useMemo(() => {
    if (canViewRevenue) {
      return {
        label: t('financial.store.revenue.schoolRevenue'),
        amount: Number(monetizationSummary?.metrics?.school_net_revenue || 0)
      };
    }

    if (canViewTeacherRevenue) {
      return {
        label: t('financial.store.revenue.teacherRevenue'),
        amount: Number(
          monetizationSummary?.metrics?.teacher_payout_revenue ||
            monetizationSummary?.metrics?.teacher_payout ||
            0
        )
      };
    }

    if (canViewPlatformRevenue) {
      return {
        label: t('financial.store.revenue.platformRevenue'),
        amount: Number(monetizationSummary?.metrics?.platform_revenue || 0)
      };
    }

    return {
      label: t('financial.store.revenue.roleBasedRevenue'),
      amount: 0
    };
  }, [
    canViewRevenue,
    canViewTeacherRevenue,
    canViewPlatformRevenue,
    monetizationSummary,
    t
  ]);

  const locale =
    language === 'fa'
      ? 'fa-IR'
      : language === 'ar'
        ? 'ar'
        : language === 'tr'
          ? 'tr-TR'
          : 'en-US';

  const paymentsByCourse = useMemo(() => {
    const grouped: Record<
      string,
      { course: string; count: number; total: number; currency: string }
    > = {};

    payments.forEach((payment: any) => {
      const courseName =
        payment.course?.title || t('financial.store.revenue.unknownCourse');
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
  }, [payments, t]);

  const teacherRevenueBreakdown = useMemo(() => {
    const rows = monetizationSummary?.metrics?.teacher_revenue_breakdown;
    return Array.isArray(rows) ? rows : [];
  }, [monetizationSummary]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">
            {t('financial.store.revenue.loading')}
          </p>
        </div>
      </div>
    );
  }

  if (!currentAcademy) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">
          {t('financial.store.revenue.noStore')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {t('financial.store.revenue.title')}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {currentAcademy.name} - {t('financial.store.revenue.description')}
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>{t('financial.store.revenue.filters')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium">
                {t('financial.store.revenue.year')}
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
                {t('financial.store.revenue.month')}
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
                    {t('financial.store.revenue.allMonths')}
                  </SelectItem>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <SelectItem key={month} value={month.toString()}>
                      {new Date(2000, month - 1).toLocaleString(locale, {
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
                {primaryRevenue.label}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {canSeeAnyRevenue
                  ? formatCurrency(primaryRevenue.amount, revenueCurrency)
                  : t('financial.store.revenue.hidden')}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('financial.store.revenue.roleBasedDescription')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('financial.store.revenue.totalPayments')}
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{payments.length}</div>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('financial.store.revenue.successfulTransactions')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('financial.store.revenue.averagePayment')}
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
                {t('financial.store.revenue.perTransaction')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('financial.store.revenue.courses')}
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {paymentsByCourse.length}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('financial.store.revenue.coursesWithPayments')}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {monetizationSummary && (
        <Card>
          <CardHeader>
            <CardTitle>
              {t('financial.store.revenue.roleBasedAccess')}
            </CardTitle>
            <CardDescription>
              {t('financial.store.revenue.roleBasedAccessDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">
                {t('financial.store.revenue.role')}
              </p>
              <p className="text-lg font-semibold">
                {getRoleLabel(monetizationSummary.role, t)}
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">
                {t('financial.store.revenue.platformRevenue')}
              </p>
              <p className="text-sm font-medium">
                {monetizationSummary.visibility?.can_view_platform_revenue
                  ? formatCurrency(
                      monetizationSummary.metrics?.platform_revenue || 0,
                      monetizationSummary.metrics?.currency || 'IRR'
                    )
                  : t('financial.store.revenue.hidden')}
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">
                {t('financial.store.revenue.schoolRevenue')}
              </p>
              <p className="text-sm font-medium">
                {monetizationSummary.visibility?.can_view_store_revenue
                  ? formatCurrency(
                      monetizationSummary.metrics?.school_net_revenue ||
                        monetizationSummary.metrics?.teacher_gross_revenue ||
                        0,
                      monetizationSummary.metrics?.currency || 'IRR'
                    )
                  : t('financial.store.revenue.hidden')}
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">
                {t('financial.store.revenue.teacherRevenue')}
              </p>
              <p className="text-sm font-medium">
                {monetizationSummary.visibility?.can_view_teacher_revenue
                  ? formatCurrency(
                      monetizationSummary.metrics?.teacher_payout_revenue ||
                        monetizationSummary.metrics?.teacher_payout ||
                        0,
                      monetizationSummary.metrics?.currency || 'IRR'
                    )
                  : t('financial.store.revenue.hidden')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {!canSeeAnyRevenue ? (
        <Card>
          <CardHeader>
            <CardTitle>{t('financial.store.revenue.revenueHidden')}</CardTitle>
            <CardDescription>
              {t('financial.store.revenue.revenueHiddenDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {monetizationSummary?.metrics?.message ||
                t('financial.store.revenue.revenueHiddenPolicy')}
            </p>
          </CardContent>
        </Card>
      ) : null}

      {canSeeAnyRevenue && teacherRevenueBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              {t('financial.store.revenue.teacherRevenueBreakdown')}
            </CardTitle>
            <CardDescription>
              {t('financial.store.revenue.teacherRevenueBreakdownDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('financial.store.revenue.teacher')}</TableHead>
                  <TableHead className="text-end">
                    {t('financial.store.revenue.payments')}
                  </TableHead>
                  <TableHead className="text-end">
                    {t('financial.store.revenue.teacherRevenue')}
                  </TableHead>
                  <TableHead className="text-end">
                    {t('financial.store.revenue.visibility')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teacherRevenueBreakdown.map((row: any) => (
                  <TableRow key={row.teacher_id}>
                    <TableCell className="font-medium">
                      {row.teacher_name ||
                        `${t('financial.store.revenue.teacher')} #${row.teacher_id}`}
                    </TableCell>
                    <TableCell className="text-end">
                      <Badge variant="secondary">
                        {row.payment_count || 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-end font-medium">
                      {row.revenue_visible === false
                        ? t('financial.store.revenue.hidden')
                        : formatCurrency(
                            Number(row.payout_revenue || 0),
                            revenueCurrency
                          )}
                    </TableCell>
                    <TableCell className="text-end">
                      {monetizationSummary?.role === 'MANAGER' ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            try {
                              await apiClient.setTeacherRevenueVisibility({
                                academy_id: currentAcademy.id,
                                teacher_id: Number(row.teacher_id),
                                is_visible: !(row.revenue_visible === false)
                              });
                              await loadData();
                            } catch (error: any) {
                              toast.error(
                                error?.message ||
                                  t(
                                    'financial.store.revenue.visibilityUpdateFailed'
                                  )
                              );
                            }
                          }}
                        >
                          {row.revenue_visible === false ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                          <span className="ml-2">
                            {row.revenue_visible === false
                              ? t('financial.store.revenue.showAmount')
                              : t('financial.store.revenue.hideAmount')}
                          </span>
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Detailed View */}
      <Tabs defaultValue="payments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payments">
            {t('financial.store.revenue.allPayments')}
          </TabsTrigger>
          <TabsTrigger value="courses">
            {t('financial.store.revenue.revenueByCourse')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {t('financial.store.revenue.allPayments')}
                  </CardTitle>
                  <CardDescription>
                    {t('financial.store.revenue.paymentsDescription')}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('financial.store.payments.date')}</TableHead>
                    <TableHead>
                      {t('financial.store.payments.student')}
                    </TableHead>
                    <TableHead>
                      {t('financial.store.payments.course')}
                    </TableHead>
                    <TableHead className="text-end">
                      {t('financial.store.payments.amount')}
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
                        {t('financial.store.payments.noPayments')}
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
                          {payment.profile?.display_name ||
                            t('financial.store.revenue.unknownStudent')}
                        </TableCell>
                        <TableCell>
                          {payment.course?.title ||
                            t('financial.store.revenue.unknownCourse')}
                        </TableCell>
                        <TableCell className="text-end font-medium">
                          {canSeeAnyRevenue
                            ? formatCurrency(payment.amount, payment.currency)
                            : t('financial.store.revenue.hidden')}
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
                {t('financial.store.revenue.revenueByCourse')}
              </CardTitle>
              <CardDescription>
                {t('financial.store.revenue.revenueByCourseDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      {t('financial.store.payments.course')}
                    </TableHead>
                    <TableHead className="text-end">
                      {t('financial.store.revenue.payments')}
                    </TableHead>
                    <TableHead className="text-end">
                      {t('financial.store.revenue.totalRevenue')}
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
                        {t('financial.store.revenue.noCourseRevenue')}
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
                          <TableCell className="text-end">
                            <Badge variant="secondary">{course.count}</Badge>
                          </TableCell>
                          <TableCell className="text-end font-medium">
                            {canSeeAnyRevenue
                              ? formatCurrency(course.total, course.currency)
                              : t('financial.store.revenue.hidden')}
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
