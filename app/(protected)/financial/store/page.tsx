'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, TrendingUp, TrendingDown, Users } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useCurrentAcademy } from '@/hooks/useCurrentAcademy';
import { useFinancialFilters } from '@/hooks/useFinancialFilters';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { useTranslation } from '@/lib/i18n/hooks';
import { FinancialFilterBar } from '@/components/financial/FinancialFilterBar';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { PageHeader } from '@/components/shared/PageHeader';
import type {
  AcademyFinancialOverview,
  AcademyPayment
} from '@/types/financial';

export default function StoreFinancialPage() {
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
  const [overview, setOverview] = useState<AcademyFinancialOverview | null>(
    null
  );
  const [payments, setPayments] = useState<AcademyPayment[]>([]);

  const loadData = useCallback(async () => {
    if (!currentAcademy?.id) return;

    setLoading(true);
    try {
      const [overviewData, revenueData] = await Promise.all([
        apiClient.getAcademyFinancialOverview(
          currentAcademy.id,
          dateRange.startIso,
          dateRange.endIso
        ),
        apiClient.getAcademyRevenueFromPayments(
          currentAcademy.id,
          dateRange.startIso,
          dateRange.endIso
        )
      ]);
      setOverview(overviewData as AcademyFinancialOverview);
      setPayments((revenueData?.payments ?? []) as AcademyPayment[]);
    } catch (err) {
      ErrorHandler.handleApiError(err);
    } finally {
      setLoading(false);
    }
  }, [currentAcademy?.id, dateRange]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!currentAcademy) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <p className="text-muted-foreground">
          {t('financial.store.overview.noStore')}
        </p>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner message={t('financial.store.overview.loading')} />;
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title={t('financial.store.overview.title')}
        description={`${currentAcademy.name} — ${t('financial.store.overview.description')}`}
      />

      <FinancialFilterBar
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        years={years}
        onYearChange={setSelectedYear}
        onMonthChange={setSelectedMonth}
      />

      {/* Summary Cards */}
      {overview && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('financial.store.overview.totalRevenue')}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {formatCurrency(
                  overview.revenue.total,
                  overview.revenue.currency
                )}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('financial.store.overview.fromPayments', {
                  count: overview.revenue.from_payments
                })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('financial.store.overview.totalCost')}
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-destructive">
                {formatCurrency(overview.cost.total, overview.cost.currency)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('financial.store.overview.platformCosts')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('financial.store.overview.totalProfit')}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(
                  overview.profit.total,
                  overview.revenue.currency
                )}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('financial.store.overview.profitMargin', {
                  margin: overview.profit.margin
                })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('financial.store.overview.enrollments')}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {overview.statistics.enrollments}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('financial.store.overview.courses', {
                  count: overview.statistics.courses
                })}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="payments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payments">
            {t('financial.store.overview.studentPayments')}
          </TabsTrigger>
          <TabsTrigger value="courses">
            {t('financial.store.overview.courseRevenue')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>
                {t('financial.store.overview.studentPayments')}
              </CardTitle>
              <CardDescription>
                {t('financial.store.overview.paymentsDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('financial.store.overview.date')}</TableHead>
                    <TableHead>
                      {t('financial.store.overview.student')}
                    </TableHead>
                    <TableHead>
                      {t('financial.store.overview.course')}
                    </TableHead>
                    <TableHead className="text-end">
                      {t('financial.store.overview.amount')}
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
                        {t('financial.store.overview.noPayments')}
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
                          {formatCurrency(p.amount, p.currency)}
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
                {t('financial.store.overview.courseRevenue')}
              </CardTitle>
              <CardDescription>
                {t('financial.store.overview.courseRevenueDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="py-8 text-center text-muted-foreground">
                {t('financial.store.overview.comingSoon')}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
