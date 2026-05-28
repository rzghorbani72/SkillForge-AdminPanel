'use client';

import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/hooks';
import { PricingType, PRICING_OPTION_KEYS } from './course-modal-types';

interface Step3Props {
  pricingType: PricingType;
  setPricingType: (t: PricingType) => void;
  price: string;
  setPrice: (v: string) => void;
  discount: string;
  setDiscount: (v: string) => void;
  affiliateEnabled: boolean;
  setAffiliateEnabled: (v: boolean) => void;
  commission: string;
  setCommission: (v: string) => void;
  cookieDays: string;
  setCookieDays: (v: string) => void;
}

export function Step3Pricing({
  pricingType,
  setPricingType,
  price,
  setPrice,
  discount,
  setDiscount,
  affiliateEnabled,
  setAffiliateEnabled,
  commission,
  setCommission,
  cookieDays,
  setCookieDays
}: Step3Props) {
  const { t } = useTranslation();

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {PRICING_OPTION_KEYS.map((opt) => {
          const selected = pricingType === opt.type;
          return (
            <button
              key={opt.type}
              type="button"
              onClick={() => setPricingType(opt.type)}
              className={cn(
                'flex flex-col items-start gap-0.5 rounded-xl border p-3 text-right transition-all',
                selected
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : 'hover:border-primary/30 hover:bg-muted/30'
              )}
            >
              <div className="flex w-full items-center justify-between">
                <span className="text-[13px] font-semibold">
                  {t(opt.labelKey)}
                </span>
                <div
                  className={cn(
                    'h-3.5 w-3.5 rounded-full border-2',
                    selected
                      ? 'border-primary bg-primary'
                      : 'border-muted-foreground/40'
                  )}
                />
              </div>
              <span className="w-full text-start text-[10.5px] text-muted-foreground">
                {t(opt.subKey)}
              </span>
            </button>
          );
        })}
      </div>

      {pricingType !== 'FREE' && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold">
              {t('courses.priceInToman')}
            </label>
            <input
              type="number"
              min="0"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10"
              placeholder={t('courses.pricePlaceholderExample')}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold">
              {t('courses.discountPercent')}
            </label>
            <input
              type="number"
              min="0"
              max="100"
              aria-label={t('courses.discountPercent')}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13.5px] font-semibold">
              {t('courses.enableAffiliate')}
            </p>
            <p className="mt-0.5 text-[11.5px] text-muted-foreground">
              {t('courses.affiliateDesc')}
            </p>
          </div>
          <button
            type="button"
            aria-label={t('courses.enableAffiliate')}
            onClick={() => setAffiliateEnabled(!affiliateEnabled)}
            className={cn(
              'relative h-6 w-11 rounded-full transition-colors',
              affiliateEnabled ? 'bg-primary' : 'bg-muted-foreground/30'
            )}
          >
            <span
              className={cn(
                'absolute start-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all',
                affiliateEnabled
                  ? 'translate-x-5 rtl:-translate-x-5'
                  : 'translate-x-0'
              )}
            />
          </button>
        </div>

        {affiliateEnabled && (
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border/60 pt-4">
            <div className="space-y-1.5">
              <label className="text-[12.5px] font-medium">
                {t('courses.commissionPercent')}
              </label>
              <input
                type="number"
                min="0"
                max="100"
                aria-label={t('courses.commissionPercent')}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10"
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12.5px] font-medium">
                {t('courses.cookieDays')}
              </label>
              <input
                type="number"
                min="1"
                aria-label={t('courses.cookieDays')}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10"
                value={cookieDays}
                onChange={(e) => setCookieDays(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
