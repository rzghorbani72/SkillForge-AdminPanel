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
import { TrendingDown, Calendar, Tag, DollarSign } from 'lucide-react';
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
import { StoreFinancialRecord } from '@/types/api';

export default function StoreCostsPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<StoreFinancialRecord[]>([]);
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

      const params: any = {
        store_id: store.id,
        year: selectedYear
      };

      if (selectedMonth) {
        params.month = selectedMonth;
      }

      const data = await apiClient.getStoreFinancialRecords(params);
      setRecords(data);
    } catch (error: any) {
      console.error('Error loading costs data:', error);
      toast.error(error?.message || 'Failed to load costs data');
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

  const totals = useMemo(() => {
    return records.reduce(
      (acc, record) => ({
        cost: acc.cost + record.cost,
        revenue: acc.revenue + record.revenue,
        profit: acc.profit + record.profit,
        currency: record.currency
      }),
      { cost: 0, revenue: 0, profit: 0, currency: 'IRR' }
    );
  }, [records]);

  const recordsByCategory = useMemo(() => {
    const grouped: Record<
      string,
      { category: string; count: number; totalCost: number; currency: string }
    > = {};

    records.forEach((record) => {
      const categoryName =
        record.costCategory?.name || t('financial.store.costs.uncategorized');
      const categoryId = record.costCategory?.id?.toString() || 'uncategorized';

      if (!grouped[categoryId]) {
        grouped[categoryId] = {
          category: categoryName,
          count: 0,
          totalCost: 0,
          currency: record.currency
        };
      }

      grouped[categoryId].count += 1;
      grouped[categoryId].totalCost += record.cost;
    });

    return Object.values(grouped);
  }, [records]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">
            {t('financial.store.costs.loading')}
          </p>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">
          {t('financial.store.costs.noStore')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {t('financial.store.costs.title')}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {store.name} - {t('financial.store.costs.description')}
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>{t('financial.store.costs.filters')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium">
                {t('financial.store.costs.year')}
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
                {t('financial.store.costs.month')}
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
                    {t('financial.store.costs.allMonths')}
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

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('financial.store.costs.totalCost')}
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totals.cost, totals.currency)}
            </div>
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
            <div className="text-2xl font-bold">
              {formatCurrency(totals.revenue, totals.currency)}
            </div>
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
            <TrendingDown className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totals.profit, totals.currency)}
            </div>
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
                  <TableHead className="text-right">
                    {t('financial.store.costs.records')}
                  </TableHead>
                  <TableHead className="text-right">
                    {t('financial.store.costs.totalCostLabel')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recordsByCategory
                  .sort((a, b) => b.totalCost - a.totalCost)
                  .map((category, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-muted-foreground" />
                          {category.category}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {category.count}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(category.totalCost, category.currency)}
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
          <CardDescription>
            {t('financial.store.costs.allCostRecordsDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('financial.store.costs.period')}</TableHead>
                <TableHead>{t('financial.store.costs.category')}</TableHead>
                <TableHead className="text-right">
                  {t('financial.store.costs.revenue')}
                </TableHead>
                <TableHead className="text-right">
                  {t('financial.store.costs.cost')}
                </TableHead>
                <TableHead className="text-right">
                  {t('financial.store.costs.profit')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground"
                  >
                    {t('financial.store.costs.noCostRecords')}
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
                            {new Date(record.period_start).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            to{' '}
                            {new Date(record.period_end).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {record.costCategory?.name ||
                        t('financial.store.costs.uncategorized')}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(record.revenue, record.currency)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-red-600">
                      {formatCurrency(record.cost, record.currency)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      {formatCurrency(record.profit, record.currency)}
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
