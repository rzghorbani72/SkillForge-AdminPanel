'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/lib/i18n/hooks';
import { toEnglishDigits } from '@/lib/phone-utils';

export type KycShebaFields = {
  shebaNumber: string;
  accountHolderName: string;
};

type Props = {
  values: KycShebaFields;
  disabled?: boolean;
  onChange: (next: KycShebaFields) => void;
};

export function KycStepSheba({ values, disabled = false, onChange }: Props) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="kyc-sheba">{t('settings.kyc.sheba')}</Label>
        <Input
          id="kyc-sheba"
          value={values.shebaNumber}
          onChange={(event) => {
            const raw = toEnglishDigits(event.target.value)
              .toUpperCase()
              .replace(/[^IR0-9]/g, '');
            onChange({ ...values, shebaNumber: raw });
          }}
          placeholder="IR062960000000100324200001"
          dir="ltr"
          className="font-mono"
          required
          disabled={disabled}
        />
        <p className="text-xs text-muted-foreground">
          {t('settings.kyc.shebaHelp')}
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="kyc-holder">{t('settings.kyc.accountHolder')}</Label>
        <Input
          id="kyc-holder"
          value={values.accountHolderName}
          onChange={(event) =>
            onChange({ ...values, accountHolderName: event.target.value })
          }
          required
          disabled={disabled}
        />
      </div>
    </div>
  );
}
