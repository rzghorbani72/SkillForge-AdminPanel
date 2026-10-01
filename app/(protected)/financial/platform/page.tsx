'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { CalendarDays, Download } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { apiErrorMessage } from '@/lib/api-error-message';
import {
  PlatformFinancialSummary,
  StoreFinancialRecord,
  PlatformFinancialRecord,
} from '@/types/api';
import { SettlementTotals } from '@/types/financial';
import { formatCurrencyWithStore } from '@/lib/utils';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { useAuthUser } from '@/hooks/useAuthUser';
import { canAccessFinance } from '@/lib/roles';
import { useTranslation } from '@/lib/i18n/hooks';
import { useFinancialFilters } from '@/hooks/useFinancialFilters';
import { FinancialFilterBar } from '@/components/financial/FinancialFilterBar';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { StatCardProps } from './_components/shared';
import { StatCard } from './_components/stat-card';
import { PlatformRecordsTabs } from './_components/platform-records-tabs';
import { IranSettlementCard } from './_components/iran-settlement-card';
import { profitMargin } from './_lib/page-helpers';

export default function PlatformFinancialPage() {
  const { t, language } = useTranslation();
  const { user } = useAuthUser();
  const router = useRouter();
  const { selectedYear, selectedMonth, setSelectedYear, setSelectedMonth, years } =
    useFinancialFilters();

  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [summary, setSummary] = useState<PlatformFinancialSummary | null>(null);
  const [storeRecords, setStoreRecords] = useState<StoreFinancialRecord[]>([]);
  const [platformRecords, setPlatformRecords] = useState<PlatformFinancialRecord[]>([]);
  const [settlement, setSettlement] = useState<{
    totals?: SettlementTotals;
  } | null>(null);

  useEffect(() => {
    if (user && !canAccessFinance(user)) {
      router.replace('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    if (user && canAccessFinance(user)) loadData();
  }, [selectedYear, selectedMonth, user]);

  const formatCurrency = useMemo(
    () =>
      (amount: number, currency = 'IRR') =>
        formatCurrencyWithStore(
          amount,
          {
            currency: currency as string,
            currency_symbol: currency === 'IRR' ? 'Toman' : currency,
            currency_position: 'after',
          },
          undefined,
          language,
        ),
    [language],
  );

  async function loadData() {
    try {
      setLoading(true);
      const [summaryData, storeData, platformData, settlementData] = await Promise.all([
        apiClient.getPlatformFinancialSummary(),
        apiClient.getAcademyFinancialRecords({
          year: selectedYear,
          month: selectedMonth || undefined,
        }),
        apiClient.getPlatformFinancialRecords({
          year: selectedYear,
          month: selectedMonth || undefined,
        }),
        apiClient.getIranSettlementStatement(),
      ]);
      setSummary(summaryData);
      setStoreRecords(storeData);
      setPlatformRecords(platformData);
      setSettlement(settlementData as { totals?: SettlementTotals });
    } catch (error: unknown) {
      toast.error(apiErrorMessage(error, t('financial.platform.loadFailed')));
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <LoadingSpinner message={t('financial.platform.loading')} />;
  }

  if (!user || user?.role !== 'ADMIN') return null;

  const settlementTotals = settlement?.totals ?? null;
  const margin = summary ? profitMargin(summary.total.total_revenue, summary.total.total_cost) : 0;

  const statCards: StatCardProps[] = [
    {
      label: t('financial.platform.totalRevenue'),
      value: formatCurrency(summary?.total.total_revenue ?? 0, summary?.total.currency),
      sub: t('financial.platform.platformStoresCombined'),
      delta: null,
    },
    {
      label: t('financial.platform.netProfit'),
      value: formatCurrency(summary?.total.total_profit ?? 0, summary?.total.currency),
      sub: t('financial.platform.profitMargin', {
        margin: margin.toFixed(1),
      }),
      delta: margin,
      accent: true,
    },
    {
      label: t('financial.platform.totalCost'),
      value: formatCurrency(summary?.total.total_cost ?? 0, summary?.total.currency),
      sub: t('financial.platform.allCostsCombined'),
      delta: null,
      negative: true,
    },
    {
      label: t('financial.platform.platformRevenue'),
      value: formatCurrency(summary?.platform.total_revenue ?? 0, summary?.platform.currency),
      sub: t('financial.platform.platformRevenueCount', {
        count: summary?.platform.record_count ?? 0,
      }),
      delta: null,
    },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Section Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t('financial.platform.eyebrow')}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">
            {t('financial.platform.title')}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('financial.platform.description')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowFilters((v) => !v)}
          >
            <CalendarDays className="h-4 w-4" />
            {t('financial.platform.dateRange')}
          </Button>
          <Button type="button" variant="outline" size="sm">
            <Download className="h-4 w-4" />
            {t('financial.platform.export')}
          </Button>
        </div>
      </div>

      {/* Date Filter */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <FinancialFilterBar
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              years={years}
              onYearChange={setSelectedYear}
              onMonthChange={setSelectedMonth}
            />
          </CardContent>
        </Card>
      )}

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Settlement Summary */}
      {settlementTotals && (
        <IranSettlementCard formatCurrency={formatCurrency} settlementTotals={settlementTotals} />
      )}

      {/* Records Tables */}
      <PlatformRecordsTabs
        formatCurrency={formatCurrency}
        loadData={loadData}
        platformRecords={platformRecords}
        storeRecords={storeRecords}
      />
    </div>
  );
}
