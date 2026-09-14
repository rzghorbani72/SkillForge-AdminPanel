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
  Download,
  Search,
  RefreshCw
} from 'lucide-react';
import { usePaymentsData } from './_hooks/use-payments-data';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { formatPaymentMethodLabel } from '@/lib/format-payment-method-label';
import { toPersianDigits } from '@/lib/phone-utils';
import { Pagination } from '@/components/shared/Pagination';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { apiClient } from '@/lib/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

const STATUS_BADGES: Record<string, string> = {
  PAID: 'bg-green-100 text-green-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  FAILED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-blue-100 text-blue-800',
  CANCELLED: 'bg-muted text-foreground'
};

function paymentStatusLabel(
  status: string | undefined,
  t: (key: string) => string
): string {
  switch (status?.toUpperCase()) {
    case 'PAID':
      return t('financial.store.overview.statusPaid');
    case 'PENDING':
      return t('financial.store.overview.statusPending');
    case 'FAILED':
      return t('financial.store.overview.statusFailed');
    case 'REFUNDED':
      return t('financial.store.overview.statusRefunded');
    case 'CANCELLED':
      return t('payments.cancelled');
    default:
      return status ?? '—';
  }
}

function formatDisplayUuid(uuid: string | undefined, language: string): string {
  if (!uuid) return '—';
  return language === 'fa' ? toPersianDigits(uuid) : uuid;
}

