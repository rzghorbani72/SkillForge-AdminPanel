'use client';

import { FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { AcademySubscriptionInvoice } from '@/hooks/use-academy-subscription';
import { useTranslation } from '@/lib/i18n/hooks';
import { getLocaleForLanguage } from '@/lib/i18n/config';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import { getPlanDisplayName } from '@/lib/plan-display-name';

interface SubscriptionInvoicesListProps {
  invoices: AcademySubscriptionInvoice[];
  highlightId?: number;
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

export function SubscriptionInvoicesList({
  invoices,
  highlightId
}: SubscriptionInvoicesListProps) {
  const { t, language } = useTranslation();
  const locale = getLocaleForLanguage(language);
  const formatDate = useDateFormat();
  const rialLabel = t('common.rial');

  const handleViewInvoice = async (invoiceId: number) => {
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
    <div className="space-y-3">
      {invoices.map((invoice) => {
        const meta = STATUS_META[invoice.status] ?? STATUS_META.PENDING;
        const isPaid = invoice.status === 'PAID';
        const isFailed = invoice.status === 'FAILED';
        const showAmountLoud = isPaid || invoice.status === 'DUPLICATE';
        const amount = invoice.amount.toLocaleString(locale);
        const unit = currencyLabel(invoice.currency, rialLabel);
        const dateValue =
          invoice.paid_at ?? invoice.created_at ?? invoice.starts_at;

        return (
          <div
            key={invoice.id}
            className={cn(
              'flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between',
              isPaid &&
                'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20',
              isFailed &&
                'border-red-200 bg-red-50/40 dark:border-red-900 dark:bg-red-950/20',
              invoice.id === highlightId && 'ring-2 ring-primary'
            )}
          >
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-semibold text-foreground">
                  {getPlanDisplayName(invoice.plan_name)}
                </p>
                <Badge variant={meta.variant}>{t(meta.labelKey)}</Badge>
              </div>
              <p
                className={cn(
                  'tabular-nums tracking-tight text-foreground',
                  showAmountLoud
                    ? 'text-xl font-bold sm:text-2xl'
                    : 'text-base font-semibold text-muted-foreground'
                )}
              >
                {amount}
                <span className="ms-1.5 text-sm font-medium text-muted-foreground">
                  {unit}
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                {dateValue ? formatDate(dateValue) : null}
                {isPaid
                  ? ` · ${t('plans.invoicePeriod', {
                      start: formatDate(invoice.starts_at),
                      end: formatDate(invoice.ends_at)
                    })}`
                  : null}
                {isFailed ? ` · ${t('plans.invoiceFailedHint')}` : null}
              </p>
            </div>
            {isPaid ? (
              <Button
                size="sm"
                variant="outline"
                className="shrink-0"
                onClick={() => handleViewInvoice(invoice.id)}
              >
                <FileDown className="me-1.5 h-4 w-4" />
                {t('plans.downloadFactor')}
              </Button>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
