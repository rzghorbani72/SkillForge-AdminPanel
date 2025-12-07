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
  Calendar,
  Workflow
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import {
  PlatformFinancialSummary,
  SchoolFinancialRecord,
  PlatformFinancialRecord,
  CostCategory
} from '@/types/api';
import { formatCurrencyWithSchool } from '@/lib/utils';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { useAccessControl } from '@/hooks/useAccessControl';
import { useRouter } from 'next/navigation';

export default function PlatformFinancialPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<PlatformFinancialSummary | null>(null);
  const [schoolRecords, setSchoolRecords] = useState<SchoolFinancialRecord[]>(
    []
  );
  const [platformRecords, setPlatformRecords] = useState<
    PlatformFinancialRecord[]
  >([]);
  const [costCategories, setCostCategories] = useState<CostCategory[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const { userState } = useAccessControl();
  const router = useRouter();

  // Ensure only admins can access
  useEffect(() => {
    if (userState && userState.userRole !== 'ADMIN') {
      router.replace('/dashboard');
    }
  }, [userState, router]);

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  }, []);

  useEffect(() => {
    if (userState?.userRole === 'ADMIN') {
      loadData();
    }
  }, [selectedYear, selectedMonth, userState]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [summaryData, schoolData, platformData, categoriesData] =
        await Promise.all([
          apiClient.getPlatformFinancialSummary(),
          apiClient.getSchoolFinancialRecords({
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
      setSchoolRecords(schoolData);
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
    return formatCurrencyWithSchool(amount, {
      currency: currency as any,
      currency_symbol: currency === 'IRR' ? 'Toman' : currency,
      currency_position: 'after'
    });
  };

  const profitMargin = (revenue: number, cost: number) => {
    if (revenue === 0) return 0;
    return ((revenue - cost) / revenue) * 100;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">
            Loading financial data...
          </p>
        </div>
      </div>
    );
  }

  if (userState?.userRole !== 'ADMIN') {
    return null;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Platform Financial Management</h1>
          <p className="mt-1 text-muted-foreground">
            Business cash flow, benefit and cost management for all schools
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/financial/platform/schools">
            <Button variant="outline">
              <Building2 className="mr-2 h-4 w-4" />
              All Schools
            </Button>
          </Link>
          <Link href="/financial/platform/formulas">
            <Button variant="outline">
              <Calculator className="mr-2 h-4 w-4" />
              Formulas
            </Button>
          </Link>
          <Link href="/financial/platform/business-flow">
            <Button variant="outline">
              <Workflow className="mr-2 h-4 w-4" />
              Business Flow
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium">Year</label>
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
                Month (Optional)
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
                  <SelectItem value="all">All Months</SelectItem>
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
                Total Revenue
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
                Platform + Schools combined
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
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
                All costs combined
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Profit
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
                Profit margin:{' '}
                {profitMargin(
                  summary.total.total_revenue,
                  summary.total.total_cost
                ).toFixed(1)}
                %
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Platform Revenue
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
                {summary.platform.record_count} records
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed View */}
      <Tabs defaultValue="platform" className="space-y-4">
        <TabsList>
          <TabsTrigger value="platform">Platform Records</TabsTrigger>
          <TabsTrigger value="schools">All Schools</TabsTrigger>
        </TabsList>

        <TabsContent value="platform" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Platform Financial Records</CardTitle>
                  <CardDescription>
                    Platform-wide costs and revenue records
                  </CardDescription>
                </div>
                <Link href="/financial/platform/records/create">
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Record
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead className="text-right">Profit</TableHead>
                    <TableHead className="text-right">Margin</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {platformRecords.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-muted-foreground"
                      >
                        No platform financial records found
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
                                href={`/financial/platform/records/${record.id}/edit`}
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
                                      'Are you sure you want to delete this record?'
                                    )
                                  ) {
                                    try {
                                      await apiClient.deletePlatformFinancialRecord(
                                        record.id
                                      );
                                      toast.success(
                                        'Record deleted successfully'
                                      );
                                      loadData();
                                    } catch (error: any) {
                                      toast.error(
                                        error?.message ||
                                          'Failed to delete record'
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

        <TabsContent value="schools" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Schools Financial Records</CardTitle>
                  <CardDescription>
                    Per-school costs and revenue records across all schools
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>School</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead className="text-right">Profit</TableHead>
                    <TableHead className="text-right">Margin</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schoolRecords.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center text-muted-foreground"
                      >
                        No school financial records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    schoolRecords.map((record) => {
                      const margin = profitMargin(record.revenue, record.cost);
                      return (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">
                            {record.school?.name ||
                              `School #${record.school_id}`}
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
                                href={`/financial/platform/schools/${record.school_id}`}
                              >
                                <Button variant="ghost" size="sm">
                                  View
                                </Button>
                              </Link>
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
