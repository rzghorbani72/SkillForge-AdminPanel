'use client';

import { Check } from 'lucide-react';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import { useTranslation } from '@/lib/i18n/hooks';
import { formatPhoneDisplay, toPersianDigits } from '@/lib/phone-utils';
import type { KycState } from '@/types/kyc';

type Props = {
  state: KycState;
  upto: 'identity' | 'iban';
};

export function KycConfirmedSummary({ state, upto }: Props) {
  const { t, language } = useTranslation();
  const formatDate = useDateFormat();
  const fa = language === 'fa';
  const digits = (value: string | null | undefined) => {
    const text = value?.trim() || '—';
    return fa ? toPersianDigits(text) : text;
  };

  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Check className="h-3.5 w-3.5 text-success" />
        {t('settings.kyc.confirmedSoFar')}
      </p>
      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        <Row
          label={t('settings.kyc.phoneNumber')}
          value={
            state.phone_number
              ? formatPhoneDisplay(state.phone_number, language)
              : '—'
          }
        />
        <Row
          label={t('settings.kyc.nationalId')}
          value={digits(state.national_id)}
        />
        {upto === 'iban' ? (
          <>
            <Row
              label={t('settings.kyc.birthDate')}
              value={state.birth_date ? formatDate(state.birth_date) : '—'}
            />
            <Row
              label={t('settings.kyc.sheba')}
              value={digits(state.sheba_number)}
            />
            <Row
              label={t('settings.kyc.accountHolder')}
              value={state.iban_info?.name ?? state.legal_entity_name}
            />
            <Row
              label={t('settings.kyc.bankName')}
              value={state.iban_info?.bank_name ?? null}
            />
          </>
        ) : null}
      </dl>
    </div>
  );
}

function Row({
  label,
  value
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="break-all font-medium">{value?.trim() || '—'}</dd>
    </div>
  );
}
