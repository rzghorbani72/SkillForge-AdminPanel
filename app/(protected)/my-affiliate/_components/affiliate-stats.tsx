'use client';

import { MousePointerClick, ShoppingCart, Wallet, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/hooks';
import type { Dispatch, SetStateAction } from 'react';
import { AffiliateLink, LinkCard } from '../_lib/page-helpers';

export function AffiliateStats({
  formatCurrency,
  links,
  setAmount,
  setDialogLink,
  totals,
}: {
  formatCurrency: (amount: number, currency?: string) => string;
  links: AffiliateLink[];
  setAmount: Dispatch<SetStateAction<string>>;
  setDialogLink: Dispatch<SetStateAction<AffiliateLink | null>>;
  totals: { clicks: number; sales: number; earned: number; available: number };
}) {
  const { t } = useTranslation();
  return (
    <>
      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            icon: <MousePointerClick className="h-5 w-5 text-blue-600" />,
            label: t('affiliates.totalClicks'),
            value: totals.clicks,
            color: 'bg-blue-100',
          },
          {
            icon: <ShoppingCart className="h-5 w-5 text-amber-600" />,
            label: t('affiliates.totalSales'),
            value: totals.sales,
            color: 'bg-amber-100',
          },
          {
            icon: <TrendingUp className="h-5 w-5 text-violet-600" />,
            label: t('affiliates.totalEarned'),
            value: formatCurrency(totals.earned),
            color: 'bg-violet-100',
          },
          {
            icon: <Wallet className="h-5 w-5 text-emerald-600" />,
            label: t('affiliates.available'),
            value: formatCurrency(totals.available),
            color: 'bg-emerald-100',
          },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-3 rounded-xl border bg-card p-4">
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                s.color,
              )}
            >
              {s.icon}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-lg font-bold">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Link cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {links.map((l) => (
          <LinkCard
            key={l.id}
            link={l}
            onRequestPayout={(link) => {
              setDialogLink(link);
              setAmount(link.available_balance.toFixed(0));
            }}
            formatCurrency={formatCurrency}
            t={t}
          />
        ))}
      </div>
    </>
  );
}
