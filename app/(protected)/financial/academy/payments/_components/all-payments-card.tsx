'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useTranslation } from '@/lib/i18n/hooks';
import { StatusBadge } from '@/components/shared/status-badge';
import type { AcademyPayment } from '@/types/financial';

export function AllPaymentsCard({
  formatCurrency,
  formatDate,
  payments,
}: {
  formatCurrency: (amount: number, currency?: string) => string;
  formatDate: (isoString: string) => string;
  payments: AcademyPayment[];
}) {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('financial.store.payments.allPayments')}</CardTitle>
        <CardDescription>{t('financial.store.payments.allPaymentsDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="table-h-scroll">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('financial.store.payments.date')}</TableHead>
              <TableHead>{t('financial.store.payments.student')}</TableHead>
              <TableHead>{t('financial.store.payments.course')}</TableHead>
              <TableHead>{t('financial.store.payments.method')}</TableHead>
              <TableHead>{t('financial.store.payments.status')}</TableHead>
              <TableHead className="text-end">{t('financial.store.payments.vat')}</TableHead>
              <TableHead className="text-end">
                {t('financial.store.payments.platformFee')}
              </TableHead>
              <TableHead className="text-end">
                {t('financial.store.payments.teacherPayout')}
              </TableHead>
              <TableHead className="text-end">{t('financial.store.payments.schoolNet')}</TableHead>
              <TableHead className="text-end">{t('financial.store.payments.amount')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="py-8 text-center text-muted-foreground">
                  {t('financial.store.payments.noPayments')}
                </TableCell>
              </TableRow>
            ) : (
              payments.map((p) => {
                const schoolNet =
                  p.school_net_revenue ??
                  Math.max(
                    0,
                    (p.amount ?? 0) -
                      (p.platform_fee ?? 0) -
                      (p.instructor_fee ?? 0) -
                      (p.tax_vat_amount ?? 0),
                  );

                return (
                  <TableRow key={p.id}>
                    <TableCell className="whitespace-nowrap text-sm">
                      {formatDate(p.created_at)}
                    </TableCell>
                    <TableCell className="font-medium">{p.profile?.display_name ?? '—'}</TableCell>
                    <TableCell className="max-w-[180px] truncate">
                      {p.course?.title ?? '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{p.method ?? '—'}</Badge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={
                          p.status === 'PAID'
                            ? 'success'
                            : p.status === 'PENDING'
                              ? 'pending'
                              : 'failed'
                        }
                        label={p.status}
                      />
                    </TableCell>
                    <TableCell className="text-end">
                      {formatCurrency(p.tax_vat_amount ?? 0, p.currency)}
                    </TableCell>
                    <TableCell className="text-end">
                      {formatCurrency(p.platform_fee ?? 0, p.currency)}
                    </TableCell>
                    <TableCell className="text-end">
                      {formatCurrency(p.instructor_fee ?? 0, p.currency)}
                    </TableCell>
                    <TableCell className="text-end">
                      {formatCurrency(schoolNet, p.currency)}
                    </TableCell>
                    <TableCell className="text-end font-semibold">
                      {formatCurrency(p.amount, p.currency)}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
