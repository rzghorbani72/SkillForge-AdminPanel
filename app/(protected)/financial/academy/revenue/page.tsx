'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useCurrentAcademy } from '@/hooks/useCurrentAcademy';
import { useFinancialFilters } from '@/hooks/useFinancialFilters';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { FinancialFilterBar } from '@/components/financial/FinancialFilterBar';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { PageHeader } from '@/components/shared/PageHeader';
import type { AcademyRevenueData, AcademyPayment } from '@/types/financial';
import { RevenueTabs } from './_components/revenue-tabs';
import { TeacherRevenueBreakdownCard } from './_components/teacher-revenue-breakdown-card';
import { RoleBasedAccessCard } from './_components/role-based-access-card';
import { RevenueSummaryCards } from './_components/revenue-summary-cards';
import { TeacherRevenueRow, MonetizationSummary, CourseRevenueBucket } from './_lib/page-helpers';

export default function StoreRevenuePage() {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const currentAcademy = useCurrentAcademy();
  const formatCurrency = useFormatCurrency();
  const {
    selectedYear,
    selectedMonth,
    setSelectedYear,
    setSelectedMonth,
    dateRange,
    years,
    formatDate,
  } = useFinancialFilters();

  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<AcademyRevenueData | null>(null);
  const [monetizationSummary, setMonetizationSummary] = useState<MonetizationSummary | null>(null);

  const loadData = useCallback(async () => {
    if (!currentAcademy?.id) return;

    setLoading(true);
    try {
      const params = {
        academy_id: currentAcademy.id,
        start_date: dateRange.startIso,
        end_date: dateRange.endIso,
      };
      const [revenue, summary] = await Promise.all([
        apiClient.getAcademyRevenueFromPayments(
          currentAcademy.id,
          dateRange.startIso,
          dateRange.endIso,
        ),
        apiClient.getMonetizationSummary(params),
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
  const canSeeAnyRevenue = canViewRevenue || canViewTeacherRevenue || canViewPlatformRevenue;
  const revenueCurrency = metrics?.currency ?? revenueData?.currency ?? 'IRR';

  const primaryRevenue = useMemo(() => {
    if (canViewRevenue) {
      return {
        label: t('financial.store.revenue.schoolRevenue'),
        amount: Number(metrics?.school_net_revenue ?? metrics?.teacher_gross_revenue ?? 0),
      };
    }
    if (canViewTeacherRevenue) {
      return {
        label: t('financial.store.revenue.teacherRevenue'),
        amount: Number(metrics?.teacher_payout_revenue ?? metrics?.teacher_payout ?? 0),
      };
    }
    if (canViewPlatformRevenue) {
      return {
        label: t('financial.store.revenue.platformRevenue'),
        amount: Number(metrics?.platform_revenue ?? 0),
      };
    }
    return { label: t('financial.store.revenue.roleBasedRevenue'), amount: 0 };
  }, [canViewRevenue, canViewTeacherRevenue, canViewPlatformRevenue, metrics, t]);

  const paymentsByCourse = useMemo((): CourseRevenueBucket[] => {
    const grouped = new Map<string, CourseRevenueBucket>();
    for (const p of payments) {
      const key = String(p.course?.title ?? 'unknown');
      const existing = grouped.get(key) ?? {
        course: p.course?.title ?? t('financial.store.revenue.unknownCourse'),
        count: 0,
        total: 0,
        currency: p.currency,
      };
      grouped.set(key, {
        ...existing,
        count: existing.count + 1,
        total: existing.total + (p.amount ?? 0),
      });
    }
    return Array.from(grouped.values()).sort((a, b) => b.total - a.total);
  }, [payments, t]);

  const teacherRows: TeacherRevenueRow[] = useMemo(
    () =>
      Array.isArray(metrics?.teacher_revenue_breakdown) ? metrics!.teacher_revenue_breakdown : [],
    [metrics],
  );

  async function toggleTeacherVisibility(row: TeacherRevenueRow) {
    if (!currentAcademy?.id) return;
    try {
      await apiClient.setTeacherRevenueVisibility({
        academy_id: currentAcademy.id,
        teacher_id: row.teacher_id,
        is_visible: row.revenue_visible === false,
      });
      await loadData();
    } catch (err) {
      ErrorHandler.handleApiError(err);
    }
  }

  if (!currentAcademy) {
    return (
      <div className="flex flex-1 items-center justify-center p-4 sm:p-6">
        <p className="text-muted-foreground">{t('financial.store.revenue.noStore')}</p>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner message={t('financial.store.revenue.loading')} />;
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
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
        <RevenueSummaryCards
          canSeeAnyRevenue={canSeeAnyRevenue}
          formatCurrency={formatCurrency}
          formatNumber={formatNumber}
          payments={payments}
          paymentsByCourse={paymentsByCourse}
          primaryRevenue={primaryRevenue}
          revenueCurrency={revenueCurrency}
          revenueData={revenueData}
        />
      )}

      {/* Role-based access breakdown */}
      {monetizationSummary && (
        <RoleBasedAccessCard
          formatCurrency={formatCurrency}
          metrics={metrics}
          monetizationSummary={monetizationSummary}
          revenueCurrency={revenueCurrency}
          vis={vis}
        />
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
              {metrics?.message ?? t('financial.store.revenue.revenueHiddenPolicy')}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Teacher revenue breakdown */}
      {canSeeAnyRevenue && teacherRows.length > 0 && (
        <TeacherRevenueBreakdownCard
          formatCurrency={formatCurrency}
          formatNumber={formatNumber}
          monetizationSummary={monetizationSummary}
          revenueCurrency={revenueCurrency}
          teacherRows={teacherRows}
          toggleTeacherVisibility={toggleTeacherVisibility}
        />
      )}

      {/* Payments / By-course tabs */}
      <RevenueTabs
        canSeeAnyRevenue={canSeeAnyRevenue}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
        formatNumber={formatNumber}
        payments={payments}
        paymentsByCourse={paymentsByCourse}
      />
    </div>
  );
}
