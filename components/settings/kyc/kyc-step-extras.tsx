'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/lib/i18n/hooks';

export type KycExtrasFields = {
  contactAddress: string;
  permitDeclared: boolean;
};

type Props = {
  values: KycExtrasFields;
  disabled?: boolean;
  onChange: (next: KycExtrasFields) => void;
};

export function KycStepExtras({ values, disabled = false, onChange }: Props) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="kyc-address">{t('settings.kyc.contactAddress')}</Label>
        <Textarea
          id="kyc-address"
          value={values.contactAddress}
          onChange={(event) =>
            onChange({ ...values, contactAddress: event.target.value })
          }
          rows={3}
          disabled={disabled}
        />
        <p className="text-xs text-muted-foreground">
          {t('settings.kyc.contactAddressHelp')}
        </p>
      </div>
      <div className="flex items-start gap-3">
        <Checkbox
          id="kyc-permit"
          checked={values.permitDeclared}
          disabled={disabled}
          onCheckedChange={(checked) =>
            onChange({ ...values, permitDeclared: checked === true })
          }
        />
        <div className="space-y-1">
          <Label htmlFor="kyc-permit" className="font-normal leading-snug">
            {t('settings.kyc.permitLabel')}
          </Label>
          <p className="text-xs text-muted-foreground">
            {t('settings.kyc.permitHelp')}
          </p>
        </div>
      </div>
    </div>
  );
}
