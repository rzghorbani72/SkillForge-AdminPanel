'use client';

import { Banknote, CreditCard, Gift, Globe, Landmark } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/hooks';
import type { GrantPaymentMethod, GrantPricing } from '@/lib/api-extra';

type AccessPricingPickerProps = {
  value: GrantPricing;
  onChange: (value: GrantPricing) => void;
  disabled?: boolean;
};

const METHOD_ICONS: Record<GrantPaymentMethod, typeof Banknote> = {
  CASH: Banknote,
  BANK_TRANSFER: Landmark,
  POS: CreditCard,
  ONLINE: Globe,
};

const METHODS: GrantPaymentMethod[] = ['CASH', 'BANK_TRANSFER', 'POS', 'ONLINE'];

/**
 * What the student pays for this grant. The server prices it from the course or
 * bundle, so this only collects intent — free, full price, or a discount — plus
 * how the money arrived.
 */
export function AccessPricingPicker({
  value,
  onChange,
  disabled = false,
}: AccessPricingPickerProps) {
  const { t } = useTranslation();

  const modes = [
    { mode: 'FREE', label: t('accessGrants.pricingFree'), icon: Gift },
    { mode: 'FULL', label: t('accessGrants.pricingFull'), icon: Banknote },
    {
      mode: 'DISCOUNT',
      label: t('accessGrants.pricingDiscount'),
      icon: CreditCard,
    },
  ] as const;

  const method = value.mode === 'FREE' ? null : value.method;

  return (
    <div className="space-y-3">
      <Label>{t('accessGrants.pricing')}</Label>

      <div className="grid grid-cols-3 gap-2">
        {modes.map(({ mode, label, icon: Icon }) => (
          <button
            key={mode}
            type="button"
            disabled={disabled}
            onClick={() => onChange(defaultForMode(mode, method))}
            className={cn(
              'flex items-center justify-center gap-1.5 rounded-md border px-2 py-2 text-sm transition-colors disabled:opacity-50',
              value.mode === mode
                ? 'border-primary bg-primary/10 text-primary'
                : 'hover:bg-muted/40',
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {value.mode === 'DISCOUNT' && (
        <div className="flex flex-wrap gap-2">
          <select
            disabled={disabled}
            value={value.discount_type}
            onChange={(event) =>
              onChange({
                ...value,
                discount_type: event.target.value === 'AMOUNT' ? 'AMOUNT' : 'PERCENT',
              })
            }
            className="h-10 w-[9.5rem] rounded-md border bg-background px-3 text-sm"
            aria-label={t('accessGrants.discountType')}
          >
            <option value="PERCENT">{t('accessGrants.discountPercent')}</option>
            <option value="AMOUNT">{t('accessGrants.discountAmount')}</option>
          </select>
          <NumberInput
            disabled={disabled}
            value={value.discount_value}
            onChange={(raw) =>
              onChange({
                ...value,
                discount_value: raw === '' ? 0 : Number(raw),
              })
            }
            aria-label={t('accessGrants.discountValue')}
            className="h-10 w-[8.5rem]"
          />
        </div>
      )}

      {value.mode !== 'FREE' && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">{t('accessGrants.paymentMethod')}</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {METHODS.map((option) => {
              const Icon = METHOD_ICONS[option];
              return (
                <button
                  key={option}
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange({ ...value, method: option })}
                  className={cn(
                    'flex items-center justify-center gap-1.5 rounded-md border px-2 py-2 text-xs transition-colors disabled:opacity-50',
                    value.method === option
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'hover:bg-muted/40',
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {t(`accessGrants.method${option}`)}
                </button>
              );
            })}
          </div>
          <Input
            disabled={disabled}
            value={value.reference ?? ''}
            onChange={(event) => onChange({ ...value, reference: event.target.value })}
            placeholder={t('accessGrants.referencePlaceholder')}
            className="h-9 max-w-md"
          />
        </div>
      )}
    </div>
  );
}

function defaultForMode(
  mode: GrantPricing['mode'],
  method: GrantPaymentMethod | null,
): GrantPricing {
  if (mode === 'FREE') return { mode: 'FREE' };
  const payment = method ?? 'CASH';
  if (mode === 'FULL') return { mode: 'FULL', method: payment };
  return {
    mode: 'DISCOUNT',
    discount_type: 'PERCENT',
    discount_value: 20,
    method: payment,
  };
}
