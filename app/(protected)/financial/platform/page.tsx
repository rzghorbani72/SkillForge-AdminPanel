'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  CalendarDays,
  Download,
  MoreHorizontal,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import {
  PlatformFinancialSummary,
  StoreFinancialRecord,
  PlatformFinancialRecord
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
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  delta?: number | null;
  accent?: boolean;
  negative?: boolean;
}

function StatCard({
  label,
  value,
  sub,
  delta,
  accent,
  negative
}: StatCardProps) {
  return (
    <Card
      className={cn(
        'transition-shadow hover:shadow-sm',
        accent && 'border-transparent bg-primary/5'
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <span
            className={cn(
              'text-xs font-medium uppercase tracking-wider',
              accent ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            {label}
          </span>
          {delta != null && delta !== 0 && (
            <span
              className={cn(
                'flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                delta >= 0
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
              )}
            >
              {delta >= 0 ? (
                <TrendingUp className="h-2.5 w-2.5" />
              ) : (
                <TrendingDown className="h-2.5 w-2.5" />
              )}
              {Math.abs(delta).toFixed(1)}%
            </span>
          )}
        </div>
        <p
          className={cn(
            'mt-2 text-2xl font-bold tabular-nums tracking-tight',
            negative && 'text-destructive'
          )}
        >
          {value}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  );
}

function profitMargin(revenue: number, cost: number) {
  if (revenue === 0) return 0;
  return ((revenue - cost) / revenue) * 100;
}

export default function PlatformFinancialPage() {
  const { t, language } = useTranslation();
  const { user } = useAuthUser();
  const router = useRouter();
  const {
    selectedYear,
    selectedMonth,
    setSelectedYear,
    setSelectedMonth,
    years
  } = useFinancialFilters();

  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [summary, setSummary] = useState<PlatformFinancialSummary | null>(null);
  const [storeRecords, setStoreRecords] = useState<StoreFinancialRecord[]>([]);
  const [platformRecords, setPlatformRecords] = useState<
    PlatformFinancialRecord[]
  >([]);
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
            currency_position: 'after'
          },
          undefined,
          language
        ),
    [language]
  );

  async function loadData() {
    try {
      setLoading(true);
      const [summaryData, storeData, platformData, settlementData] =
        await Promise.all([
          apiClient.getPlatformFinancialSummary(),
          apiClient.getAcademyFinancialRecords({
            year: selectedYear,
            month: selectedMonth || undefined
          }),
          apiClient.getPlatformFinancialRecords({
            year: selectedYear,
            month: selectedMonth || undefined
          }),
          apiClient.getIranSettlementStatement()
        ]);
      setSummary(summaryData);
      setStoreRecords(storeData);
      setPlatformRecords(platformData);
      setSettlement(settlementData as { totals?: SettlementTotals });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : '';
      toast.error(msg || t('financial.platform.loadFailed'));
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <LoadingSpinner message={t('financial.platform.loading')} />;
  }

  if (!user || user?.role !== 'ADMIN') return null;

  const settlementTotals = settlement?.totals ?? null;
  const margin = summary
    ? profitMargin(summary.total.total_revenue, summary.total.total_cost)
    : 0;

  const statCards: StatCardProps[] = [
    {
      label: t('financial.platform.totalRevenue'),
      value: formatCurrency(
        summary?.total.total_revenue ?? 0,
        summary?.total.currency
      ),
      sub: t('financial.platform.platformStoresCombined'),
      delta: null
    },
    {
      label: t('financial.platform.netProfit'),
      value: formatCurrency(
        summary?.total.total_profit ?? 0,
        summary?.total.currency
      ),
      sub: t('financial.platform.profitMargin', {
        margin: margin.toFixed(1)
      }),
      delta: margin,
      accent: true
    },
    {
      label: t('financial.platform.totalCost'),
      value: formatCurrency(
        summary?.total.total_cost ?? 0,
        summary?.total.currency
      ),
      sub: t('financial.platform.allCostsCombined'),
      delta: null,
      negative: true
    },
    {
      label: t('financial.platform.platformRevenue'),
      value: formatCurrency(
        summary?.platform.total_revenue ?? 0,
        summary?.platform.currency
      ),
      sub: t('financial.platform.platformRevenueCount', {
        count: summary?.platform.record_count ?? 0
      }),
      delta: null
    }
  ];

  return (
    <div className="space-y-6 p-6">
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
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {t('financial.platform.iranSettlementTitle')}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {t('financial.platform.iranSettlementDescription')}
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  label: t('financial.platform.gross'),
                  value: formatCurrency(
                    settlementTotals.gross_amount ?? 0,
                    settlementTotals.currency
                  )
                },
                {
                  label: `${t('financial.platform.platformFee')} (${((settlementTotals as SettlementTotals & { vat_rate?: number }).vat_rate ?? 0.09) * 100}%)`,
                  value: formatCurrency(
                    settlementTotals.platform_fee ?? 0,
                    settlementTotals.currency
                  )
                },
                {
                  label: t('financial.platform.vat'),
                  value: formatCurrency(
                    settlementTotals.tax_vat_amount ?? 0,
                    settlementTotals.currency
                  )
                },
                {
                  label: t('financial.platform.schoolNet'),
                  value: formatCurrency(
                    settlementTotals.school_net_revenue ?? 0,
                    settlementTotals.currency
                  )
                }
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="mt-1 text-lg font-semibold tabular-nums">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Records Tables */}
      <Tabs defaultValue="platform" className="space-y-4">
        <TabsList>
          <TabsTrigger value="platform">
            {t('financial.platform.tabs.platformRecords')}
          </TabsTrigger>
          <TabsTrigger value="stores">
            {t('financial.platform.tabs.allStores')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="platform">
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>
                    {t('financial.platform.platformRecords.period')}
                  </TableHead>
                  <TableHead>
                    {t('financial.platform.platformRecords.category')}
                  </TableHead>
                  <TableHead className="text-end">
                    {t('financial.platform.platformRecords.revenue')}
                  </TableHead>
                  <TableHead className="text-end">
                    {t('financial.platform.platformRecords.cost')}
                  </TableHead>
                  <TableHead className="text-end">
                    {t('financial.platform.platformRecords.profit')}
                  </TableHead>
                  <TableHead className="text-end">
                    {t('financial.platform.platformRecords.margin')}
                  </TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {platformRecords.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-10 text-center text-muted-foreground"
                    >
                      {t('financial.platform.platformRecords.noRecords')}
                    </TableCell>
                  </TableRow>
                ) : (
                  platformRecords.map((record) => {
                    const m = profitMargin(record.revenue, record.cost);
                    return (
                      <TableRow key={record.id} className="group">
                        <TableCell className="text-sm">
                          {new Date(record.period_start).toLocaleDateString()} –{' '}
                          {new Date(record.period_end).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {record.costCategory ? (
                            <Badge variant="outline">
                              {record.costCategory.name}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-end font-medium tabular-nums">
                          {formatCurrency(record.revenue, record.currency)}
                        </TableCell>
                        <TableCell className="text-end tabular-nums text-destructive">
                          {formatCurrency(record.cost, record.currency)}
                        </TableCell>
                        <TableCell
                          className={cn(
                            'text-end font-bold tabular-nums',
                            record.profit >= 0
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-destructive'
                          )}
                        >
                          {formatCurrency(record.profit, record.currency)}
                        </TableCell>
                        <TableCell className="text-end">
                          <Badge variant={m >= 0 ? 'default' : 'destructive'}>
                            {m.toFixed(1)}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 opacity-0 group-hover:opacity-100"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={async () => {
                                  if (
                                    confirm(
                                      t(
                                        'financial.platform.platformRecords.deleteConfirm'
                                      )
                                    )
                                  ) {
                                    try {
                                      await apiClient.deletePlatformFinancialRecord(
                                        record.id
                                      );
                                      toast.success(
                                        t(
                                          'financial.platform.platformRecords.deleteSuccess'
                                        )
                                      );
                                      loadData();
                                    } catch (err: unknown) {
                                      const msg =
                                        err instanceof Error ? err.message : '';
                                      toast.error(
                                        msg ||
                                          t(
                                            'financial.platform.platformRecords.deleteError'
                                          )
                                      );
                                    }
                                  }
                                }}
                              >
                                {t('common.delete')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="stores">
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>
                    {t('financial.platform.storeRecords.store')}
                  </TableHead>
                  <TableHead>
                    {t('financial.platform.storeRecords.period')}
                  </TableHead>
                  <TableHead>
                    {t('financial.platform.storeRecords.category')}
                  </TableHead>
                  <TableHead className="text-end">
                    {t('financial.platform.storeRecords.revenue')}
                  </TableHead>
                  <TableHead className="text-end">
                    {t('financial.platform.storeRecords.cost')}
                  </TableHead>
                  <TableHead className="text-end">
                    {t('financial.platform.storeRecords.profit')}
                  </TableHead>
                  <TableHead className="text-end">
                    {t('financial.platform.storeRecords.margin')}
                  </TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {storeRecords.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-10 text-center text-muted-foreground"
                    >
                      {t('financial.platform.storeRecords.noRecords')}
                    </TableCell>
                  </TableRow>
                ) : (
                  storeRecords.map((record) => {
                    const m = profitMargin(record.revenue, record.cost);
                    return (
                      <TableRow key={record.id} className="group">
                        <TableCell className="font-medium">
                          {record.store?.name ?? `Store #${record.academy_id}`}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(record.period_start).toLocaleDateString()} –{' '}
                          {new Date(record.period_end).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {record.costCategory ? (
                            <Badge variant="outline">
                              {record.costCategory.name}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-end font-medium tabular-nums">
                          {formatCurrency(record.revenue, record.currency)}
                        </TableCell>
                        <TableCell className="text-end tabular-nums text-destructive">
                          {formatCurrency(record.cost, record.currency)}
                        </TableCell>
                        <TableCell
                          className={cn(
                            'text-end font-bold tabular-nums',
                            record.profit >= 0
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-destructive'
                          )}
                        >
                          {formatCurrency(record.profit, record.currency)}
                        </TableCell>
                        <TableCell className="text-end">
                          <Badge variant={m >= 0 ? 'default' : 'destructive'}>
                            {m.toFixed(1)}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 opacity-0 group-hover:opacity-100"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push('/platform/academies')
                                }
                              >
                                {t('financial.platform.storeRecords.view')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