type PaymentNotes = {
  s?: string;
  p?: string;
  m?: string;
  a?: number;
  pf?: number;
  tp?: number;
  sn?: number;
};

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
  const { t, language } = useTranslation();
  const formatNumber = useNumberFormat();
  const formatDate = useDateFormat();
  const formatCurrency = useFormatCurrency();
  const { payments, transactions, monetizationSummary, isLoading, refresh } =
    usePaymentsData();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const selectedPaymentNotes = useMemo(
    () => parsePaymentNotes(selectedPayment?.notes),
    [selectedPayment]
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
        payment.course?.title?.toLowerCase() ??
        payment.Course?.title?.toLowerCase() ??
        '';
      const status = payment.status?.toLowerCase() ?? '';
      const method =
        payment.method?.toLowerCase() ??
        payment.payment_method?.toLowerCase() ??
        '';
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

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPayments.length / itemsPerPage)
  );

  const totals = useMemo(() => {
    const revenue = payments.reduce(
      (sum, payment) => sum + (payment.amount ?? 0),
      0
    );
    const completed = payments.filter(
      (payment) => payment.status === 'PAID'
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
      total: data.total
    }));
  }, [payments]);

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-4 sm:p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
            <p className="mt-2 text-sm text-muted-foreground">
              {t('common.loading')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6" dir={'rtl'}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('payments.transactions')}
          </h1>
          <p className="text-muted-foreground">
            {t('payments.transactionsDescription')}
          </p>
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

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t('analytics.totalRevenue')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {monetizationSummary?.visibility?.can_view_store_revenue ? (
              <p className="text-2xl font-bold">
                {formatCurrency(totals.revenue)}
              </p>
            ) : (
              <p className="text-2xl font-bold">
                {t('financial.store.revenue.hidden')}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {monetizationSummary?.visibility?.can_view_store_revenue
                ? t('analytics.acrossAllPayments')
                : t('financial.store.revenue.revenueHiddenPolicy')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t('payments.completed')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatNumber(totals.completed)}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('payments.successfulPayments')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t('payments.pending')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatNumber(totals.pending)}</p>
            <p className="text-xs text-muted-foreground">
              {t('payments.awaitingConfirmation')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t('payments.failed')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatNumber(totals.failed)}</p>
            <p className="text-xs text-muted-foreground">
              {t('payments.requiresFollowUp')}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="space-y-1">
          <CardTitle>{t('payments.searchPayments')}</CardTitle>
          <CardDescription>
            {t('payments.searchPaymentsDescription')}
          </CardDescription>
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
              total: payments.length
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-1">
          <CardTitle>{t('payments.recentTransactions')}</CardTitle>
          <CardDescription>
            {t('payments.recentTransactionsDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredPayments.length === 0 ? (
            <div className="py-12 text-center">
              <CreditCard className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium">
                {t('payments.noTransactionsMatch')}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('payments.adjustFilters')}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('payments.colUuid')}</TableHead>
                  <TableHead>{t('payments.colStudent')}</TableHead>
                  <TableHead>{t('payments.colCourse')}</TableHead>
                  <TableHead>{t('payments.colAmount')}</TableHead>
                  <TableHead>{t('payments.colStatus')}</TableHead>
                  <TableHead>{t('payments.colGatewayRef')}</TableHead>
                  <TableHead>{t('payments.colDate')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPayments.map((payment) => (
                  <TableRow
                    key={payment.id}
                    className="cursor-pointer"
                    onClick={async () => {
                      try {
                        const detail =
                          await apiClient.getTransactionTrackingById(
                            payment.id
                          );
                        setSelectedPayment(detail ?? payment);
                      } catch {
                        setSelectedPayment(payment);
                      }
                    }}
                  >
                    <TableCell className="max-w-[180px] truncate" dir="ltr">
                      {formatDisplayUuid((payment as any).uuid, language)}
                    </TableCell>
                    <TableCell>
                      {payment.user?.display_name ??
                        payment.Profile?.display_name ??
                        t('payments.unknownStudent')}
                    </TableCell>
                    <TableCell>
                      {payment.course?.title ??
                        payment.Course?.title ??
                        t('payments.unknownCourse')}
                    </TableCell>
                    <TableCell>{formatCurrency(payment.amount ?? 0)}</TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          STATUS_BADGES[payment.status] ??
                            'bg-muted text-muted-foreground'
                        )}
                      >
                        {paymentStatusLabel(payment.status, t)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {(payment.gateway_id || payment.authority || '-') as any}
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const date =
                          payment.paid_at ??
                          payment.payment_date ??
                          payment.created_at;
                        return date ? formatDate(date) : '—';
                      })()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

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

      <Sheet
        open={!!selectedPayment}
        onOpenChange={(open) => {
          if (!open) setSelectedPayment(null);
        }}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>
              {t('payments.detailTitle', {
                student:
                  selectedPayment?.user?.display_name ??
                  selectedPayment?.Profile?.display_name ??
                  t('payments.unknownStudent')
              })}
            </SheetTitle>
            <SheetDescription>
              {t('payments.detailDescription')}
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-2 py-4 text-sm">
            <div>
              {t('payments.colUuid')}:{' '}
              {formatDisplayUuid(selectedPayment?.uuid, language)}
            </div>
            <div>
              {t('payments.colStatus')}:{' '}
              {paymentStatusLabel(selectedPayment?.status, t)}
            </div>
            <div>
              {t('payments.colGatewayRef')}:{' '}
              {selectedPayment?.gateway_id || '-'}
            </div>
            <div>
              {t('payments.detailAuthority')}:{' '}
              {selectedPayment?.authority || '-'}
            </div>
            <div>
              {t('payments.detailPlatformCommission')}:{' '}
              {formatCurrency(
                selectedPayment?.financials?.platform_commission ??
                  selectedPayment?.platform_fee ??
                  0
              )}
            </div>
            {selectedPayment?.credit_amount ? (
              <div>
                {t('payments.creditApplied')}:{' '}
                {formatCurrency(selectedPayment.credit_amount)}
              </div>
            ) : null}
            <div>
              {t('payments.detailVat')}:{' '}
              {formatCurrency(selectedPayment?.financials?.vat_amount ?? 0)}
            </div>
            <div>
              {t('payments.detailAcademyRevenue')}:{' '}
              {formatCurrency(
                selectedPayment?.financials?.academy_revenue ?? 0
              )}
            </div>
            {selectedPaymentNotes ? (
              <>
                <div>
                  {t('payments.detailFlow')}: {selectedPaymentNotes.s || '-'}
                </div>
                <div>
                  {t('payments.detailPricingProfile')}:{' '}
                  {selectedPaymentNotes.p || '-'}
                </div>
                <div>
                  {t('payments.detailMarket')}: {selectedPaymentNotes.m || '-'}
                </div>
                <div>
                  {t('payments.detailAffiliateFee')}:{' '}
                  {formatCurrency(selectedPaymentNotes.a ?? 0)}
                </div>
                <div>
                  {t('payments.detailPlatformFee')}:{' '}
                  {formatCurrency(selectedPaymentNotes.pf ?? 0)}
                </div>
                <div>
                  {t('payments.detailInstructorShare')}:{' '}
                  {formatCurrency(selectedPaymentNotes.tp ?? 0)}
                </div>
                <div>
                  {t('payments.detailNetSettlement')}:{' '}
                  {formatCurrency(selectedPaymentNotes.sn ?? 0)}
                </div>
              </>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>

      <Card>
        <CardHeader>
          <CardTitle>{t('payments.paymentMethods')}</CardTitle>
          <CardDescription>
            {t('payments.paymentMethodsDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {methodBreakdown.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t('payments.noPaymentMethodInfo')}
            </p>
          ) : (
            methodBreakdown.map((item) => (
              <div
                key={item.method}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div>
                  <p className="text-sm font-medium">
                    {formatPaymentMethodLabel(item.method, t)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatNumber(item.count)}{' '}
                    {t('financial.store.payments.payments')}
                  </p>
                </div>
                <p className="text-sm font-semibold">
                  {formatCurrency(item.total)}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('payments.latestLedgerEntries')}</CardTitle>
          <CardDescription>
            {t('payments.latestLedgerDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t('payments.noLedgerEntries')}
            </p>
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
                  <p className="text-xs text-muted-foreground">
                    {transaction.type}
                  </p>
                </div>
                <div className="text-end text-sm">
                  <p className="font-semibold">
                    {formatCurrency(transaction.amount ?? 0)}
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
