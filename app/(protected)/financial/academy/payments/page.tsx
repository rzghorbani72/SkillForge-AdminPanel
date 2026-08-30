'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  DollarSign,
  CreditCard,
  TrendingUp,
  Download,
  Lock
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useCurrentAcademy } from '@/hooks/useCurrentAcademy';
import { useFinancialFilters } from '@/hooks/useFinancialFilters';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { FinancialFilterBar } from '@/components/financial/FinancialFilterBar';
import { StatusBadge } from '@/components/shared/status-badge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { PageHeader } from '@/components/shared/PageHeader';
import type {
  AcademyRevenueData,
  SettlementStatement,
  ReconciliationData,
  AcademyPayment
} from '@/types/financial';
import { toast } from 'react-toastify';

export default function StorePaymentsPage() {
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
    formatDate
  } = useFinancialFilters();

  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<AcademyRevenueData | null>(
    null
  );
  const [statement, setStatement] = useState<SettlementStatement | null>(null);
  const [reconciliation, setReconciliation] =
    useState<ReconciliationData | null>(null);
  const [exporting, setExporting] = useState(false);
  const [locking, setLocking] = useState(false);

  const loadData = useCallback(async () => {
    if (!currentAcademy?.id) return;

    setLoading(true);
    try {
      const params = {
        academy_id: currentAcademy.id,
        start_date: dateRange.startIso,
        end_date: dateRange.endIso
      };

      const [revenue, settlement, reconciliationData] = await Promise.all([
        apiClient.getAcademyRevenueFromPayments(
          currentAcademy.id,
          dateRange.startIso,
          dateRange.endIso
        ),
        apiClient.getIranSettlementStatement(params),
        apiClient.getIranSettlementReconciliation(params)
      ]);

      setRevenueData(revenue as AcademyRevenueData);
      setStatement(settlement as SettlementStatement);
      setReconciliation(reconciliationData as ReconciliationData);
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

  const paymentStats = useMemo(() => {
    const completed = payments.filter((p) => p.status === 'PAID').length;
    const pending = payments.filter((p) => p.status === 'PENDING').length;
    const failed = payments.filter((p) => p.status === 'FAILED').length;
    return { completed, pending, failed };
  }, [payments]);

  const paymentsByMethod = useMemo(() => {
    const grouped = new Map<
      string,
      { method: string; count: number; total: number; currency: string }
    >();
    for (const p of payments) {
      const key = p.method ?? 'UNKNOWN';
      const existing = grouped.get(key) ?? {
        method: key,
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
  }, [payments]);

  const vatRate = statement?.totals?.vat_rate ?? 0.09;
  const vatPercentLabel = formatNumber(Math.round(vatRate * 100));

  async function handleExport() {
    if (!currentAcademy?.id) return;
    setExporting(true);
    try {
      const blob = await apiClient.exportIranSettlementCsv({
        academy_id: currentAcademy.id,
        start_date: dateRange.startIso,
        end_date: dateRange.endIso
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'settlement-statement.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      ErrorHandler.handleApiError(err);
    } finally {
      setExporting(false);
    }
  }

  async function handleLockPeriod() {
    if (!currentAcademy?.id) return;
    setLocking(true);
    try {
      const lockUntil = new Date(
        selectedYear,
        selectedMonth != null ? selectedMonth : 11,
        28,
        23,
        59,
        59
      );
      await apiClient.lockIranFinancialPeriod({
        academy_id: currentAcademy.id,
        lock_until: lockUntil.toISOString()
      });
      toast.success(t('financial.store.payments.lockedSuccess'));
    } catch (err) {
      ErrorHandler.handleApiError(err);
    } finally {
      setLocking(false);
    }
  }

  if (!currentAcademy) {
    return (
      <div className="flex flex-1 items-center justify-center p-4 sm:p-6">
        <p className="text-muted-foreground">
          {t('financial.store.payments.noStore')}
        </p>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner message={t('financial.store.payments.loading')} />;
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PageHeader
        title={t('financial.store.payments.title')}
        description={`${currentAcademy.name} — ${t('financial.store.payments.description')}`}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={handleLockPeriod}
          disabled={locking}
        >
          <Lock className="mr-2 h-4 w-4" />
          {t('financial.store.payments.lockPeriod')}
        </Button>
        <Button size="sm" onClick={handleExport} disabled={exporting}>
          <Download className="mr-2 h-4 w-4" />
          {t('financial.store.payments.exportCsv')}
        </Button>
      </PageHeader>

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
                {t('financial.store.payments.totalRevenue')}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {formatCurrency(
                  revenueData.total_revenue,
                  revenueData.currency
                )}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('financial.store.payments.fromPayments', {
                  count: revenueData.payment_count
                })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('financial.store.payments.completed')}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatNumber(paymentStats.completed)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('financial.store.payments.successfulPayments')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('financial.store.payments.pending')}
              </CardTitle>
              <CreditCard className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {formatNumber(paymentStats.pending)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('financial.store.payments.awaitingProcessing')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('financial.store.payments.failed')}
              </CardTitle>
              <CreditCard className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-destructive">
                {formatNumber(paymentStats.failed)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('financial.store.payments.failedTransactions')}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Settlement Statement */}
      {statement?.totals && (
        <Card>
          <CardHeader>
            <CardTitle>
              {t('financial.store.payments.settlementTitle')}
            </CardTitle>
            <CardDescription>
              {t('financial.store.payments.settlementDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
              {[
                { key: 'gross', value: statement.totals.gross_amount },
                { key: 'platformFee', value: statement.totals.platform_fee },
                {
                  key: 'vatIran',
                  value: statement.totals.tax_vat_amount,
                  suffix: ` (${vatPercentLabel}٪)`
                },
                {
                  key: 'teacherPayout',
                  value: statement.totals.teacher_payout
                },
                { key: 'schoolNet', value: statement.totals.school_net_revenue }
              ].map(({ key, value, suffix = '' }) => (
                <div key={key} className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">
                    {t(`financial.store.payments.${key}`)}
                    {suffix}
                  </p>
                  <p className="mt-1 text-base font-semibold">
                    {formatCurrency(value, statement.totals.currency)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reconciliation */}
      {reconciliation && (
        <Card>
          <CardHeader>
            <CardTitle>
              {t('financial.store.payments.reconciliationTitle')}
            </CardTitle>
            <CardDescription>
              {t('financial.store.payments.reconciliationDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                {
                  key: 'paidPayments',
                  value: reconciliation.total_paid_payments
                },
                {
                  key: 'matchedCallbacks',
                  value: reconciliation.matched_successful_callbacks
                },
                {
                  key: 'missingCallbacks',
                  value: reconciliation.missing_successful_callbacks
                },
                {
                  key: 'orphanCallbacks',
                  value: reconciliation.orphan_successful_callbacks
                }
              ].map(({ key, value }) => (
                <div key={key} className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">
                    {t(`financial.store.payments.${key}`)}
                  </p>
                  <p className="mt-1 text-base font-semibold">
                    {formatNumber(value ?? 0)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payments by Method */}
      {paymentsByMethod.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              {t('financial.store.payments.paymentsByMethod')}
            </CardTitle>
            <CardDescription>
              {t('financial.store.payments.paymentsByMethodDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    {t('financial.store.payments.paymentMethod')}
                  </TableHead>
                  <TableHead className="text-end">
                    {t('financial.store.payments.count')}
                  </TableHead>
                  <TableHead className="text-end">
                    {t('financial.store.payments.totalAmount')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentsByMethod.map((m) => (
                  <TableRow key={m.method}>
                    <TableCell className="font-medium">{m.method}</TableCell>
                    <TableCell className="text-end">
                      <Badge variant="secondary">{formatNumber(m.count)}</Badge>
                    </TableCell>
                    <TableCell className="text-end font-medium">
                      {formatCurrency(m.total, m.currency)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* All Payments */}
      <Card>
        <CardHeader>
          <CardTitle>{t('financial.store.payments.allPayments')}</CardTitle>
          <CardDescription>
            {t('financial.store.payments.allPaymentsDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="table-h-scroll">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('financial.store.payments.date')}</TableHead>
                <TableHead>{t('financial.store.payments.student')}</TableHead>
                <TableHead>{t('financial.store.payments.course')}</TableHead>
                <TableHead>{t('financial.store.payments.method')}</TableHead>
                <TableHead>{t('financial.store.payments.status')}</TableHead>
                <TableHead className="text-end">
                  {t('financial.store.payments.vat')}
                </TableHead>
                <TableHead className="text-end">
                  {t('financial.store.payments.platformFee')}
                </TableHead>
                <TableHead className="text-end">
                  {t('financial.store.payments.teacherPayout')}
                </TableHead>
                <TableHead className="text-end">
                  {t('financial.store.payments.schoolNet')}
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
                    colSpan={10}
                    className="py-8 text-center text-muted-foreground"
                  >
                    {t('financial.store.payments.noPayments')}
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((p) => {
                  const schoolNet =
                    p.school_net_revenue ??
                    Math.max(
                      0,
                      (p.amount ?? 0) -
                        (p.platform_fee ?? 0) -
                        (p.instructor_fee ?? 0) -
                        (p.tax_vat_amount ?? 0)
                    );

                  return (
                    <TableRow key={p.id}>
                      <TableCell className="whitespace-nowrap text-sm">
                        {formatDate(p.created_at)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {p.profile?.display_name ?? '—'}
                      </TableCell>
                      <TableCell className="max-w-[180px] truncate">
                        {p.course?.title ?? '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{p.method ?? '—'}</Badge>
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          status={
                            p.status === 'PAID'
                              ? 'success'
                              : p.status === 'PENDING'
                                ? 'pending'
                                : 'failed'
                          }
                          label={p.status}
                        />
                      </TableCell>
                      <TableCell className="text-end">
                        {formatCurrency(p.tax_vat_amount ?? 0, p.currency)}
                      </TableCell>
                      <TableCell className="text-end">
                        {formatCurrency(p.platform_fee ?? 0, p.currency)}
                      </TableCell>
                      <TableCell className="text-end">
                        {formatCurrency(p.instructor_fee ?? 0, p.currency)}
                      </TableCell>
                      <TableCell className="text-end">
                        {formatCurrency(schoolNet, p.currency)}
                      </TableCell>
                      <TableCell className="text-end font-semibold">
                        {formatCurrency(p.amount, p.currency)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
