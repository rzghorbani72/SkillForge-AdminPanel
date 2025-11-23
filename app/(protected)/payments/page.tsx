'use client';

import { useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  CreditCard,
  DollarSign,
  Download,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react';
import { usePaymentsData } from './_hooks/use-payments-data';
import { cn, formatCurrencyWithSchool } from '@/lib/utils';
import { useCurrentSchool } from '@/hooks/useCurrentSchool';

const STATUS_BADGES: Record<string, string> = {
  COMPLETED: 'bg-green-100 text-green-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  FAILED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-blue-100 text-blue-800'
};

function formatDate(value?: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString();
}

export default function PaymentsPage() {
  const { payments, transactions, isLoading, refresh } = usePaymentsData();
  const school = useCurrentSchool();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPayments = useMemo(() => {
    if (!searchTerm) return payments;

    const term = searchTerm.toLowerCase();
    return payments.filter((payment) => {
      const student = payment.user?.name?.toLowerCase() ?? '';
      const course = payment.course?.title?.toLowerCase() ?? '';
      const status = payment.status?.toLowerCase() ?? '';
      const method = payment.method?.toLowerCase() ?? '';

      return (
        student.includes(term) ||
        course.includes(term) ||
        status.includes(term) ||
        method.includes(term) ||
        payment.id.toString().includes(term)
      );
    });
  }, [payments, searchTerm]);

  const totals = useMemo(() => {
    const revenue = payments.reduce(
      (sum, payment) => sum + (payment.amount ?? 0),
      0
    );
    const completed = payments.filter(
      (payment) => payment.status === 'COMPLETED'
    ).length;
    const pending = payments.filter(
      (payment) => payment.status === 'PENDING'
    ).length;
    const failed = payments.filter(
      (payment) => payment.status === 'FAILED'
    ).length;

    return { revenue, completed, pending, failed };
  }, [payments]);

  const methodBreakdown = useMemo(() => {
    const counts = new Map<string, { count: number; total: number }>();

    payments.forEach((payment) => {
      const method = payment.method ?? 'UNKNOWN';
      if (!counts.has(method)) {
        counts.set(method, { count: 0, total: 0 });
      }
      const bucket = counts.get(method)!;
      bucket.count += 1;
      bucket.total += payment.amount ?? 0;
    });

    return Array.from(counts.entries()).map(([method, data]) => ({
      method,
      count: data.count,
      total: data.total
    }));
  }, [payments]);

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900" />
            <p className="mt-2 text-sm text-muted-foreground">
              Loading payments…
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">
            Review processed payments, track transaction status, and drill into
            order details.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={refresh}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrencyWithSchool(totals.revenue, school)}
            </p>
            <p className="text-xs text-muted-foreground">
              Across all recorded payments
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totals.completed}</p>
            <p className="text-xs text-muted-foreground">Successful payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totals.pending}</p>
            <p className="text-xs text-muted-foreground">
              Awaiting confirmation
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totals.failed}</p>
            <p className="text-xs text-muted-foreground">Requires follow-up</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="space-y-1">
          <CardTitle>Search Payments</CardTitle>
          <CardDescription>
            Filter by student, course, invoice, or status.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search payments…"
              className="pl-9"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            Showing {filteredPayments.length} of {payments.length} payments
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-1">
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            Latest payments across your organisation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredPayments.length === 0 ? (
            <div className="py-12 text-center">
              <CreditCard className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium">
                No transactions match your filters.
              </p>
              <p className="text-xs text-muted-foreground">
                Adjust the search or refresh to try again.
              </p>
            </div>
          ) : (
            filteredPayments.slice(0, 20).map((payment) => (
              <div
                key={payment.id}
                className="flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {payment.user?.name ?? 'Unknown student'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {payment.course?.title ?? 'Unknown course'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="text-right text-sm">
                    <p className="font-semibold">
                      {formatCurrencyWithSchool(payment.amount ?? 0, school)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(payment.payment_date)}
                    </p>
                  </div>
                  <Badge
                    className={cn(
                      'capitalize',
                      STATUS_BADGES[payment.status] ??
                        'bg-slate-100 text-slate-700'
                    )}
                  >
                    {payment.status?.toLowerCase() ?? 'unknown'}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>Breakdown by gateway and method.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {methodBreakdown.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No payment method information available yet.
            </p>
          ) : (
            methodBreakdown.map((item) => (
              <div
                key={item.method}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div>
                  <p className="text-sm font-medium capitalize">
                    {item.method.replace('_', ' ').toLowerCase()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.count} payments
                  </p>
                </div>
                <p className="text-sm font-semibold">
                  {formatCurrencyWithSchool(item.total, school)}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Latest Ledger Entries</CardTitle>
          <CardDescription>
            Financial transactions recorded in the system.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No transaction ledger entries available.
            </p>
          ) : (
            transactions.slice(0, 10).map((transaction) => (
              <div
                key={transaction.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4"
              >
                <div>
                  <p className="text-sm font-medium">
                    Transaction #{transaction.id.toString().padStart(6, '0')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {transaction.type}
                  </p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-semibold">
                    {formatCurrencyWithSchool(transaction.amount ?? 0, school)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(transaction.created_at)}
                  </p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
