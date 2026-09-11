'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { formatPaymentMethodLabel } from '@/lib/format-payment-method-label';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { cn } from '@/lib/utils';
import type {
  AcademyPaymentRow,
  SettledPaymentStatus
} from '@/types/financial';

const PAGE_SIZE = 20;

const STATUS_TABS: { value: SettledPaymentStatus; labelKey: string }[] = [
  { value: 'PAID', labelKey: 'financial.store.overview.successTab' },
  { value: 'FAILED', labelKey: 'financial.store.overview.failedTab' }
];

const STATUS_CLASSES: Record<SettledPaymentStatus, string> = {
  PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300',
  FAILED:
    'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300'
};

function PaymentStatusBadge({
  status,
  label
}: {
  status: SettledPaymentStatus;
  label: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        STATUS_CLASSES[status]
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

interface AcademyPaymentsTableProps {
  startDate: string;
  endDate: string;
  formatDate: (isoString: string) => string;
}

export function AcademyPaymentsTable({
  startDate,
  endDate,
  formatDate
}: AcademyPaymentsTableProps) {
  const { t } = useTranslation();
  const formatCurrency = useFormatCurrency();
  const formatNumber = useNumberFormat();

  const [status, setStatus] = useState<SettledPaymentStatus>('PAID');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [payments, setPayments] = useState<AcademyPaymentRow[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  const loadPayments = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getPayments({
        status,
        page,
        limit: PAGE_SIZE,
        start_date: startDate,
        end_date: endDate
      });
      const list = Array.isArray(data)
        ? (data as AcademyPaymentRow[])
        : Array.isArray(data?.payments)
          ? (data.payments as AcademyPaymentRow[])
          : [];
      setPayments(list);
      setTotalPages(data?.pagination?.totalPages ?? 1);
    } catch (error) {
      ErrorHandler.handleApiError(error);
      setPayments([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [status, page, startDate, endDate]);

  useEffect(() => {
    void loadPayments();
  }, [loadPayments]);

  useEffect(() => {
    setPage(1);
  }, [startDate, endDate]);

  const statusLabel = (value: SettledPaymentStatus) =>
    t(
      value === 'PAID'
        ? 'financial.store.overview.statusPaid'
        : 'financial.store.overview.statusFailed'
    );

  return (
    <section className="space-y-3">
      <div className="flex w-fit flex-wrap gap-1 rounded-lg border bg-muted/30 p-1">
        {STATUS_TABS.map((tab) => (
          <button
            type="button"
            key={tab.value}
            onClick={() => {
              setStatus(tab.value);
              setPage(1);
            }}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-all',
              status === tab.value
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {t(tab.labelKey)}
          </button>
        ))}
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>{t('financial.store.overview.student')}</TableHead>
              <TableHead>{t('financial.store.overview.course')}</TableHead>
              <TableHead className="text-end">
                {t('financial.store.overview.amount')}
              </TableHead>
              <TableHead>{t('financial.store.overview.gateway')}</TableHead>
              <TableHead>{t('financial.store.overview.date')}</TableHead>
              <TableHead>{t('financial.store.overview.status')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-10 text-center text-muted-foreground"
                >
                  {t('common.loading')}
                </TableCell>
              </TableRow>
            ) : payments.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-10 text-center text-muted-foreground"
                >
                  {t('financial.store.overview.noPayments')}
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => {
                const gateway =
                  payment.provider ?? payment.gateway ?? payment.payment_method;
                return (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                      {payment.Profile?.display_name ?? '—'}
                    </TableCell>
                    <TableCell className="max-w-[220px] truncate text-sm text-muted-foreground">
                      {payment.Course?.title ?? '—'}
                    </TableCell>
                    <TableCell className="text-end font-semibold tabular-nums">
                      {formatCurrency(payment.amount, payment.currency)}
                    </TableCell>
                    <TableCell>
                      {gateway ? (
                        <Badge variant="outline" className="text-xs">
                          {formatPaymentMethodLabel(gateway, t)}
                        </Badge>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(payment.created_at)}
                    </TableCell>
                    <TableCell>
                      <PaymentStatusBadge
                        status={status}
                        label={statusLabel(status)}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {totalPages > 1 ? (
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">
            {t('financial.store.overview.pageOf', {
              page: formatNumber(page),
              total: formatNumber(totalPages)
            })}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              {t('common.previous')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage((value) => value + 1)}
            >
              {t('common.next')}
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
