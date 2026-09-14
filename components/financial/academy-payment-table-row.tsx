'use client';

import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';
import { formatPaymentMethodLabel } from '@/lib/format-payment-method-label';
import { cn } from '@/lib/utils';
import type { AcademyPaymentRow, SettledPaymentStatus } from '@/types/financial';

const STATUS_CLASSES: Record<SettledPaymentStatus, string> = {
  PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300',
  FAILED: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300',
};

type Translate = (key: string) => string;
type FormatMoney = (amount: number, currency?: string) => string;

interface AcademyPaymentTableRowProps {
  payment: AcademyPaymentRow;
  status: SettledPaymentStatus;
  statusLabel: string;
  formatCurrency: FormatMoney;
  formatDate: (isoString: string) => string;
  t: Translate;
}

export function AcademyPaymentTableRow({
  payment,
  status,
  statusLabel,
  formatCurrency,
  formatDate,
  t,
}: AcademyPaymentTableRowProps) {
  const gateway = payment.provider ?? payment.gateway ?? payment.payment_method;
  const refunded = payment.refund_amount ?? 0;

  return (
    <TableRow>
      <TableCell className="font-medium">{payment.Profile?.display_name ?? '—'}</TableCell>
      <TableCell className="max-w-[180px] truncate text-sm text-muted-foreground">
        {payment.Course?.title ?? '—'}
      </TableCell>
      <TableCell className="text-end tabular-nums">
        <div>{formatCurrency(payment.discount_amount ?? 0, payment.currency)}</div>
        {payment.coupon_code ? (
          <div className="text-[11px] text-muted-foreground">{payment.coupon_code}</div>
        ) : null}
      </TableCell>
      <TableCell className="text-end tabular-nums">
        {formatCurrency(payment.vat_amount ?? 0, payment.currency)}
      </TableCell>
      <TableCell className="text-end font-semibold tabular-nums">
        {formatCurrency(payment.amount, payment.currency)}
      </TableCell>
      <TableCell className="text-end tabular-nums">
        <div>{formatCurrency(payment.school_net_revenue ?? 0, payment.currency)}</div>
        {refunded > 0 ? (
          <div className="text-[11px] text-muted-foreground">
            {t('financial.store.overview.refunded')} {formatCurrency(refunded, payment.currency)}
          </div>
        ) : null}
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
      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
        {formatDate(payment.created_at)}
      </TableCell>
      <TableCell>
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
            STATUS_CLASSES[status],
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {statusLabel}
        </span>
      </TableCell>
    </TableRow>
  );
}
