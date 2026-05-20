'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  BookOpen,
  Eye,
  EyeOff
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useCurrentAcademy } from '@/hooks/useCurrentAcademy';
import { useFinancialFilters } from '@/hooks/useFinancialFilters';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { useTranslation } from '@/lib/i18n/hooks';
import { getRoleLabel } from '@/lib/i18n/role-label';
import { FinancialFilterBar } from '@/components/financial/FinancialFilterBar';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { PageHeader } from '@/components/shared/PageHeader';
import type { AcademyRevenueData, AcademyPayment } from '@/types/financial';

interface RevenueVisibility {
  can_view_store_revenue: boolean;
  can_view_teacher_revenue: boolean;
  can_view_platform_revenue: boolean;
}

interface TeacherRevenueRow {
  teacher_id: number;
  teacher_name?: string;
  payment_count?: number;
  payout_revenue?: number;
  revenue_visible?: boolean;
}

interface RevenueMetrics {
  currency: string;
  school_net_revenue?: number;
  teacher_gross_revenue?: number;
  teacher_payout_revenue?: number;
  teacher_payout?: number;
  platform_revenue?: number;
  message?: string;
  teacher_revenue_breakdown?: TeacherRevenueRow[];
}

interface MonetizationSummary {
  role: string;
  visibility: RevenueVisibility;
  metrics: RevenueMetrics;
}

interface CourseRevenueBucket {
  course: string;
  count: number;
  total: number;
  currency: string;
}

