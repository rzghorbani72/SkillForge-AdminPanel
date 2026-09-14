'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPaymentMethodLabel } from '@/lib/format-payment-method-label';
import { useTranslation } from '@/lib/i18n/hooks';
import { formatDate } from '@/lib/utils';
import type { AnalyticsPaymentDetail } from '@/types/analytics';
import { useIranMoney } from '../_hooks/use-iran-money';

function statusLabel(status: string, t: (key: string) => string): string {
  const key = `analytics.paymentStatus.${status}`;
  const label = t(key);
  return label === key ? status : label;
}

export function PaymentDetailsTable({ payments }: { payments: AnalyticsPaymentDetail[] }) {
  const { t, language } = useTranslation();
  const { formatRial } = useIranMoney();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('analytics.paymentDetails')}</CardTitle>
        <CardDescription>{t('analytics.paymentDetailsDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('analytics.noPaymentDetails')}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('payments.colDate')}</TableHead>
                <TableHead>{t('payments.colCourse')}</TableHead>
                <TableHead>{t('analytics.gateway')}</TableHead>
                <TableHead>{t('payments.colStatus')}</TableHead>
                <TableHead>{t('analytics.bankAmount')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{formatDate(row.paid_at ?? row.created_at, language)}</TableCell>
                  <TableCell>{row.course_title ?? t('analytics.noCourse')}</TableCell>
                  <TableCell>
                    {formatPaymentMethodLabel(row.gateway ?? row.provider ?? row.payment_method, t)}
                    {row.bank_ref ? (
                      <p className="text-xs text-muted-foreground">{row.bank_ref}</p>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{statusLabel(row.status, t)}</Badge>
                  </TableCell>
                  <TableCell>{formatRial(row.bank_amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
