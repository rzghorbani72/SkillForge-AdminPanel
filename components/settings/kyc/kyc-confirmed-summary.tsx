'use client';

import { BadgeCheck } from 'lucide-react';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import { useTranslation } from '@/lib/i18n/hooks';
import { formatPhoneDisplay, toPersianDigits } from '@/lib/phone-utils';
import type { KycState } from '@/types/kyc';

type Props = {
  state: KycState;
  upto: 'identity' | 'iban';
};

/** Read-only recap of every step the manager already passed. */
export function KycConfirmedSummary({ state, upto }: Props) {
  const { t, language } = useTranslation();
  const formatDate = useDateFormat();
  const fa = language === 'fa';
  const digits = (value: string | null | undefined) => {
    const text = value?.trim();
    if (!text) return null;
    return fa ? toPersianDigits(text) : text;
  };

  return (
    <div className="space-y-4 rounded-xl border border-success/30 bg-success/5 p-4">
      <p className="flex items-center gap-2 text-sm font-semibold text-success">
        <BadgeCheck className="h-4 w-4 shrink-0" />
        {t('settings.kyc.confirmedSoFar')}
      </p>

      <Group title={t('settings.kyc.sectionIdentity')}>
        <Row
          label={t('settings.kyc.phoneNumber')}
          value={state.phone_number ? formatPhoneDisplay(state.phone_number, language) : null}
          ltr
        />
        <Row label={t('settings.kyc.nationalId')} value={digits(state.national_id)} ltr />
      </Group>

      {upto === 'iban' ? (
        <Group title={t('settings.kyc.sectionFinancial')}>
          <Row
            label={t('settings.kyc.birthDate')}
            value={state.birth_date ? formatDate(state.birth_date) : null}
          />
          <Row label={t('settings.kyc.sheba')} value={digits(state.sheba_number)} ltr wide />
          <Row
            label={t('settings.kyc.accountHolder')}
            value={state.iban_info?.name ?? state.legal_entity_name}
          />
          <Row label={t('settings.kyc.bankName')} value={state.iban_info?.bank_name ?? null} />
        </Group>
      ) : null}
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">{title}</p>
      <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">{children}</dl>
    </div>
  );
}

function Row({
  label,
  value,
  ltr = false,
  wide = false,
}: {
  label: string;
  value: string | null | undefined;
  ltr?: boolean;
  wide?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className={wide ? 'sm:col-span-2' : undefined}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd
        {...(ltr && value ? { dir: 'ltr' as const } : {})}
        className={`whitespace-pre-wrap break-words text-sm font-medium ${ltr ? 'text-start' : ''}`}
      >
        {value?.trim() || t('settings.kyc.notProvided')}
      </dd>
    </div>
  );
}
