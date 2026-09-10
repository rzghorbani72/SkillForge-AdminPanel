'use client';

import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/lib/i18n/hooks';
import { KYC_STATUS, type KycState, type KycStatus } from '@/types/kyc';

const STATUS_VARIANT: Record<
  KycStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  MISSING: 'secondary',
  PARTIAL: 'secondary',
  PENDING: 'outline',
  VERIFIED: 'default',
  REJECTED: 'destructive'
};

export function KycStatusBadge({ status }: { status: KycStatus }) {
  const { t } = useTranslation();
  return (
    <Badge variant={STATUS_VARIANT[status]}>
      {t(`settings.kyc.status.${status}`)}
    </Badge>
  );
}

type KycReadonlyProps = {
  state: KycState;
};

/** Read-only summary when the manager cannot edit (pending/verified/not owner). */
export function KycReadonlyPanel({ state }: KycReadonlyProps) {
  const { t } = useTranslation();

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
        <KycStatusBadge status={state.status} />
        {state.status === KYC_STATUS.PENDING ? (
          <p className="text-sm text-muted-foreground">
            {t('settings.kyc.pendingNotice')}
          </p>
        ) : null}
        {state.status === KYC_STATUS.VERIFIED ? (
          <p className="text-sm text-muted-foreground">
            {t('settings.kyc.verifiedNotice')}
          </p>
        ) : null}
      </div>

      {state.status === KYC_STATUS.REJECTED && state.review_note ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm">
          <p className="font-medium text-destructive">
            {t('settings.kyc.rejectedTitle')}
          </p>
          <p className="mt-1 text-muted-foreground">{state.review_note}</p>
        </div>
      ) : null}

      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <ReadonlyRow
          label={t('settings.kyc.legalEntityName')}
          value={state.legal_entity_name}
        />
        <ReadonlyRow
          label={t('settings.kyc.nationalId')}
          value={state.national_id_masked ?? state.national_id}
        />
        <ReadonlyRow
          label={t('settings.kyc.birthDate')}
          value={state.birth_date}
        />
        <ReadonlyRow
          label={t('settings.kyc.sheba')}
          value={state.sheba_masked}
        />
        <ReadonlyRow
          label={t('settings.kyc.contactAddress')}
          value={state.contact_address}
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
      <dd className="font-medium">{value?.trim() || '—'}</dd>
    </div>
  );
}
