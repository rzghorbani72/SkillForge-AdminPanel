'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NumberInput } from '@/components/ui/number-input';
import { PriceInput } from '@/components/ui/price-input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslation } from '@/lib/i18n/hooks';
import type { Dispatch, SetStateAction } from 'react';

export function PlatformFinancialRatesCard({
  setSettingsForm,
  settingsForm,
}: {
  setSettingsForm: Dispatch<
    SetStateAction<{
      vat_rate: string;
      storage_overage_fee_irr: string;
      subscription_grace_days: string;
      subscription_reminder_days: string;
      payment_release_phase: string;
      legal_entity_name: string;
      vat_registration_no: string;
      economic_code: string;
    }>
  >;
  settingsForm: {
    vat_rate: string;
    storage_overage_fee_irr: string;
    subscription_grace_days: string;
    subscription_reminder_days: string;
    payment_release_phase: string;
    legal_entity_name: string;
    vat_registration_no: string;
    economic_code: string;
  };
}) {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('pricing.platform.financialRates')}</CardTitle>
        <CardDescription>{t('pricing.platform.financialRatesDesc')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>{t('pricing.platform.vatRate')}</Label>
            <NumberInput
              allowDecimal
              value={settingsForm.vat_rate}
              onChange={(raw) => setSettingsForm({ ...settingsForm, vat_rate: raw })}
            />
            <p className="text-xs text-muted-foreground">{t('pricing.platform.vatRateHint')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>{t('pricing.platform.overageFee')}</Label>
            <PriceInput
              value={settingsForm.storage_overage_fee_irr}
              onChange={(raw) =>
                setSettingsForm({
                  ...settingsForm,
                  storage_overage_fee_irr: raw,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>{t('pricing.platform.graceDays')}</Label>
            <NumberInput
              value={settingsForm.subscription_grace_days}
              onChange={(raw) =>
                setSettingsForm({
                  ...settingsForm,
                  subscription_grace_days: raw,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>{t('pricing.platform.reminderDays')}</Label>
            <NumberInput
              value={settingsForm.subscription_reminder_days}
              onChange={(raw) =>
                setSettingsForm({
                  ...settingsForm,
                  subscription_reminder_days: raw,
                })
              }
            />
          </div>
        </div>

        <div className="max-w-xs space-y-2">
          <Label>{t('pricing.platform.paymentPhase')}</Label>
          <Select
            value={settingsForm.payment_release_phase}
            onValueChange={(value) =>
              setSettingsForm({
                ...settingsForm,
                payment_release_phase: value,
              })
            }
          >
            <SelectTrigger aria-label={t('pricing.platform.paymentPhase')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="IRAN_PAYPING_ONLY">
                {t('pricing.platform.paymentPhasePaypingOnly')}
              </SelectItem>
              <SelectItem value="ALL_GATEWAYS">
                {t('pricing.platform.paymentPhaseAllGateways')}
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">{t('pricing.platform.paymentPhaseHint')}</p>
        </div>
      </CardContent>
    </Card>
  );
}
