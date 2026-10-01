'use client';

import { useState, useEffect, useMemo } from 'react';

import { apiClient } from '@/lib/api';
import { formatCurrencyWithStore } from '@/lib/utils';
import { toast } from 'react-toastify';
import { tNow } from '@/lib/i18n/t-now';
import { apiErrorMessage } from '@/lib/api-error-message';
import { useCurrentAcademy } from '@/hooks/useCurrentAcademy';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';

import { ReportsTabs } from './_components/reports-tabs';
import { ReportsSummaryCards } from './_components/reports-summary-cards';
import { ReportsFiltersCard } from './_components/reports-filters-card';

export default function StoreReportsPage() {
  const { t, language } = useTranslation();
  const formatNumber = useNumberFormat();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
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

      const [overviewData, summaryData, recordsData] = await Promise.all([
        apiClient.getAcademyFinancialOverview(
          currentAcademy.id,
          startDate.toISOString(),
          endDate.toISOString(),
        ),
        apiClient.getAcademyFinancialSummary(currentAcademy.id),
        apiClient.getAcademyFinancialRecords({
          academy_id: currentAcademy.id,
          year: selectedYear,
          month: selectedMonth || undefined,
        }),
      ]);

      setOverview(overviewData);
      setSummary(summaryData);
      setRecords(recordsData);
    } catch (error: any) {
      console.error('Error loading reports data:', error);
      toast.error(apiErrorMessage(error, tNow('toasts.reportsLoadFailed')));
    } finally {
      setLoading(false);
    }
  };

  const locale = 'fa-IR';

  const formatCurrency = (amount: number, currency = 'IRR') => {
    return formatCurrencyWithStore(
      amount,
      {
        currency: currency as any,
        currency_symbol: currency === 'IRR' ? 'Toman' : currency,
        currency_position: 'after',
      },
      undefined,
      language,
    );
  };

  const monthlyBreakdown = useMemo(() => {
    const monthly: Record<
      number,
      { revenue: number; cost: number; profit: number; currency: string }
    > = {};

    records.forEach((record) => {
      const month = new Date(record.period_start).getMonth() + 1;
      if (!monthly[month]) {
        monthly[month] = {
          revenue: 0,
          cost: 0,
          profit: 0,
          currency: record.currency,
        };
      }

      monthly[month].revenue += record.revenue;
      monthly[month].cost += record.cost;
      monthly[month].profit += record.profit;
    });

    return Object.entries(monthly)
      .map(([month, data]) => ({
        month: parseInt(month),
        monthName: new Date(2000, parseInt(month) - 1).toLocaleString(locale, {
          month: 'long',
        }),
        ...data,
      }))
      .sort((a, b) => a.month - b.month);
  }, [records]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">{t('financial.store.reports.loading')}</p>
        </div>
      </div>
    );
  }

  if (!currentAcademy) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">{t('financial.store.reports.noStore')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('financial.store.reports.title')}</h1>
          <p className="mt-1 text-muted-foreground">
            {currentAcademy.name} - {t('financial.store.reports.description')}
          </p>
        </div>
      </div>

      {/* Filters */}
      <ReportsFiltersCard
        locale={locale}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        setSelectedMonth={setSelectedMonth}
        setSelectedYear={setSelectedYear}
        years={years}
      />

      {/* Overview Cards */}
      {overview && <ReportsSummaryCards formatCurrency={formatCurrency} overview={overview} />}

      {/* Detailed Reports */}
      <ReportsTabs
        formatCurrency={formatCurrency}
        formatNumber={formatNumber}
        monthlyBreakdown={monthlyBreakdown}
        records={records}
        summary={summary}
      />
    </div>
  );
}
