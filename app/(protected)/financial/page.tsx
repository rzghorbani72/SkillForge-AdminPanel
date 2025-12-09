'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
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
  Building2,
  Calculator,
  Settings,
  Plus,
  Edit,
  Trash2,
  Calendar
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import {
  PlatformFinancialSummary,
  StoreFinancialRecord,
  PlatformFinancialRecord,
  CostCategory
} from '@/types/api';
import { formatCurrencyWithStore } from '@/lib/utils';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useAccessControl } from '@/hooks/useAccessControl';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/hooks';

export default function FinancialDashboardPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<PlatformFinancialSummary | null>(null);
  const [storeRecords, setStoreRecords] = useState<StoreFinancialRecord[]>([]);
  const [platformRecords, setPlatformRecords] = useState<
    PlatformFinancialRecord[]
  >([]);
  const [costCategories, setCostCategories] = useState<CostCategory[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const store = useCurrentStore();
  const { userState, isLoading: isAccessControlLoading } = useAccessControl();
  const router = useRouter();

  // Redirect based on role
  useEffect(() => {
    if (!isAccessControlLoading && userState) {
      if (userState.role === 'MANAGER') {
        router.replace('/financial/store');
        return;
      }
      if (userState.role === 'ADMIN') {
        router.replace('/financial/platform');
        return;
      }
      // Other roles redirect to dashboard
      router.replace('/dashboard');
    }
  }, [userState, isAccessControlLoading, router]);

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  }, []);

  useEffect(() => {
    loadData();
  }, [selectedYear, selectedMonth]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [summaryData, storeData, platformData, categoriesData] =
        await Promise.all([
          apiClient.getPlatformFinancialSummary(),
          apiClient.getStoreFinancialRecords({
            year: selectedYear,
            month: selectedMonth || undefined
          }),
          apiClient.getPlatformFinancialRecords({
            year: selectedYear,
            month: selectedMonth || undefined
          }),
          apiClient.getCostCategories()
        ]);

      setSummary(summaryData);
      setStoreRecords(storeData);
      setPlatformRecords(platformData);
      setCostCategories(categoriesData);
    } catch (error: any) {
      console.error('Error loading financial data:', error);
      toast.error(error?.message || 'Failed to load financial data');
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

  const profitMargin = (revenue: number, cost: number) => {
    if (revenue === 0) return 0;
    return ((revenue - cost) / revenue) * 100;
  };

  if (loading || !userState) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">
            {t('financial.platform.loading')}
          </p>
        </div>
      </div>
    );
  }

  // This page should redirect, but show loading while redirecting
  if (userState.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {t('financial.platform.title')}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {t('financial.platform.description')}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/financial/platform/stores">
            <Button variant="outline">
              <Building2 className="mr-2 h-4 w-4" />
              {t('financial.platform.allStores')}
            </Button>
          </Link>
          <Link href="/financial/platform/formulas">
            <Button variant="outline">
              <Calculator className="mr-2 h-4 w-4" />
              {t('financial.platform.formulas')}
            </Button>
          </Link>
          <Link href="/financial/platform/categories">
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              {t('financial.platform.costCategories')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>{t('financial.platform.filters')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium">
                {t('financial.platform.year')}
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
                {t('financial.platform.month')}
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
                    {t('financial.platform.allMonths')}
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
      {summary && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('financial.platform.totalRevenue')}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(
                  summary.total.total_revenue,
                  summary.total.currency
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('financial.platform.platformStoresCombined')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('financial.platform.totalCost')}
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(
                  summary.total.total_cost,
                  summary.total.currency
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('financial.platform.allCostsCombined')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('financial.platform.totalProfit')}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(
                  summary.total.total_profit,
                  summary.total.currency
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('financial.platform.profitMargin', {
                  margin: profitMargin(
                    summary.total.total_revenue,
                    summary.total.total_cost
                  ).toFixed(1)
                })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('financial.platform.platformRevenue')}
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(
                  summary.platform.total_revenue,
                  summary.platform.currency
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('financial.platform.records', {
                  count: summary.platform.record_count
                })}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed View */}
      <Tabs defaultValue="platform" className="space-y-4">
        <TabsList>
          <TabsTrigger value="platform">
            {t('financial.platform.tabs.platformRecords')}
          </TabsTrigger>
          <TabsTrigger value="stores">
            {t('financial.platform.tabs.storeRecords')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="platform" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {t('financial.platform.platformRecords.title')}
                  </CardTitle>
                  <CardDescription>
                    {t('financial.platform.platformRecords.description')}
                  </CardDescription>
                </div>
                <Link href="/financial/platform-records/create">
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    {t('financial.platform.platformRecords.addRecord')}
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      {t('financial.platform.platformRecords.period')}
                    </TableHead>
                    <TableHead>
                      {t('financial.platform.platformRecords.category')}
                    </TableHead>
                    <TableHead className="text-right">
                      {t('financial.platform.platformRecords.revenue')}
                    </TableHead>
                    <TableHead className="text-right">
                      {t('financial.platform.platformRecords.cost')}
                    </TableHead>
                    <TableHead className="text-right">
                      {t('financial.platform.platformRecords.profit')}
                    </TableHead>
                    <TableHead className="text-right">
                      {t('financial.platform.platformRecords.margin')}
                    </TableHead>
                    <TableHead>
                      {t('financial.platform.platformRecords.actions')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {platformRecords.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-muted-foreground"
                      >
                        {t('financial.platform.platformRecords.noRecords')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    platformRecords.map((record) => {
                      const margin = profitMargin(record.revenue, record.cost);
                      return (
                        <TableRow key={record.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium">
                                  {new Date(
                                    record.period_start
                                  ).toLocaleDateString()}{' '}
                                  -{' '}
                                  {new Date(
                                    record.period_end
                                  ).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {record.costCategory ? (
                              <Badge variant="outline">
                                {record.costCategory.name}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(record.revenue, record.currency)}
                          </TableCell>
                          <TableCell className="text-right text-red-600">
                            {formatCurrency(record.cost, record.currency)}
                          </TableCell>
                          <TableCell
                            className={`text-right font-bold ${
                              record.profit >= 0
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {formatCurrency(record.profit, record.currency)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge
                              variant={margin >= 0 ? 'default' : 'destructive'}
                            >
                              {margin.toFixed(1)}%
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Link
                                href={`/financial/platform-records/${record.id}/edit`}
                              >
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="sm"
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
                                    } catch (error: any) {
                                      toast.error(
                                        error?.message ||
                                          t(
                                            'financial.platform.platformRecords.deleteError'
                                          )
                                      );
                                    }
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stores" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {t('financial.platform.storeRecords.title')}
                  </CardTitle>
                  <CardDescription>
                    {t('financial.platform.storeRecords.description')}
                  </CardDescription>
                </div>
                <Link href="/financial/store-records/create">
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    {t('financial.platform.storeRecords.addRecord')}
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      {t('financial.platform.storeRecords.store')}
                    </TableHead>
                    <TableHead>
                      {t('financial.platform.storeRecords.period')}
                    </TableHead>
                    <TableHead>
                      {t('financial.platform.storeRecords.category')}
                    </TableHead>
                    <TableHead className="text-right">
                      {t('financial.platform.storeRecords.revenue')}
                    </TableHead>
                    <TableHead className="text-right">
                      {t('financial.platform.storeRecords.cost')}
                    </TableHead>
                    <TableHead className="text-right">
                      {t('financial.platform.storeRecords.profit')}
                    </TableHead>
                    <TableHead className="text-right">
                      {t('financial.platform.storeRecords.margin')}
                    </TableHead>
                    <TableHead>
                      {t('financial.platform.storeRecords.actions')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {storeRecords.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center text-muted-foreground"
                      >
                        {t('financial.platform.storeRecords.noRecords')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    storeRecords.map((record) => {
                      const margin = profitMargin(record.revenue, record.cost);
                      return (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">
                            {record.store?.name || `Store #${record.store_id}`}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <div>
                                {new Date(
                                  record.period_start
                                ).toLocaleDateString()}{' '}
                                -{' '}
                                {new Date(
                                  record.period_end
                                ).toLocaleDateString()}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {record.costCategory ? (
                              <Badge variant="outline">
                                {record.costCategory.name}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(record.revenue, record.currency)}
                          </TableCell>
                          <TableCell className="text-right text-red-600">
                            {formatCurrency(record.cost, record.currency)}
                          </TableCell>
                          <TableCell
                            className={`text-right font-bold ${
                              record.profit >= 0
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {formatCurrency(record.profit, record.currency)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge
                              variant={margin >= 0 ? 'default' : 'destructive'}
                            >
                              {margin.toFixed(1)}%
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Link
                                href={`/financial/store-records/${record.id}/edit`}
                              >
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={async () => {
                                  if (
                                    confirm(
                                      t(
                                        'financial.platform.platformRecords.deleteConfirm'
                                      )
                                    )
                                  ) {
                                    try {
                                      await apiClient.deleteStoreFinancialRecord(
                                        record.id
                                      );
                                      toast.success(
                                        t(
                                          'financial.platform.platformRecords.deleteSuccess'
                                        )
                                      );
                                      loadData();
                                    } catch (error: any) {
                                      toast.error(
                                        error?.message ||
                                          t(
                                            'financial.platform.platformRecords.deleteError'
                                          )
                                      );
                                    }
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
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
