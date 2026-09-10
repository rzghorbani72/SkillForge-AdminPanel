'use client';

import { FileDown } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import type { AcademySubscriptionInvoice } from '@/hooks/use-academy-subscription';
import { useTranslation } from '@/lib/i18n/hooks';
import { getLocaleForLanguage } from '@/lib/i18n/config';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import { getPlanDisplayName } from '@/lib/plan-display-name';

interface SubscriptionInvoicesListProps {
  invoices: AcademySubscriptionInvoice[];
  highlightId?: string | number;
}

const STATUS_META: Record<
  string,
  { labelKey: string; variant: 'default' | 'secondary' | 'destructive' }
> = {
  PAID: { labelKey: 'plans.invoiceStatusPaid', variant: 'default' },
  PENDING: { labelKey: 'plans.invoiceStatusPending', variant: 'secondary' },
  FAILED: { labelKey: 'plans.invoiceStatusFailed', variant: 'destructive' },
  CANCELLED: {
    labelKey: 'plans.invoiceStatusCancelled',
    variant: 'secondary'
  },
  DUPLICATE: {
    labelKey: 'plans.invoiceStatusDuplicate',
    variant: 'destructive'
  }
};

function currencyLabel(code: string, rialLabel: string): string {
  return code.toUpperCase() === 'IRR' ? rialLabel : code;
}

function dash(value: string | null | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : '—';
}

export function SubscriptionInvoicesList({
  invoices,
  highlightId
}: SubscriptionInvoicesListProps) {
  const { t, language } = useTranslation();
  const locale = getLocaleForLanguage(language);
  const formatDate = useDateFormat();
  const rialLabel = t('common.rial');

  const handleViewInvoice = async (invoiceId: string | number) => {
    const { apiClient } = await import('@/lib/api');
    const url = apiClient.getCurrentAcademySubscriptionInvoicePdfUrl(invoiceId);
    window.open(url, '_blank');
  };

  if (!invoices.length) {
    return (
      <p className="text-sm text-muted-foreground">{t('plans.noInvoices')}</p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead>{t('plans.invoicePlan')}</TableHead>
            <TableHead>{t('plans.invoiceStatus')}</TableHead>
            <TableHead className="text-end">
              {t('plans.invoiceAmount')}
            </TableHead>
            <TableHead className="text-end">
              {t('plans.invoiceNetAmount')}
            </TableHead>
            <TableHead className="text-end">
              {t('plans.invoiceVatShort')}
            </TableHead>
            <TableHead>{t('plans.invoiceDiscountCode')}</TableHead>
            <TableHead>{t('plans.invoicePaidOn')}</TableHead>
            <TableHead>{t('plans.invoicePeriodLabel')}</TableHead>
            <TableHead>{t('plans.payTrackingCode')}</TableHead>
            <TableHead className="text-end">
              {t('plans.invoiceActions')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => {
            const meta = STATUS_META[invoice.status] ?? STATUS_META.PENDING;
            const isPaid = invoice.status === 'PAID';
            const unit = currencyLabel(invoice.currency, rialLabel);
            const paidOn = invoice.paid_at ?? null;
            const dateValue = paidOn ?? invoice.created_at ?? null;
            const tracking = dash(invoice.tracking_code ?? invoice.authority);
            const discount =
              invoice.discount_code != null && invoice.discount_code !== ''
                ? `${invoice.discount_code}${
                    invoice.discount_amount
                      ? ` (${invoice.discount_amount.toLocaleString(locale)} ${unit})`
                      : ''
                  }`
                : '—';

            return (
              <TableRow
                key={invoice.id}
                className={cn(
                  invoice.id === highlightId && 'bg-primary/5',
                  invoice.status === 'FAILED' &&
                    'bg-red-50/40 dark:bg-red-950/10'
                )}
              >
                <TableCell className="whitespace-nowrap font-medium">
                  {getPlanDisplayName(invoice.plan_name)}
                </TableCell>
                <TableCell>
                  <Badge variant={meta.variant}>{t(meta.labelKey)}</Badge>
                </TableCell>
                <TableCell className="whitespace-nowrap text-end tabular-nums">
                  {invoice.amount.toLocaleString(locale)} {unit}
                </TableCell>
                <TableCell className="whitespace-nowrap text-end tabular-nums text-muted-foreground">
                  {invoice.net_amount != null
                    ? `${invoice.net_amount.toLocaleString(locale)} ${unit}`
                    : '—'}
                </TableCell>
                <TableCell className="whitespace-nowrap text-end tabular-nums text-muted-foreground">
                  {invoice.vat_amount != null
                    ? `${invoice.vat_amount.toLocaleString(locale)} ${unit}`
                    : '—'}
                </TableCell>
                <TableCell className="whitespace-nowrap font-mono text-xs">
                  {discount}
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {dateValue ? formatDate(dateValue) : '—'}
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {isPaid
                    ? t('plans.invoicePeriod', {
                        start: formatDate(invoice.starts_at),
                        end: formatDate(invoice.ends_at)
                      })
                    : '—'}
                </TableCell>
                <TableCell
                  className="max-w-[12rem] truncate font-mono text-xs"
                  title={tracking === '—' ? undefined : tracking}
                >
                  {tracking}
                </TableCell>
                <TableCell className="text-end">
                  {isPaid ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewInvoice(invoice.id)}
                    >
                      <FileDown className="me-1.5 h-4 w-4" />
                      {t('plans.downloadFactor')}
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
