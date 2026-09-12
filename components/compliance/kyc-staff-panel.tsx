'use client';

import { KycStatusBadge } from '@/components/settings/kyc/kyc-readonly-panel';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import { useTranslation } from '@/lib/i18n/hooks';
import { toPersianDigits } from '@/lib/phone-utils';
import type { KycState } from '@/types/kyc';

type Props = {
  state: KycState;
};

/** Read-only view of creating-manager KYC for platform staff. */
export function KycStaffPanel({ state }: Props) {
  const { t, language } = useTranslation();
  const formatDate = useDateFormat();
  const fa = language === 'fa';
  const digits = (value: string | null) => {
    const text = value?.trim() || '—';
    return fa ? toPersianDigits(text) : text;
  };

  return (
    <div className="space-y-3">
      <KycStatusBadge
        status={state.status}
        complete={state.settlement_eligible}
      />

      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        <Row
          label={t('settings.kyc.legalEntityName')}
          value={state.iban_info?.name ?? state.legal_entity_name}
        />
        <Row
          label={t('settings.kyc.nationalId')}
          value={digits(state.national_id)}
        />
        <Row
          label={t('settings.kyc.birthDate')}
          value={state.birth_date ? formatDate(state.birth_date) : '—'}
        />
        <Row
          label={t('settings.kyc.sheba')}
          value={digits(state.sheba_number)}
        />
        <Row
          label={t('settings.kyc.bankName')}
          value={state.iban_info?.bank_name ?? null}
        />
      </dl>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="break-all font-medium">{value?.trim() || '—'}</dd>
    </div>
  );
}
