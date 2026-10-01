'use client';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Zap, CheckCircle2, HardDrive, Pencil, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  SubscriptionPlanData,
  formatPrice,
  formatStorage,
  periodPrice,
  type BillingPeriod,
} from '@/components/plans/plan-types';
import { BillingPeriodToggle } from './billing-period-toggle';

export function PlatformPlansAdmin({
  plans,
  period,
  setPeriod,
  popularIndex,
  onOpenCreate,
  onEdit,
  onDelete,
  onToggleActive,
  t,
}: {
  plans: SubscriptionPlanData[];
  period: BillingPeriod;
  setPeriod: (p: BillingPeriod) => void;
  popularIndex: number;
  onOpenCreate: () => void;
  onEdit: (plan: SubscriptionPlanData) => void;
  onDelete: (plan: SubscriptionPlanData) => void;
  onToggleActive: (plan: SubscriptionPlanData) => void;
  t: (key: string) => string;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <BillingPeriodToggle period={period} setPeriod={setPeriod} t={t} />
        <Button onClick={onOpenCreate} size="sm" className="w-full sm:w-auto">
          <Plus className="me-2 h-4 w-4" />
          {t('plans.addPlan')}
        </Button>
      </div>

      {plans.length === 0 ? (
        <div className="rounded-2xl border bg-card py-16 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Zap className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">{t('plans.noPlanConfigured')}</p>
          <Button onClick={onOpenCreate} variant="outline" size="sm" className="mt-4">
            <Plus className="me-2 h-4 w-4" />
            {t('plans.createFirstPlan')}
          </Button>
        </div>
      ) : (
        <div dir="rtl" className="stagger-children grid items-stretch gap-5 pt-3 sm:grid-cols-3">
          {plans.map((plan, i) => {
            const isPopular = i === popularIndex && plans.length >= 2;
            const price = periodPrice(plan, period);
            const features = plan.features ?? [];
            return (
              <div
                key={plan.id}
                dir="rtl"
                className={cn(
                  'relative rounded-2xl border p-7 text-right transition-all duration-200',
                  isPopular
                    ? '-translate-y-1 border-foreground bg-foreground text-background shadow-xl'
                    : 'border-border bg-card hover:shadow-md',
                  !plan.is_active && 'opacity-60',
                )}
              >
                <div className="absolute start-3.5 top-3.5 flex items-center gap-1.5">
                  {isPopular && (
                    <span className="rounded-full bg-primary px-2.5 py-1 text-[10.5px] font-semibold text-primary-foreground">
                      {t('plans.popular')}
                    </span>
                  )}
                  {!plan.is_active && (
                    <span
                      className={cn(
                        'rounded-full border px-2.5 py-1 text-[10.5px] font-medium',
                        isPopular
                          ? 'border-background/20 bg-background/10 text-background/70'
                          : 'border-border bg-muted text-muted-foreground',
                      )}
                    >
                      {t('plans.inactive')}
                    </span>
                  )}
                </div>

                <div className="absolute end-3 top-3 flex items-center gap-1">
                  <button
                    type="button"
                    aria-label={`Edit ${plan.name}`}
                    onClick={() => onEdit(plan)}
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-lg transition-colors',
                      isPopular
                        ? 'text-background/60 hover:bg-white/10 hover:text-background'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${plan.name}`}
                    onClick={() => onDelete(plan)}
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-lg transition-colors',
                      isPopular
                        ? 'text-background/60 hover:bg-red-500/20 hover:text-red-300'
                        : 'text-muted-foreground hover:bg-destructive/10 hover:text-destructive',
                    )}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div
                  className={cn(
                    'mb-1 mt-6 text-[11px] font-semibold uppercase tracking-widest',
                    isPopular ? 'text-background/40' : 'text-muted-foreground/50',
                  )}
                >
                  {t('plans.sortOrder')} {plan.sort_order.toLocaleString('fa-IR')}
                </div>
                <h2
                  className={cn(
                    'text-[24px] font-bold tracking-tight',
                    isPopular ? 'text-background' : 'text-foreground',
                  )}
                >
                  {plan.name}
                </h2>

                <div className="mb-5 mt-4 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                  <span
                    className={cn(
                      'text-[32px] font-extrabold tracking-tight',
                      isPopular ? 'text-background' : 'text-foreground',
                    )}
                  >
                    {formatPrice(price)}
                  </span>
                  <span
                    className={cn(
                      'text-[13px]',
                      isPopular ? 'text-background/50' : 'text-muted-foreground',
                    )}
                  >
                    {period === 'quarterly' ? t('plans.pricePerQuarter') : t('plans.pricePerMonth')}
                  </span>
                </div>

                <div
                  className={cn(
                    'mb-4 flex items-center gap-2 text-sm',
                    isPopular ? 'text-background/70' : 'text-muted-foreground',
                  )}
                >
                  <HardDrive className="h-4 w-4 shrink-0" />
                  {formatStorage(plan.storage_limit_gb)} {t('plans.storage')}
                </div>

                {features.length > 0 && (
                  <ul className="space-y-2.5">
                    {features.map((feature, fi) => (
                      <li key={fi} className="flex items-start gap-2.5 text-sm">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span
                          className={cn(isPopular ? 'text-background/90' : 'text-foreground/75')}
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                <div
                  className={cn(
                    'mt-5 flex items-center justify-between border-t pt-4',
                    isPopular ? 'border-background/10' : 'border-border/50',
                  )}
                >
                  <span
                    className={cn(
                      'text-xs font-medium',
                      isPopular ? 'text-background/60' : 'text-muted-foreground',
                    )}
                  >
                    {t('plans.toggleActive')}
                  </span>
                  <Switch checked={plan.is_active} onCheckedChange={() => onToggleActive(plan)} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
