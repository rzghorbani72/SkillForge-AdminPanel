'use client';

import { Badge } from '@/components/ui/badge';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import { useTranslation } from '@/lib/i18n/hooks';
import { formatPhoneDisplay, toPersianDigits } from '@/lib/phone-utils';
import { KYC_STATUS, type KycState, type KycStatus } from '@/types/kyc';

const TONE_CLASS = {
  warning: 'border-transparent bg-warning/15 text-warning hover:bg-warning/15',
  success: 'border-transparent bg-success/15 text-success hover:bg-success/15'
} as const;

function kycBadgeTone(
  status: KycStatus,
  complete: boolean
): keyof typeof TONE_CLASS {
  return complete || status === KYC_STATUS.VERIFIED ? 'success' : 'warning';
}

export function KycStatusBadge({
  status,
  complete = false
}: {
  status: KycStatus;
  complete?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <Badge className={TONE_CLASS[kycBadgeTone(status, complete)]}>
      {t(`settings.kyc.status.${status}`)}
    </Badge>
  );
}

type KycReadonlyProps = {
  state: KycState;
};

export function KycReadonlyPanel({ state }: KycReadonlyProps) {
  const { t, language } = useTranslation();
  const formatDate = useDateFormat();
  const fa = language === 'fa';
  const digits = (value: string | null) => {
    const text = value?.trim() || '—';
    return fa ? toPersianDigits(text) : text;
  };

  if (!state.is_owner) {
    return (
      <p className="text-sm text-muted-foreground">
        {t('settings.kyc.ownerOnly')}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <KycStatusBadge
          status={state.status}
          complete={state.settlement_eligible}
        />
        {state.settlement_eligible ? (
          <p className="text-sm text-muted-foreground">
            {t('settings.kyc.settlementUnlocked')}
          </p>
        ) : null}
        {state.status === KYC_STATUS.VERIFIED ? (
          <p className="text-sm text-muted-foreground">
            {t('settings.kyc.verifiedNotice')}
          </p>
        ) : null}
      </div>

      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <ReadonlyRow
          label={t('settings.kyc.phoneNumber')}
          value={
            state.phone_number
              ? formatPhoneDisplay(state.phone_number, language)
              : '—'
          }
        />
        <ReadonlyRow
          label={t('settings.kyc.nationalId')}
          value={digits(state.national_id)}
        />
        <ReadonlyRow
          label={t('settings.kyc.legalEntityName')}
          value={state.iban_info?.name ?? state.legal_entity_name}
        />
        <ReadonlyRow
          label={t('settings.kyc.birthDate')}
          value={state.birth_date ? formatDate(state.birth_date) : '—'}
        />
        <ReadonlyRow
          label={t('settings.kyc.sheba')}
          value={digits(state.sheba_number)}
        />
        <ReadonlyRow
          label={t('settings.kyc.bankName')}
          value={state.iban_info?.bank_name ?? null}
        />
      </dl>
    </div>
  );
}

function ReadonlyRow({
  label,
  value
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="break-all font-medium">{value?.trim() || '—'}</dd>
    </div>
  );
}
