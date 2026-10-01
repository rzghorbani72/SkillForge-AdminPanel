'use client';

import { Check, Building2 } from 'lucide-react';

// Enterprise has no fixed price or storage cap in the plan catalog — it is a
// custom deal closed by sales, not a self-serve tier, so this card always
// routes to "contact us" instead of a price + choose-plan button.
export function EnterprisePlanCard({
  onContact,
  t,
}: {
  onContact: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}) {
  const features = [
    t('plans.enterpriseFeature1'),
    t('plans.enterpriseFeature2'),
    t('plans.enterpriseFeature3'),
  ];
  return (
    <div
      dir="rtl"
      className="relative flex h-full flex-col rounded-2xl border border-dashed border-border bg-muted/20 p-8"
    >
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
        <Building2 className="h-5 w-5 text-primary" />
      </div>

      <h2 className="mt-4 text-center text-lg font-bold text-foreground">
        {t('plans.enterprisePlanName')}
      </h2>
      <p className="mt-1.5 text-center text-[13px] text-muted-foreground">
        {t('plans.enterpriseTagline')}
      </p>

      <p className="mt-6 text-center">
        <span className="text-[26px] font-black leading-none text-foreground">
          {t('plans.enterprisePriceLabel')}
        </span>
      </p>

      <ul className="mt-7 flex flex-1 flex-col gap-3.5">
        {features.map((feature, fi) => (
          <li
            key={fi}
            className="flex items-start gap-2.5 text-[13.5px] leading-[1.7] text-foreground/80"
          >
            <Check size={15} strokeWidth={3} aria-hidden className="mt-1 shrink-0 text-primary" />
            {feature}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onContact}
        className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-border bg-card text-sm font-bold text-foreground transition-all duration-150 hover:border-primary/40"
      >
        {t('plans.contactSales')}
      </button>
    </div>
  );
}
