'use client';

import { cn } from '@/lib/utils';
import { type BillingPeriod } from '@/components/plans/plan-types';

export function BillingPeriodToggle({
  period,
  setPeriod,
  t,
}: {
  period: BillingPeriod;
  setPeriod: (p: BillingPeriod) => void;
  t: (key: string) => string;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="inline-flex rounded-xl border border-border bg-muted/50 p-1">
        {(['monthly', 'quarterly'] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150',
              period === p
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t(`plans.${p}`)}
          </button>
        ))}
      </div>
      {period === 'quarterly' && (
        <p className="max-w-md text-center text-xs text-muted-foreground">
          {t('plans.quarterlyHint')}
        </p>
      )}
    </div>
  );
}
