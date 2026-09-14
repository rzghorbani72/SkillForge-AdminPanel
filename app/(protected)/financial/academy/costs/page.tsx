'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TrendingDown, TrendingUp, DollarSign, Tag } from 'lucide-react';
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
import type { StoreFinancialRecord } from '@/types/api';

interface CategoryBucket {
  category: string;
  count: number;
  totalCost: number;
  currency: string;
}

export default function StoreCostsPage() {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const currentAcademy = useCurrentAcademy();
  const formatCurrency = useFormatCurrency();
  const { selectedYear, selectedMonth, setSelectedYear, setSelectedMonth, years, formatDate } =
    useFinancialFilters();

  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<StoreFinancialRecord[]>([]);

  const loadData = useCallback(async () => {
    if (!currentAcademy?.id) return;

    setLoading(true);
    try {
      const data = await apiClient.getAcademyFinancialRecords({
        academy_id: currentAcademy.id,
        year: selectedYear,
        ...(selectedMonth ? { month: selectedMonth } : {}),
      });
      setRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      ErrorHandler.handleApiError(err);
    } finally {
      setLoading(false);
    }
  }, [currentAcademy?.id, selectedYear, selectedMonth]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totals = useMemo(
    () =>
      records.reduce(
        (acc, r) => ({
          cost: acc.cost + r.cost,
          revenue: acc.revenue + r.revenue,
          profit: acc.profit + r.profit,
          currency: r.currency,
        }),
        { cost: 0, revenue: 0, profit: 0, currency: 'IRR' },
      ),
    [records],
  );

  const recordsByCategory = useMemo((): CategoryBucket[] => {
    const grouped = new Map<string, CategoryBucket>();
    for (const r of records) {
      const key = r.costCategory?.id?.toString() ?? 'uncategorized';
      const existing = grouped.get(key) ?? {
        category: r.costCategory?.name ?? t('financial.store.costs.uncategorized'),
        count: 0,
        totalCost: 0,
        currency: r.currency,
      };
      grouped.set(key, {
        ...existing,
        count: existing.count + 1,
        totalCost: existing.totalCost + r.cost,
      });
    }
    return Array.from(grouped.values()).sort((a, b) => b.totalCost - a.totalCost);
  }, [records, t]);

  if (!currentAcademy) {
    return (
      <div className="flex flex-1 items-center justify-center p-4 sm:p-6">
        <p className="text-muted-foreground">{t('financial.store.costs.noStore')}</p>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner message={t('financial.store.costs.loading')} />;
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PageHeader
        title={t('financial.store.costs.title')}
        description={`${currentAcademy.name} — ${t('financial.store.costs.description')}`}
      />

      <FinancialFilterBar
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        years={years}
        onYearChange={setSelectedYear}
        onMonthChange={setSelectedMonth}
      />

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('financial.store.costs.totalCost')}
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive">
              {formatCurrency(totals.cost, totals.currency)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t('financial.store.costs.totalExpenses')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('financial.store.costs.totalRevenue')}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totals.revenue, totals.currency)}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t('financial.store.costs.totalIncome')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('financial.store.costs.netProfit')}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totals.profit, totals.currency)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t('financial.store.costs.revenueMinusCost')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Costs by Category */}
      {recordsByCategory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('financial.store.costs.costsByCategory')}</CardTitle>
            <CardDescription>
              {t('financial.store.costs.costsByCategoryDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('financial.store.costs.category')}</TableHead>
                  <TableHead className="text-end">{t('financial.store.costs.records')}</TableHead>
                  <TableHead className="text-end">
                    {t('financial.store.costs.totalCostLabel')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recordsByCategory.map((cat, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        {cat.category}
                      </div>
                    </TableCell>
                    <TableCell className="text-end">{formatNumber(cat.count)}</TableCell>
                    <TableCell className="text-end font-medium">
                      {formatCurrency(cat.totalCost, cat.currency)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* All Records */}
      <Card>
        <CardHeader>
          <CardTitle>{t('financial.store.costs.allCostRecords')}</CardTitle>
          <CardDescription>{t('financial.store.costs.allCostRecordsDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('financial.store.costs.period')}</TableHead>
                <TableHead>{t('financial.store.costs.category')}</TableHead>
                <TableHead className="text-end">{t('financial.store.costs.revenue')}</TableHead>
                <TableHead className="text-end">{t('financial.store.costs.cost')}</TableHead>
                <TableHead className="text-end">{t('financial.store.costs.profit')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-6 text-center text-muted-foreground">
                    {t('financial.store.costs.noCostRecords')}
                  </TableCell>
                </TableRow>
              ) : (
                records.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-sm">
                      <span>{formatDate(r.period_start)}</span>
                      <span className="mx-1 text-muted-foreground">→</span>
                      <span>{formatDate(r.period_end)}</span>
                    </TableCell>
                    <TableCell>
                      {r.costCategory?.name ?? t('financial.store.costs.uncategorized')}
                    </TableCell>
                    <TableCell className="text-end">
                      {formatCurrency(r.revenue, r.currency)}
                    </TableCell>
                    <TableCell className="text-end font-medium text-destructive">
                      {formatCurrency(r.cost, r.currency)}
                    </TableCell>
                    <TableCell className="text-end font-medium text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(r.profit, r.currency)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
