'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
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
  TrendingDown,
  Users,
  BookOpen,
  Calendar,
  FileText
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { formatCurrencyWithStore } from '@/lib/utils';
import { toast } from 'react-toastify';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useTranslation } from '@/lib/i18n/hooks';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SchoolReportsPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const store = useCurrentStore();

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  }, []);

  useEffect(() => {
    loadData();
  }, [selectedYear, selectedMonth, store?.id]);

  const loadData = async () => {
    if (!store?.id) return;

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
        apiClient.getStoreFinancialOverview(
          store.id,
          startDate.toISOString(),
          endDate.toISOString()
        ),
        apiClient.getStoreFinancialSummary(store.id),
        apiClient.getStoreFinancialRecords({
          store_id: store.id,
          year: selectedYear,
          month: selectedMonth || undefined
        })
      ]);

      setOverview(overviewData);
      setSummary(summaryData);
      setRecords(recordsData);
    } catch (error: any) {
      console.error('Error loading reports data:', error);
      toast.error(error?.message || 'Failed to load reports data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency = 'IRR') => {
    return formatCurrencyWithStore(amount, {
      currency: currency as any,
      currency_symbol: currency === 'IRR' ? 'Toman' : currency,
      currency_position: 'after'
    });
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
          currency: record.currency
        };
      }

      monthly[month].revenue += record.revenue;
      monthly[month].cost += record.cost;
      monthly[month].profit += record.profit;
    });

    return Object.entries(monthly)
      .map(([month, data]) => ({
        month: parseInt(month),
        monthName: new Date(2000, parseInt(month) - 1).toLocaleString('en-US', {
          month: 'long'
        }),
        ...data
      }))
      .sort((a, b) => a.month - b.month);
  }, [records]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">
            {t('financial.store.reports.loading')}
          </p>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">
          {t('financial.store.reports.noSchool')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {t('financial.store.reports.title')}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {store.name} - {t('financial.store.reports.description')}
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>{t('financial.store.reports.filters')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium">
                {t('financial.store.reports.year')}
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
                {t('financial.store.reports.month')}
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
                    {t('financial.store.reports.allMonths')}
                  </SelectItem>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <SelectItem key={month} value={month.toString()}>
                      {new Date(2000, month - 1).toLocaleString('en-US', {
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

      {/* Overview Cards */}
      {overview && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('financial.store.reports.totalRevenue')}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(
                  overview.revenue.total,
                  overview.revenue.currency
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('financial.store.reports.fromPayments', {
                  count: overview.revenue.from_payments
                })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('financial.store.reports.totalCost')}
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(overview.cost.total, overview.cost.currency)}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('financial.store.reports.platformCosts')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('financial.store.reports.totalProfit')}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(
                  overview.profit.total,
                  overview.revenue.currency
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('financial.store.reports.profitMargin', {
                  margin: overview.profit.margin
                })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('financial.store.reports.enrollments')}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overview.statistics.enrollments}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('financial.store.reports.courses', {
                  count: overview.statistics.courses
                })}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Reports */}
      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList>
          <TabsTrigger value="summary">
            {t('financial.store.reports.summary')}
          </TabsTrigger>
          <TabsTrigger value="monthly">
            {t('financial.store.reports.monthly')}
          </TabsTrigger>
          <TabsTrigger value="records">
            {t('financial.store.reports.records')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {t('financial.store.reports.financialSummary')}
              </CardTitle>
              <CardDescription>
                {t('financial.store.reports.financialSummaryDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {summary ? (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t('financial.store.reports.totalRevenueLabel')}
                      </p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(
                          summary.total_revenue || 0,
                          summary.currency || 'IRR'
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t('financial.store.reports.totalCostLabel')}
                      </p>
                      <p className="text-2xl font-bold text-red-600">
                        {formatCurrency(
                          summary.total_cost || 0,
                          summary.currency || 'IRR'
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t('financial.store.reports.netProfit')}
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(
                          summary.total_profit || 0,
                          summary.currency || 'IRR'
                        )}
                      </p>
                    </div>
                  </div>
                  {summary.record_count !== undefined && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t('financial.store.reports.totalRecords')}
                      </p>
                      <p className="text-xl font-semibold">
                        {summary.record_count}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  {t('financial.store.reports.noSummaryData')}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {t('financial.store.reports.monthlyBreakdown')}
              </CardTitle>
              <CardDescription>
                {t('financial.store.reports.monthlyBreakdownDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('financial.store.reports.month')}</TableHead>
                    <TableHead className="text-right">
                      {t('financial.store.reports.revenue')}
                    </TableHead>
                    <TableHead className="text-right">
                      {t('financial.store.reports.cost')}
                    </TableHead>
                    <TableHead className="text-right">
                      {t('financial.store.reports.profit')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlyBreakdown.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-muted-foreground"
                      >
                        {t('financial.store.reports.noMonthlyData')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    monthlyBreakdown.map((month) => (
                      <TableRow key={month.month}>
                        <TableCell className="font-medium">
                          {month.monthName}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(month.revenue, month.currency)}
                        </TableCell>
                        <TableCell className="text-right text-red-600">
                          {formatCurrency(month.cost, month.currency)}
                        </TableCell>
                        <TableCell className="text-right font-medium text-green-600">
                          {formatCurrency(month.profit, month.currency)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="records" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {t('financial.store.reports.allFinancialRecords')}
              </CardTitle>
              <CardDescription>
                {t('financial.store.reports.allFinancialRecordsDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('financial.store.reports.period')}</TableHead>
                    <TableHead>
                      {t('financial.store.reports.category')}
                    </TableHead>
                    <TableHead className="text-right">
                      {t('financial.store.reports.revenue')}
                    </TableHead>
                    <TableHead className="text-right">
                      {t('financial.store.reports.cost')}
                    </TableHead>
                    <TableHead className="text-right">
                      {t('financial.store.reports.profit')}
                    </TableHead>
                    <TableHead className="text-right">
                      {t('financial.store.reports.finalProfit')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground"
                      >
                        {t('financial.store.reports.noRecords')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    records.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div>
                                {new Date(
                                  record.period_start
                                ).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                to{' '}
                                {new Date(
                                  record.period_end
                                ).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {record.costCategory?.name ||
                            t('financial.store.reports.uncategorized')}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(record.revenue, record.currency)}
                        </TableCell>
                        <TableCell className="text-right text-red-600">
                          {formatCurrency(record.cost, record.currency)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(record.profit, record.currency)}
                        </TableCell>
                        <TableCell className="text-right font-medium text-green-600">
                          {formatCurrency(record.final_profit, record.currency)}
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
