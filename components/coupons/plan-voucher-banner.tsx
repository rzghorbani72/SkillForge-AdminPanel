'use client';

import { useState } from 'react';
import Link from '@/components/ui/link';
import { Check, Copy, Ticket } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { usePercentLabel } from '@/lib/i18n/use-percent-label';
import { useRedeemablePlanVouchers } from '@/hooks/use-redeemable-plan-vouchers';
import { COUPON_TYPE_LABEL_KEY, couponTypeOf, type CouponSummary } from '@/lib/coupons';
import { cn } from '@/lib/utils';

function offerLabel(
  voucher: CouponSummary,
  t: (key: string, params?: Record<string, string | number>) => string,
  formatNumber: (n: number) => string,
  formatPercent: (n: number) => string,
): string {
  const type = couponTypeOf(voucher);
  if (type === 'FREE_TRIAL') {
    return t('coupons.daysValue', { count: voucher.free_trial_days ?? 0 });
  }
  if (type === 'FULL_DISCOUNT') return formatPercent(100);
  if (type === 'PERCENT') return formatPercent(voucher.discount_value ?? 0);
  return formatNumber(voucher.discount_value ?? 0);
}

function CodeChip({ code }: { code: string }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard may be blocked; keep quiet.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      title={t('coupons.bannerCopyCode', { code })}
      aria-label={t('coupons.bannerCopyCode', { code })}
      className="border-current/20 inline-flex items-center gap-1 rounded border bg-background/40 px-1.5 py-0.5 font-mono text-xs font-bold tracking-wide hover:bg-background/70"
    >
      {code}
      {copied ? (
        <Check className="h-3 w-3 shrink-0" aria-hidden />
      ) : (
        <Copy className="h-3 w-3 shrink-0 opacity-70" aria-hidden />
      )}
    </button>
  );
}

/**
 * Full-width strip stuck above sidebar + header: tells a manager they have a
 * usable Mentoma plan voucher (all-managers or targeted to them). Same codes
 * also appear on /coupons/plan-vouchers.
 */
export function PlanVoucherBanner({ className }: { className?: string }) {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const formatPercent = usePercentLabel();
  const { vouchers, loading } = useRedeemablePlanVouchers();

  if (loading || vouchers.length === 0) return null;

  const primary = vouchers[0];
  const offer = offerLabel(primary, t, formatNumber, formatPercent);
  const typeLabel = t(COUPON_TYPE_LABEL_KEY[couponTypeOf(primary)]);
  const redeemHref =
    vouchers.length === 1
      ? `/plans?voucher=${encodeURIComponent(primary.code)}`
      : '/coupons/plan-vouchers';

  return (
    <div
      role="status"
      className={cn(
        'flex min-h-8 items-center gap-2 border-b border-brandGreen/25 bg-brandGreen/15 px-4 py-1.5 text-xs text-foreground backdrop-blur-sm md:px-6',
        className,
      )}
    >
      <Ticket className="h-3.5 w-3.5 shrink-0 text-brandGreen" aria-hidden />
      <p className="min-w-0 flex-1 truncate">
        {vouchers.length === 1 ? (
          <>
            {t('coupons.bannerSingleIntro')} <CodeChip code={primary.code} />{' '}
            <span className="text-muted-foreground">
              ({typeLabel}: {offer})
            </span>
          </>
        ) : (
          <>
            {t('coupons.bannerMultiIntro', { count: vouchers.length })}{' '}
            {vouchers.slice(0, 3).map((voucher, index) => (
              <span key={voucher.id} className="inline-flex items-center">
                {index > 0 ? <span className="mx-1 text-muted-foreground">·</span> : null}
                <CodeChip code={voucher.code} />
              </span>
            ))}
            {vouchers.length > 3 ? (
              <span className="ms-1 text-muted-foreground">
                {t('coupons.bannerMore', { count: vouchers.length - 3 })}
              </span>
            ) : null}
          </>
        )}
      </p>
      <Link
        href={redeemHref}
        className="shrink-0 font-semibold text-brandGreen underline-offset-2 hover:underline"
      >
        {vouchers.length === 1 ? t('coupons.bannerUseOnPlans') : t('coupons.bannerViewAll')}
      </Link>
    </div>
  );
}
