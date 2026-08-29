'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { AcademySubscriptionInvoice } from '@/hooks/use-academy-subscription';
import { useTranslation } from '@/lib/i18n/hooks';
import { getLocaleForLanguage } from '@/lib/i18n/config';
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
  // Paid a second time for a period the academy already owned: nothing was
  // granted and the amount is owed back.
  DUPLICATE: {
    labelKey: 'plans.invoiceStatusDuplicate',
    variant: 'destructive'
  }
};

export function SubscriptionInvoicesList({
  invoices,
  highlightId
}: SubscriptionInvoicesListProps) {
  const { t, language } = useTranslation();
  const locale = getLocaleForLanguage(language);

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
    <div className="space-y-2">
      {invoices.map((invoice) => {
        const meta = STATUS_META[invoice.status] ?? STATUS_META.PENDING;
        const isPaid = invoice.status === 'PAID';
        return (
          <div
            key={invoice.id}
            className={cn(
              'flex items-center justify-between gap-3 rounded-lg border px-3 py-2',
              invoice.id === highlightId && 'border-primary bg-primary/5'
            )}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-xs font-medium text-foreground">
                  {getPlanDisplayName(invoice.plan_name)}
                </p>
                <Badge variant={meta.variant}>{t(meta.labelKey)}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {invoice.amount.toLocaleString(locale)} {invoice.currency}
                {invoice.paid_at
                  ? ` · ${new Date(invoice.paid_at).toLocaleDateString(locale)}`
                  : ''}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              disabled={!isPaid}
              onClick={() => handleViewInvoice(invoice.id)}
            >
              {t('plans.downloadFactor')}
            </Button>
          </div>
        );
      })}
    </div>
  );
}
