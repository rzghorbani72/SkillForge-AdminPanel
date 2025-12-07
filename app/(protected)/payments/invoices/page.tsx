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
import { cn, formatCurrencyWithStore } from '@/lib/utils';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useTranslation } from '@/lib/i18n/hooks';

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
  const { t, language } = useTranslation();
  const { payments, isLoading } = usePaymentsData();
  const store = useCurrentStore();
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
              {t('common.loading')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex-1 space-y-6 p-6"
      dir={language === 'fa' || language === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('payments.invoices')}
          </h1>
          <p className="text-muted-foreground">
            {t('payments.invoicesDescription')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Filter className="me-2 h-4 w-4" /> {t('payments.filters')}
          </Button>
          <Button>
            <Plus className="me-2 h-4 w-4" /> {t('payments.createInvoice')}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t('payments.issued')}
            </CardTitle>
            <CardDescription>{t('payments.issuedDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totals.issued}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t('payments.paid')}
            </CardTitle>
            <CardDescription>{t('payments.paidDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totals.paid}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t('payments.outstanding')}
            </CardTitle>
            <CardDescription>
              {t('payments.outstandingDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totals.outstanding}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t('payments.refunded')}
            </CardTitle>
            <CardDescription>
              {t('payments.refundedDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totals.refunds}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('payments.findInvoice')}</CardTitle>
          <CardDescription>
            {t('payments.findInvoiceDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={t('payments.searchInvoicesPlaceholder')}
              className="ps-9"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            {t('payments.showingInvoices', {
              count: invoices.length,
              total: payments.length
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('payments.invoiceLedger')}</CardTitle>
          <CardDescription>
            {t('payments.invoiceLedgerDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {invoices.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium">
                {t('payments.noInvoices')}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('payments.createOrAdjust')}
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
                      {formatCurrencyWithStore(payment.amount ?? 0, store)}
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
                    {t('payments.download')}
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
