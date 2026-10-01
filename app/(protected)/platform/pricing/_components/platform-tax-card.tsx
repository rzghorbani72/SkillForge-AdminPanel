'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/lib/i18n/hooks';
import type { Dispatch, SetStateAction } from 'react';

export function PlatformTaxCard({
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
        <CardTitle>{t('pricing.platform.taxTitle')}</CardTitle>
        <CardDescription>{t('pricing.platform.taxDesc')}</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label>{t('pricing.platform.legalEntityName')}</Label>
          <Input
            value={settingsForm.legal_entity_name}
            onChange={(e) =>
              setSettingsForm({
                ...settingsForm,
                legal_entity_name: e.target.value,
              })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>{t('pricing.platform.vatRegNo')}</Label>
          <Input
            value={settingsForm.vat_registration_no}
            onChange={(e) =>
              setSettingsForm({
                ...settingsForm,
                vat_registration_no: e.target.value,
              })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>{t('pricing.platform.economicCode')}</Label>
          <Input
            value={settingsForm.economic_code}
            onChange={(e) =>
              setSettingsForm({
                ...settingsForm,
                economic_code: e.target.value,
              })
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}
