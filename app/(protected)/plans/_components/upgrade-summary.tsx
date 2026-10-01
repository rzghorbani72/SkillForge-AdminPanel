'use client';

import type { AcademyUpgradeQuote } from '@/lib/api';
import { cn } from '@/lib/utils';
import { getPlanDisplayName } from '@/lib/plan-display-name';
import { formatPrice, vatAmount } from '@/components/plans/plan-types';

// ── Sub-components ───────────────────────────────────────────────────────────

export function UpgradeSummary({
  quote,
  appliedVoucher,
  t,
}: {
  quote: AcademyUpgradeQuote;
  appliedVoucher?: { discountAmount: number; finalAmount: number } | null;
  t: (key: string, params?: Record<string, string | number>) => string;
}) {
  const hasStorageCredit = quote.storage_amount_toman !== 0;
  const hasVoucher = appliedVoucher != null && appliedVoucher.discountAmount > 0;
  const discountedSubtotal = hasVoucher ? appliedVoucher.finalAmount : quote.amount_toman;
  const vatRate = quote.vat_rate ?? 0;
  const vat = vatAmount(discountedSubtotal, vatRate);
  const finalPrice = discountedSubtotal + vat;

  return (
    <div className="rounded-lg border bg-muted/40 px-3 py-2.5 text-sm">
      <p className="text-[11px] leading-snug text-muted-foreground">
        {t('plans.upgradeWhyLess', {
          days: quote.remainingDays,
          plan: getPlanDisplayName(quote.fromSlug) ?? quote.fromSlug,
        })}
      </p>
      <div className="mt-2 space-y-1">
        <div className="flex items-center justify-between text-muted-foreground">
          <span>{t('plans.planDiff')}</span>
          <span className="tabular-nums">
            {formatPrice(quote.plan_amount_toman)} {t('plans.toman')}
          </span>
        </div>
        {hasStorageCredit && (
          <div className="flex items-center justify-between text-success">
            <span>{t('plans.storageCredit')}</span>
            <span className="tabular-nums">
              − {formatPrice(Math.abs(quote.storage_amount_toman))} {t('plans.toman')}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-border/50 pt-1.5 font-bold">
          <span>{t('plans.proratedTotal')}</span>
          <span
            className={cn(
              'tabular-nums',
              (hasVoucher || vat > 0) && 'text-sm font-normal text-muted-foreground line-through',
            )}
          >
            {formatPrice(quote.amount_toman)} {t('plans.toman')}
          </span>
        </div>
        {hasVoucher && (
          <div className="flex items-center justify-between font-medium text-success">
            <span>{t('plans.voucherDiscount')}</span>
            <span className="tabular-nums">
              − {formatPrice(appliedVoucher.discountAmount)} {t('plans.toman')}
            </span>
          </div>
        )}
        {vat > 0 && (
          <div className="flex items-center justify-between text-muted-foreground">
            <span>{t('plans.vatIncluded', { percent: Math.round(vatRate * 100) })}</span>
            <span className="tabular-nums">
              + {formatPrice(vat)} {t('plans.toman')}
            </span>
          </div>
        )}
        {(hasVoucher || vat > 0) && (
          <div className="flex items-center justify-between border-t border-border/50 pt-1 font-bold text-primary">
            <span>{t('plans.finalPayableAmount')}</span>
            <span className="tabular-nums">
              {formatPrice(finalPrice)} {t('plans.toman')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
