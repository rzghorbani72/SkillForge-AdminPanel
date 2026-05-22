'use client';

import { UseFormReturn } from 'react-hook-form';
import { WizardValues, PRICING_TYPES, PricingType } from './wizard-schema';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Check, Gift, CreditCard, CalendarClock, Layers } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';

interface Props {
  form: UseFormReturn<WizardValues>;
}

export default function WizardStepPricing({ form }: Props) {
  const { t } = useTranslation();
  const pricingType = form.watch('pricing_type');

  const PRICING_OPTIONS: {
    type: PricingType;
    label: string;
    description: string;
    icon: React.ReactNode;
  }[] = [
    {
      type: 'FREE',
      label: t('wizard.free'),
      description: t('wizard.freeDesc'),
      icon: <Gift className="h-5 w-5" />
    },
    {
      type: 'ONE_TIME',
      label: t('wizard.oneTime'),
      description: t('wizard.oneTimeDesc'),
      icon: <CreditCard className="h-5 w-5" />
    },
    {
      type: 'PAYMENT_PLAN',
      label: t('wizard.paymentPlan'),
      description: t('wizard.paymentPlanDesc'),
      icon: <Layers className="h-5 w-5" />
    },
    {
      type: 'SUBSCRIPTION',
      label: t('wizard.subscriptionType'),
      description: t('wizard.subscriptionTypeDesc'),
      icon: <CalendarClock className="h-5 w-5" />
    }
  ];

  const installmentCount = form.watch('installment_count');
  const amountPerInstallment = form.watch('amount_per_installment');

  return (
    <div className="space-y-6">
      {/* Pricing type selector */}
      <div className="space-y-2">
        <label className="text-sm font-semibold">
          {t('wizard.pricingModel')}
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          {PRICING_OPTIONS.map((opt) => {
            const selected = pricingType === opt.type;
            return (
              <button
                key={opt.type}
                type="button"
                onClick={() => form.setValue('pricing_type', opt.type)}
                className={cn(
                  'flex items-start gap-3 rounded-xl border p-4 text-left transition-all',
                  selected
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'hover:border-primary/40 hover:bg-muted/50'
                )}
              >
                <div
                  className={cn(
                    'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                    selected
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {opt.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{opt.label}</span>
                    {selected && <Check className="h-4 w-4 text-primary" />}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {opt.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ONE_TIME fields */}
      {pricingType === 'ONE_TIME' && (
        <div className="space-y-4 rounded-xl border bg-muted/30 p-4">
          <h4 className="text-sm font-semibold">{t('courses.pricing')}</h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('wizard.priceToman')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="e.g. 500000"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="access_duration_days"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('wizard.accessDuration')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      placeholder={t('wizard.lifetime')}
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) =>
                        field.onChange(e.target.value ? +e.target.value : null)
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    {t('wizard.accessDurationHint')}
                  </FormDescription>
                </FormItem>
              )}
            />
          </div>
        </div>
      )}

      {/* PAYMENT_PLAN fields */}
      {pricingType === 'PAYMENT_PLAN' && (
        <div className="space-y-4 rounded-xl border bg-muted/30 p-4">
          <h4 className="text-sm font-semibold">
            {t('wizard.installmentPlan')}
          </h4>
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="installment_count"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('wizard.installmentCount')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="2"
                      placeholder="e.g. 3"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount_per_installment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('wizard.amountPerInstallment')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="e.g. 200000"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="interval_days"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('wizard.interval')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      placeholder="e.g. 30"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {installmentCount && amountPerInstallment && (
            <p className="text-sm text-muted-foreground">
              {t('wizard.totalAmount', {
                amount: (
                  installmentCount * amountPerInstallment
                ).toLocaleString()
              })}
            </p>
          )}
        </div>
      )}

      {/* SUBSCRIPTION info */}
      {pricingType === 'SUBSCRIPTION' && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-300">
          <p className="mb-1 font-semibold">{t('wizard.subscriptionType')}</p>
          <p>{t('wizard.subscriptionNote')}</p>
        </div>
      )}

      {/* FREE info */}
      {pricingType === 'FREE' && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
          <p className="mb-1 font-semibold">{t('wizard.free')}</p>
          <p>{t('wizard.freeNote')}</p>
        </div>
      )}
    </div>
  );
}
