'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/hooks';
import { apiClient } from '@/lib/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Dispatch } from 'react';
import { STATUS_BADGES, paymentStatusLabel, formatDisplayUuid } from '../_lib/page-helpers';
import { Payment } from '@/types/api';

export function RecentTransactionsCard({
  filteredPayments,
  formatCurrency,
  formatDate,
  paginatedPayments,
  setSelectedPayment,
}: {
  filteredPayments: Payment[];
  formatCurrency: (amount: number, currency?: string) => string;
  formatDate: (value: string | Date, options?: Intl.DateTimeFormatOptions) => string;
  paginatedPayments: Payment[];
  setSelectedPayment: Dispatch<any>;
}) {
  const { t, language } = useTranslation();
  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle>{t('payments.recentTransactions')}</CardTitle>
        <CardDescription>{t('payments.recentTransactionsDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {filteredPayments.length === 0 ? (
          <div className="py-12 text-center">
            <CreditCard className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium">{t('payments.noTransactionsMatch')}</p>
            <p className="text-xs text-muted-foreground">{t('payments.adjustFilters')}</p>
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
                      const detail = await apiClient.getTransactionTrackingById(payment.id);
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
                    {payment.course?.title ?? payment.Course?.title ?? t('payments.unknownCourse')}
                  </TableCell>
                  <TableCell>{formatCurrency(payment.amount ?? 0)}</TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        STATUS_BADGES[payment.status] ?? 'bg-muted text-muted-foreground',
                      )}
                    >
                      {paymentStatusLabel(payment.status, t)}
                    </Badge>
                  </TableCell>
                  <TableCell>{(payment.gateway_id || payment.authority || '-') as any}</TableCell>
                  <TableCell>
                    {(() => {
                      const date = payment.paid_at ?? payment.payment_date ?? payment.created_at;
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
  );
}
