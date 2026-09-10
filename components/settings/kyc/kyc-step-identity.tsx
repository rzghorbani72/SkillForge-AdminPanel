'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/lib/i18n/hooks';

export type KycIdentityFields = {
  firstName: string;
  lastName: string;
  nationalId: string;
  birthDate: string;
};

type Props = {
  values: KycIdentityFields;
  phoneNumber: string;
  disabled?: boolean;
  onChange: (next: KycIdentityFields) => void;
};

export function KycStepIdentity({
  values,
  phoneNumber,
  disabled = false,
  onChange
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="kyc-first-name">{t('settings.kyc.firstName')}</Label>
          <Input
            id="kyc-first-name"
            value={values.firstName}
            onChange={(event) =>
              onChange({ ...values, firstName: event.target.value })
            }
            required
            disabled={disabled}
            autoComplete="given-name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="kyc-last-name">{t('settings.kyc.lastName')}</Label>
          <Input
            id="kyc-last-name"
            value={values.lastName}
            onChange={(event) =>
              onChange({ ...values, lastName: event.target.value })
            }
            required
            disabled={disabled}
            autoComplete="family-name"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="kyc-phone">{t('settings.kyc.phoneNumber')}</Label>
        <Input
          id="kyc-phone"
          value={phoneNumber}
          readOnly
          disabled
          dir="ltr"
          className="bg-muted"
        />
        <p className="text-xs text-muted-foreground">
          {t('settings.kyc.phoneLockedHelp')}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="kyc-national-id">{t('settings.kyc.nationalId')}</Label>
        <Input
          id="kyc-national-id"
          value={values.nationalId}
          onChange={(event) =>
            onChange({ ...values, nationalId: event.target.value })
          }
          inputMode="numeric"
          required
          disabled={disabled}
        />
        <p className="text-xs text-muted-foreground">
          {t('settings.kyc.nationalIdHelp')}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="kyc-birth-date">{t('settings.kyc.birthDate')}</Label>
        <Input
          id="kyc-birth-date"
          type="date"
          value={values.birthDate}
          onChange={(event) =>
            onChange({ ...values, birthDate: event.target.value })
          }
          required
          disabled={disabled}
        />
      </div>
    </div>
  );
}

/** Split a stored full name into first + last for the form. */
export function splitLegalName(fullName: string | null | undefined): {
  firstName: string;
  lastName: string;
} {
  const trimmed = fullName?.trim() ?? '';
  if (!trimmed) return { firstName: '', lastName: '' };
  const space = trimmed.indexOf(' ');
  if (space < 0) return { firstName: trimmed, lastName: '' };
  return {
    firstName: trimmed.slice(0, space).trim(),
    lastName: trimmed.slice(space + 1).trim()
  };
}

export function joinLegalName(firstName: string, lastName: string): string {
  return `${firstName.trim()} ${lastName.trim()}`.trim();
}
