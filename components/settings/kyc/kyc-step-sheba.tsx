'use client';

import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { LocalizedDigitsInput } from '@/components/ui/localized-digits-input';
import { useTranslation } from '@/lib/i18n/hooks';
import { toEnglishDigits } from '@/lib/phone-utils';

export type KycShebaFields = {
  birthDate: string;
  shebaNumber: string;
};

type Props = {
  values: KycShebaFields;
  disabled?: boolean;
  onChange: (next: KycShebaFields) => void;
};

export function KycStepSheba({ values, disabled = false, onChange }: Props) {
  const { t } = useTranslation();

  return (
    <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="kyc-birth-date">{t('settings.kyc.birthDate')}</Label>
        <DatePicker
          id="kyc-birth-date"
          value={values.birthDate}
          onChange={(birthDate) => onChange({ ...values, birthDate })}
          placeholder={t('datePicker.pickDate')}
          maxDate={new Date()}
          disabled={disabled}
        />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="kyc-sheba">{t('settings.kyc.sheba')}</Label>
        <LocalizedDigitsInput
          id="kyc-sheba"
          value={values.shebaNumber}
          onChange={(value) => {
            const raw = toEnglishDigits(value)
              .toUpperCase()
              .replace(/[^IR0-9]/g, '');
            onChange({ ...values, shebaNumber: raw });
          }}
          placeholder="IR062960000000100324200001"
          className="max-w-md font-mono"
          inputMode="text"
          required
          disabled={disabled}
        />
        <p className="text-xs text-muted-foreground">{t('settings.kyc.shebaHelp')}</p>
      </div>
    </div>
  );
}
