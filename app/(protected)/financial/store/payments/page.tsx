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
  CreditCard,
  Calendar,
  TrendingUp,
  Users
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
import { Badge } from '@/components/ui/badge';

export default function SchoolPaymentsPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
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

      const data = await apiClient.getStoreRevenueFromPayments(
        store.id,
        startDate.toISOString(),
        endDate.toISOString()
      );

      setRevenueData(data);
      setPayments(data.payments || []);
    } catch (error: any) {
      console.error('Error loading payments data:', error);
      toast.error(error?.message || 'Failed to load payments data');
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

  const paymentStats = useMemo(() => {
    const completed = payments.filter(
      (p: any) => p.status === 'COMPLETED'
    ).length;
    const pending = payments.filter((p: any) => p.status === 'PENDING').length;
    const failed = payments.filter((p: any) => p.status === 'FAILED').length;
    const totalAmount = payments.reduce(
      (sum: number, p: any) => sum + (p.amount || 0),
      0
    );

    return { completed, pending, failed, totalAmount };
  }, [payments]);

  const paymentsByMethod = useMemo(() => {
    const grouped: Record<
      string,
      { method: string; count: number; total: number; currency: string }
    > = {};

    payments.forEach((payment: any) => {
      const method = payment.method || 'UNKNOWN';
      if (!grouped[method]) {
        grouped[method] = {
          method,
          count: 0,
          total: 0,
          currency: payment.currency || 'IRR'
        };
      }

      grouped[method].count += 1;
      grouped[method].total += payment.amount || 0;
    });

    return Object.values(grouped);
  }, [payments]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">
            {t('financial.store.payments.loading')}
          </p>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">
          {t('financial.store.payments.noSchool')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {t('financial.store.payments.title')}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {store.name} - {t('financial.store.payments.description')}
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>{t('financial.store.payments.filters')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium">
                {t('financial.store.payments.year')}
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
                {t('financial.store.payments.month')}
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
                    {t('financial.store.payments.allMonths')}
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
      {revenueData && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('financial.store.payments.totalRevenue')}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(
                  revenueData.total_revenue,
                  revenueData.currency
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('financial.store.payments.fromPayments', {
                  count: revenueData.payment_count
                })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('financial.store.payments.completed')}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {paymentStats.completed}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('financial.store.payments.successfulPayments')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('financial.store.payments.pending')}
              </CardTitle>
              <CreditCard className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {paymentStats.pending}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('financial.store.payments.awaitingProcessing')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('financial.store.payments.failed')}
              </CardTitle>
              <CreditCard className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {paymentStats.failed}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('financial.store.payments.failed')} transactions
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payments by Method */}
      {paymentsByMethod.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              {t('financial.store.payments.paymentsByMethod')}
            </CardTitle>
            <CardDescription>
              {t('financial.store.payments.paymentsByMethodDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    {t('financial.store.payments.paymentMethod')}
                  </TableHead>
                  <TableHead className="text-right">
                    {t('financial.store.payments.count')}
                  </TableHead>
                  <TableHead className="text-right">
                    {t('financial.store.payments.totalAmount')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentsByMethod
                  .sort((a, b) => b.total - a.total)
                  .map((method, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {method.method}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">{method.count}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(method.total, method.currency)}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* All Payments */}
      <Card>
        <CardHeader>
          <CardTitle>{t('financial.store.payments.allPayments')}</CardTitle>
          <CardDescription>
            {t('financial.store.payments.allPaymentsDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('financial.store.payments.date')}</TableHead>
                <TableHead>{t('financial.store.payments.student')}</TableHead>
                <TableHead>{t('financial.store.payments.course')}</TableHead>
                <TableHead>{t('financial.store.payments.method')}</TableHead>
                <TableHead>{t('financial.store.payments.status')}</TableHead>
                <TableHead className="text-right">
                  {t('financial.store.payments.amount')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground"
                  >
                    {t('financial.store.payments.noPayments')}
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment: any) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          {new Date(payment.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {payment.profile?.display_name || 'Unknown'}
                    </TableCell>
                    <TableCell>
                      {payment.course?.title || 'Unknown Course'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{payment.method || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          payment.status === 'COMPLETED'
                            ? 'default'
                            : payment.status === 'PENDING'
                              ? 'secondary'
                              : 'destructive'
                        }
                      >
                        {payment.status || 'UNKNOWN'}
                      </Badge>
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
    </div>
  );
}
