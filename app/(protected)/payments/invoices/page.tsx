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
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FileText, Filter, Plus, Search } from 'lucide-react';
import { usePaymentsData } from '../_hooks/use-payments-data';
import { cn, formatCurrencyWithSchool } from '@/lib/utils';
import { useCurrentSchool } from '@/hooks/useCurrentSchool';

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: 'bg-green-100 text-green-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  FAILED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-blue-100 text-blue-800'
};

function formatDate(value?: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString();
}

export default function InvoicesPage() {
  const { payments, isLoading } = usePaymentsData();
  const school = useCurrentSchool();
  const [searchTerm, setSearchTerm] = useState('');

  const invoices = useMemo(() => {
    if (!searchTerm) return payments;
    const term = searchTerm.toLowerCase();

    return payments.filter((payment) => {
      const student = payment.user?.name?.toLowerCase() ?? '';
      const course = payment.course?.title?.toLowerCase() ?? '';
      const invoiceNumber = payment.id.toString();
      const status = payment.status?.toLowerCase() ?? '';

      return (
        student.includes(term) ||
        course.includes(term) ||
        invoiceNumber.includes(term) ||
        status.includes(term)
      );
    });
  }, [payments, searchTerm]);

  const totals = useMemo(() => {
    const issued = payments.length;
    const paid = payments.filter(
      (payment) => payment.status === 'COMPLETED'
    ).length;
    const outstanding = payments.filter(
      (payment) => payment.status === 'PENDING'
    ).length;
    const refunds = payments.filter(
      (payment) => payment.status === 'REFUNDED'
    ).length;

    return { issued, paid, outstanding, refunds };
  }, [payments]);

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900" />
            <p className="mt-2 text-sm text-muted-foreground">
              Loading invoices…
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">
            Generate, monitor, and download invoices related to course
            purchases.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" /> Filters
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Create Invoice
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Issued</CardTitle>
            <CardDescription>Total invoices generated.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totals.issued}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <CardDescription>Fully settled invoices.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totals.paid}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <CardDescription>Awaiting payment or confirmation.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totals.outstanding}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Refunded</CardTitle>
            <CardDescription>Invoices refunded to students.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totals.refunds}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Find Invoice</CardTitle>
          <CardDescription>
            Search by student, course, invoice number, or status.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search invoices…"
              className="pl-9"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            Showing {invoices.length} of {payments.length}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Ledger</CardTitle>
          <CardDescription>
            Detailed list of recently generated invoices.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {invoices.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium">
                No invoices to show right now.
              </p>
              <p className="text-xs text-muted-foreground">
                Create a new invoice or adjust your filters.
              </p>
            </div>
          ) : (
            invoices.slice(0, 25).map((payment) => (
              <div
                key={payment.id}
                className="flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      Invoice #{payment.id.toString().padStart(6, '0')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {payment.user?.name ?? 'Unknown student'} ·{' '}
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
                      STATUS_COLORS[payment.status] ??
                        'bg-slate-100 text-slate-700'
                    )}
                  >
                    {payment.status?.toLowerCase() ?? 'unknown'}
                  </Badge>
                  <Button variant="outline" size="sm">
                    Download
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
