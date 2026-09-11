'use client';

import { Label } from '@/components/ui/label';
import { LocalizedDigitsInput } from '@/components/ui/localized-digits-input';
import { useTranslation } from '@/lib/i18n/hooks';
import { formatPhoneDisplay } from '@/lib/phone-utils';

const NATIONAL_ID_MAX_LENGTH = 11;

type Props = {
  nationalId: string;
  phoneNumber: string;
  disabled?: boolean;
  onChange: (nationalId: string) => void;
};

export function KycStepIdentity({
  nationalId,
  phoneNumber,
  disabled = false,
  onChange
}: Props) {
  const { t, language } = useTranslation();

  return (
    <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="kyc-phone">{t('settings.kyc.phoneNumber')}</Label>
        <p
          id="kyc-phone"
          dir="ltr"
          className="rounded-md border bg-muted px-3 py-2 text-sm"
        >
          {phoneNumber ? formatPhoneDisplay(phoneNumber, language) : '—'}
        </p>
        <p className="text-xs text-muted-foreground">
          {t('settings.kyc.phoneLockedHelp')}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="kyc-national-id">{t('settings.kyc.nationalId')}</Label>
        <LocalizedDigitsInput
          id="kyc-national-id"
          value={nationalId}
          onChange={(value) => {
            onChange(value.replace(/\D/g, '').slice(0, NATIONAL_ID_MAX_LENGTH));
          }}
          maxLength={NATIONAL_ID_MAX_LENGTH}
          autoComplete="off"
          required
          disabled={disabled}
        />
        <p className="text-xs text-muted-foreground">
          {t('settings.kyc.nationalIdHelp')}
        </p>
      </div>
    </div>
  );
}