export default function StoreRevenuePage() {
  const { t } = useTranslation();
  const currentAcademy = useCurrentAcademy();
  const formatCurrency = useFormatCurrency();
  const {
    selectedYear,
    selectedMonth,
    setSelectedYear,
    setSelectedMonth,
    dateRange,
    years,
    formatDate
  } = useFinancialFilters();

  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<AcademyRevenueData | null>(
    null
  );
  const [monetizationSummary, setMonetizationSummary] =
    useState<MonetizationSummary | null>(null);

  const loadData = useCallback(async () => {
    if (!currentAcademy?.id) return;

    setLoading(true);
    try {
      const params = {
        academy_id: currentAcademy.id,
        start_date: dateRange.startIso,
        end_date: dateRange.endIso
      };
      const [revenue, summary] = await Promise.all([
        apiClient.getAcademyRevenueFromPayments(
          currentAcademy.id,
          dateRange.startIso,
          dateRange.endIso
        ),
        apiClient.getMonetizationSummary(params)
      ]);
      setRevenueData(revenue as AcademyRevenueData);
      setMonetizationSummary(summary as MonetizationSummary);
    } catch (err) {
      ErrorHandler.handleApiError(err);
    } finally {
      setLoading(false);
    }
  }, [currentAcademy?.id, dateRange]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const payments: AcademyPayment[] = revenueData?.payments ?? [];
  const vis = monetizationSummary?.visibility;
  const metrics = monetizationSummary?.metrics;
  const canViewRevenue = Boolean(vis?.can_view_store_revenue);
  const canViewTeacherRevenue = Boolean(vis?.can_view_teacher_revenue);
  const canViewPlatformRevenue = Boolean(vis?.can_view_platform_revenue);
  const canSeeAnyRevenue =
    canViewRevenue || canViewTeacherRevenue || canViewPlatformRevenue;
  const revenueCurrency = metrics?.currency ?? revenueData?.currency ?? 'IRR';

  const primaryRevenue = useMemo(() => {
    if (canViewRevenue) {
      return {
        label: t('financial.store.revenue.schoolRevenue'),
        amount: Number(
          metrics?.school_net_revenue ?? metrics?.teacher_gross_revenue ?? 0
        )
      };
    }
    if (canViewTeacherRevenue) {
      return {
        label: t('financial.store.revenue.teacherRevenue'),
        amount: Number(
          metrics?.teacher_payout_revenue ?? metrics?.teacher_payout ?? 0
        )
      };
    }
    if (canViewPlatformRevenue) {
      return {
        label: t('financial.store.revenue.platformRevenue'),
        amount: Number(metrics?.platform_revenue ?? 0)
      };
    }
    return { label: t('financial.store.revenue.roleBasedRevenue'), amount: 0 };
  }, [
    canViewRevenue,
    canViewTeacherRevenue,
    canViewPlatformRevenue,
    metrics,
    t
  ]);

  const paymentsByCourse = useMemo((): CourseRevenueBucket[] => {
    const grouped = new Map<string, CourseRevenueBucket>();
    for (const p of payments) {
      const key = String(p.course?.title ?? 'unknown');
      const existing = grouped.get(key) ?? {
        course: p.course?.title ?? t('financial.store.revenue.unknownCourse'),
        count: 0,
        total: 0,
        currency: p.currency
      };
      grouped.set(key, {
        ...existing,
        count: existing.count + 1,
        total: existing.total + (p.amount ?? 0)
      });
    }
    return Array.from(grouped.values()).sort((a, b) => b.total - a.total);
  }, [payments, t]);

  const teacherRows: TeacherRevenueRow[] = useMemo(
    () =>
      Array.isArray(metrics?.teacher_revenue_breakdown)
        ? metrics!.teacher_revenue_breakdown
        : [],
    [metrics]
  );

  async function toggleTeacherVisibility(row: TeacherRevenueRow) {
    if (!currentAcademy?.id) return;
    try {
      await apiClient.setTeacherRevenueVisibility({
        academy_id: currentAcademy.id,
        teacher_id: row.teacher_id,
        is_visible: row.revenue_visible === false
      });
      await loadData();
    } catch (err) {
      ErrorHandler.handleApiError(err);
    }
  }

  if (!currentAcademy) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <p className="text-muted-foreground">
          {t('financial.store.revenue.noStore')}
        </p>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner message={t('financial.store.revenue.loading')} />;
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title={t('financial.store.revenue.title')}
        description={`${currentAcademy.name} — ${t('financial.store.revenue.description')}`}
      />

      <FinancialFilterBar
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        years={years}
        onYearChange={setSelectedYear}
        onMonthChange={setSelectedMonth}
      />

      {/* Summary Cards */}
      {revenueData && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {primaryRevenue.label}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {canSeeAnyRevenue
                  ? formatCurrency(primaryRevenue.amount, revenueCurrency)
                  : '—'}
              </p>
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
              <p className="text-2xl font-bold">{payments.length}</p>
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
              <p className="text-2xl font-bold">
                {revenueData.payment_count > 0
                  ? formatCurrency(
                      revenueData.total_revenue / revenueData.payment_count,
                      revenueData.currency
                    )
                  : formatCurrency(0, revenueData.currency)}
              </p>
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
              <p className="text-2xl font-bold">{paymentsByCourse.length}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('financial.store.revenue.coursesWithPayments')}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Role-based access breakdown */}
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
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">
                {t('financial.store.revenue.role')}
              </p>
              <p className="text-lg font-semibold">
                {getRoleLabel(monetizationSummary.role, t)}
              </p>
            </div>
            {[
              {
                key: 'platformRevenue',
                visible: vis?.can_view_platform_revenue,
                value: metrics?.platform_revenue
              },
              {
                key: 'schoolRevenue',
                visible: vis?.can_view_store_revenue,
                value:
                  metrics?.school_net_revenue ?? metrics?.teacher_gross_revenue
              },
              {
                key: 'teacherRevenue',
                visible: vis?.can_view_teacher_revenue,
                value:
                  metrics?.teacher_payout_revenue ?? metrics?.teacher_payout
              }
            ].map(({ key, visible, value }) => (
              <div key={key} className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground">
                  {t(`financial.store.revenue.${key}`)}
                </p>
                <p className="mt-1 text-sm font-medium">
                  {visible
                    ? formatCurrency(Number(value ?? 0), revenueCurrency)
                    : '—'}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Revenue hidden notice */}
      {!canSeeAnyRevenue && (
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="text-amber-700 dark:text-amber-400">
              {t('financial.store.revenue.revenueHidden')}
            </CardTitle>
            <CardDescription>
              {t('financial.store.revenue.revenueHiddenDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {metrics?.message ??
                t('financial.store.revenue.revenueHiddenPolicy')}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Teacher revenue breakdown */}
      {canSeeAnyRevenue && teacherRows.length > 0 && (
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
                {teacherRows.map((row) => (
                  <TableRow key={row.teacher_id}>
                    <TableCell className="font-medium">
                      {row.teacher_name ??
                        `${t('financial.store.revenue.teacher')} #${row.teacher_id}`}
                    </TableCell>
                    <TableCell className="text-end">
                      <Badge variant="secondary">
                        {row.payment_count ?? 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-end font-medium">
                      {row.revenue_visible === false
                        ? '—'
                        : formatCurrency(
                            Number(row.payout_revenue ?? 0),
                            revenueCurrency
                          )}
                    </TableCell>
                    <TableCell className="text-end">
                      {monetizationSummary?.role === 'MANAGER' ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleTeacherVisibility(row)}
                        >
                          {row.revenue_visible === false ? (
                            <Eye className="mr-1.5 h-4 w-4" />
                          ) : (
                            <EyeOff className="mr-1.5 h-4 w-4" />
                          )}
                          {row.revenue_visible === false
                            ? t('financial.store.revenue.showAmount')
                            : t('financial.store.revenue.hideAmount')}
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Payments / By-course tabs */}
      <Tabs defaultValue="payments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payments">
            {t('financial.store.revenue.allPayments')}
          </TabsTrigger>
          <TabsTrigger value="courses">
            {t('financial.store.revenue.revenueByCourse')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>{t('financial.store.revenue.allPayments')}</CardTitle>
              <CardDescription>
                {t('financial.store.revenue.paymentsDescription')}
              </CardDescription>
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
                        className="py-6 text-center text-muted-foreground"
                      >
                        {t('financial.store.payments.noPayments')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    payments.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="whitespace-nowrap text-sm">
                          {formatDate(p.created_at)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {p.profile?.display_name ?? '—'}
                        </TableCell>
                        <TableCell>{p.course?.title ?? '—'}</TableCell>
                        <TableCell className="text-end font-medium">
                          {canSeeAnyRevenue
                            ? formatCurrency(p.amount, p.currency)
                            : '—'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses">
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
                        className="py-6 text-center text-muted-foreground"
                      >
                        {t('financial.store.revenue.noCourseRevenue')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paymentsByCourse.map((c, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">
                          {c.course}
                        </TableCell>
                        <TableCell className="text-end">
                          <Badge variant="secondary">{c.count}</Badge>
                        </TableCell>
                        <TableCell className="text-end font-medium">
                          {canSeeAnyRevenue
                            ? formatCurrency(c.total, c.currency)
                            : '—'}
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
