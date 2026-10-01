'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Download, Lock } from 'lucide-react';
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
import type {
  AcademyRevenueData,
  SettlementStatement,
  ReconciliationData,
  AcademyPayment,
} from '@/types/financial';
import { toast } from 'react-toastify';
import { AllPaymentsCard } from './_components/all-payments-card';
import { ReconciliationCard } from './_components/reconciliation-card';
import { PaymentsSummaryCards } from './_components/payments-summary-cards';

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
    formatDate,
  } = useFinancialFilters();

  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<AcademyRevenueData | null>(null);
  const [statement, setStatement] = useState<SettlementStatement | null>(null);
  const [reconciliation, setReconciliation] = useState<ReconciliationData | null>(null);
  const [exporting, setExporting] = useState(false);
  const [locking, setLocking] = useState(false);

  const loadData = useCallback(async () => {
    if (!currentAcademy?.id) return;

    setLoading(true);
    try {
      const params = {
        academy_id: currentAcademy.id,
        start_date: dateRange.startIso,
        end_date: dateRange.endIso,
      };

      const [revenue, settlement, reconciliationData] = await Promise.all([
        apiClient.getAcademyRevenueFromPayments(
          currentAcademy.id,
          dateRange.startIso,
          dateRange.endIso,
        ),
        apiClient.getIranSettlementStatement(params),
        apiClient.getIranSettlementReconciliation(params),
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
        currency: p.currency,
      };
      grouped.set(key, {
        ...existing,
        count: existing.count + 1,
        total: existing.total + (p.amount ?? 0),
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
        end_date: dateRange.endIso,
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
        59,
      );
      await apiClient.lockIranFinancialPeriod({
        academy_id: currentAcademy.id,
        lock_until: lockUntil.toISOString(),
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
        <p className="text-muted-foreground">{t('financial.store.payments.noStore')}</p>
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
        <Button variant="outline" size="sm" onClick={handleLockPeriod} disabled={locking}>
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
        <PaymentsSummaryCards
          formatCurrency={formatCurrency}
          formatNumber={formatNumber}
          paymentStats={paymentStats}
          revenueData={revenueData}
        />
      )}

      {/* Settlement Statement */}
      {statement?.totals && (
        <Card>
          <CardHeader>
            <CardTitle>{t('financial.store.payments.settlementTitle')}</CardTitle>
            <CardDescription>{t('financial.store.payments.settlementDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
              {[
                { key: 'gross', value: statement.totals.gross_amount },
                { key: 'platformFee', value: statement.totals.platform_fee },
                {
                  key: 'vatIran',
                  value: statement.totals.tax_vat_amount,
                  suffix: ` (${vatPercentLabel}٪)`,
                },
                {
                  key: 'teacherPayout',
                  value: statement.totals.teacher_payout,
                },
                { key: 'schoolNet', value: statement.totals.school_net_revenue },
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
        <ReconciliationCard formatNumber={formatNumber} reconciliation={reconciliation} />
      )}

      {/* Payments by Method */}
      {paymentsByMethod.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('financial.store.payments.paymentsByMethod')}</CardTitle>
            <CardDescription>
              {t('financial.store.payments.paymentsByMethodDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('financial.store.payments.paymentMethod')}</TableHead>
                  <TableHead className="text-end">{t('financial.store.payments.count')}</TableHead>
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
      <AllPaymentsCard
        formatCurrency={formatCurrency}
        formatDate={formatDate}
        payments={payments}
      />
    </div>
  );
}
