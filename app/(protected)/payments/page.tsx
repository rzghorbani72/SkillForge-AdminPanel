'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Search, RefreshCw } from 'lucide-react';
import { usePaymentsData } from './_hooks/use-payments-data';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { formatPaymentMethodLabel } from '@/lib/format-payment-method-label';
import { Pagination } from '@/components/shared/Pagination';

import { SelectedPaymentSheet } from './_components/selected-payment-sheet';
import { RecentTransactionsCard } from './_components/recent-transactions-card';
import { PaymentsAnalyticsCards } from './_components/payments-analytics-cards';
import { PaymentNotes } from './_lib/page-helpers';

function parsePaymentNotes(value?: string | null): PaymentNotes | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as PaymentNotes;
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

export default function PaymentsPage() {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const formatDate = useDateFormat();
  const formatCurrency = useFormatCurrency();
  const { payments, transactions, monetizationSummary, isLoading, refresh } = usePaymentsData();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const selectedPaymentNotes = useMemo(
    () => parsePaymentNotes(selectedPayment?.notes),
    [selectedPayment],
  );

  const filteredPayments = useMemo(() => {
    if (!searchTerm) return payments;

    const term = searchTerm.toLowerCase();
    return payments.filter((payment) => {
      const student =
        payment.user?.display_name?.toLowerCase() ??
        payment.Profile?.display_name?.toLowerCase() ??
        '';
      const course =
        payment.course?.title?.toLowerCase() ?? payment.Course?.title?.toLowerCase() ?? '';
      const status = payment.status?.toLowerCase() ?? '';
      const method = payment.method?.toLowerCase() ?? payment.payment_method?.toLowerCase() ?? '';
      const gateway = payment.gateway?.toLowerCase() ?? '';
      const provider = payment.provider?.toLowerCase() ?? '';

      return (
        student.includes(term) ||
        course.includes(term) ||
        status.includes(term) ||
        method.includes(term) ||
        gateway.includes(term) ||
        provider.includes(term) ||
        payment.id.toString().includes(term)
      );
    });
  }, [payments, searchTerm]);

  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPayments.slice(start, start + itemsPerPage);
  }, [filteredPayments, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / itemsPerPage));

  const totals = useMemo(() => {
    const revenue = payments.reduce((sum, payment) => sum + (payment.amount ?? 0), 0);
    const completed = payments.filter((payment) => payment.status === 'PAID').length;
    const pending = payments.filter((payment) => payment.status === 'PENDING').length;
    const failed = payments.filter((payment) => payment.status === 'FAILED').length;

    return { revenue, completed, pending, failed };
  }, [payments]);

  const methodBreakdown = useMemo(() => {
    const counts = new Map<string, { count: number; total: number }>();

    payments.forEach((payment) => {
      const method = payment.method ?? payment.payment_method ?? 'UNKNOWN';
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
      total: data.total,
    }));
  }, [payments]);

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-4 sm:p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
            <p className="mt-2 text-sm text-muted-foreground">{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6" dir={'rtl'}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('payments.transactions')}</h1>
          <p className="text-muted-foreground">{t('payments.transactionsDescription')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={refresh}>
            <RefreshCw className="me-2 h-4 w-4" /> {t('payments.refresh')}
          </Button>
          <Button variant="outline">
            <Download className="me-2 h-4 w-4" /> {t('payments.exportCsv')}
          </Button>
        </div>
      </div>

      <PaymentsAnalyticsCards
        formatCurrency={formatCurrency}
        formatNumber={formatNumber}
        monetizationSummary={monetizationSummary}
        totals={totals}
      />

      <Card>
        <CardHeader className="space-y-1">
          <CardTitle>{t('payments.searchPayments')}</CardTitle>
          <CardDescription>{t('payments.searchPaymentsDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setCurrentPage(1);
              }}
              placeholder={t('payments.searchPaymentsPlaceholder')}
              className="ps-9"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            {t('payments.showingPayments', {
              count: filteredPayments.length,
              total: payments.length,
            })}
          </div>
        </CardContent>
      </Card>

      <RecentTransactionsCard
        filteredPayments={filteredPayments}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
        paginatedPayments={paginatedPayments}
        setSelectedPayment={setSelectedPayment}
      />

      {filteredPayments.length > itemsPerPage && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          hasNextPage={currentPage < totalPages}
          hasPreviousPage={currentPage > 1}
          totalItems={filteredPayments.length}
          itemsPerPage={itemsPerPage}
        />
      )}

      <SelectedPaymentSheet
        formatCurrency={formatCurrency}
        selectedPayment={selectedPayment}
        selectedPaymentNotes={selectedPaymentNotes}
        setSelectedPayment={setSelectedPayment}
      />

      <Card>
        <CardHeader>
          <CardTitle>{t('payments.paymentMethods')}</CardTitle>
          <CardDescription>{t('payments.paymentMethodsDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {methodBreakdown.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('payments.noPaymentMethodInfo')}</p>
          ) : (
            methodBreakdown.map((item) => (
              <div
                key={item.method}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div>
                  <p className="text-sm font-medium">{formatPaymentMethodLabel(item.method, t)}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatNumber(item.count)} {t('financial.store.payments.payments')}
                  </p>
                </div>
                <p className="text-sm font-semibold">{formatCurrency(item.total)}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('payments.latestLedgerEntries')}</CardTitle>
          <CardDescription>{t('payments.latestLedgerDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('payments.noLedgerEntries')}</p>
          ) : (
            transactions.slice(0, 10).map((transaction) => (
              <div
                key={transaction.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4"
              >
                <div>
                  <p className="text-sm font-medium">
                    {t('payments.transactions')} #{formatNumber(transaction.id)}
                  </p>
                  <p className="text-xs text-muted-foreground">{transaction.type}</p>
                </div>
                <div className="text-end text-sm">
                  <p className="font-semibold">{formatCurrency(transaction.amount ?? 0)}</p>
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
