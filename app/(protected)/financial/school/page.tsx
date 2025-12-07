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
  CreditCard
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { formatCurrencyWithSchool } from '@/lib/utils';
import { toast } from 'react-toastify';
import { useCurrentSchool } from '@/hooks/useCurrentSchool';
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

export default function SchoolFinancialPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const school = useCurrentSchool();

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  }, []);

  useEffect(() => {
    loadData();
  }, [selectedYear, selectedMonth, school?.id]);

  const loadData = async () => {
    if (!school?.id) return;

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

      const [overviewData, revenueData] = await Promise.all([
        apiClient.getSchoolFinancialOverview(
          school.id,
          startDate.toISOString(),
          endDate.toISOString()
        ),
        apiClient.getSchoolRevenueFromPayments(
          school.id,
          startDate.toISOString(),
          endDate.toISOString()
        )
      ]);

      setOverview(overviewData);
      setPayments(revenueData.payments || []);
    } catch (error: any) {
      console.error('Error loading school financial data:', error);
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">
            {t('financial.school.overview.loading')}
          </p>
        </div>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">
          {t('financial.school.overview.noSchool')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {t('financial.school.overview.title')}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {school.name} - {t('financial.school.overview.description')}
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>{t('financial.school.overview.filters')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium">
                {t('financial.school.overview.year')}
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
                {t('financial.school.overview.month')}
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
                    {t('financial.school.overview.allMonths')}
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
      {overview && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('financial.school.overview.totalRevenue')}
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
                {t('financial.school.overview.fromPayments', {
                  count: overview.revenue.from_payments
                })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('financial.school.overview.totalCost')}
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(overview.cost.total, overview.cost.currency)}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('financial.school.overview.platformCosts')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('financial.school.overview.totalProfit')}
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
                {t('financial.school.overview.profitMargin', {
                  margin: overview.profit.margin
                })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('financial.school.overview.enrollments')}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overview.statistics.enrollments}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('financial.school.overview.courses', {
                  count: overview.statistics.courses
                })}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed View */}
      <Tabs defaultValue="payments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payments">
            {t('financial.school.overview.studentPayments')}
          </TabsTrigger>
          <TabsTrigger value="courses">
            {t('financial.school.overview.courseRevenue')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {t('financial.school.overview.studentPayments')}
                  </CardTitle>
                  <CardDescription>
                    {t('financial.school.overview.paymentsDescription')}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('financial.school.overview.date')}</TableHead>
                    <TableHead>
                      {t('financial.school.overview.student')}
                    </TableHead>
                    <TableHead>
                      {t('financial.school.overview.course')}
                    </TableHead>
                    <TableHead className="text-right">
                      {t('financial.school.overview.amount')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-muted-foreground"
                      >
                        {t('financial.school.overview.noPayments')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    payments.map((payment: any) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              {new Date(
                                payment.created_at
                              ).toLocaleDateString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {payment.profile?.display_name || 'Unknown'}
                        </TableCell>
                        <TableCell>
                          {payment.course?.title || 'Unknown Course'}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(payment.amount, payment.currency)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {t('financial.school.overview.courseRevenue')}
              </CardTitle>
              <CardDescription>
                {t('financial.school.overview.courseRevenueDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="py-8 text-center text-muted-foreground">
                {t('financial.school.overview.comingSoon')}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
