'use client';

import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Info } from 'lucide-react';
import { KycStatusBadge } from '@/components/settings/kyc/kyc-readonly-panel';
import { useTranslation } from '@/lib/i18n/hooks';
import { KYC_STATUS, type KycState } from '@/types/kyc';

type Props = {
  state: KycState;
  submitting: boolean;
  onReview: (approved: boolean, note: string) => void;
};

/** Staff decision panel for creating-manager KYC (approve / reject with note). */
export function KycReviewPanel({ state, submitting, onReview }: Props) {
  const { t } = useTranslation();
  const [note, setNote] = useState('');
  const decidable = state.status === KYC_STATUS.PENDING;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <KycStatusBadge status={state.status} />
      </div>

      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        <Row
          label={t('settings.kyc.legalEntityName')}
          value={state.legal_entity_name}
        />
        <Row
          label={t('settings.kyc.nationalId')}
          value={state.national_id_masked}
        />
        <Row label={t('settings.kyc.birthDate')} value={state.birth_date} />
        <Row label={t('settings.kyc.sheba')} value={state.sheba_masked} />
      </dl>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          {t('compliance.kyc.cardMeta', {
            front: state.card_front_id
              ? t('compliance.kyc.cardPresent')
              : t('compliance.kyc.cardMissing'),
            back: state.card_back_id
              ? t('compliance.kyc.cardPresent')
              : t('compliance.kyc.cardMissing')
          })}
        </AlertDescription>
      </Alert>

      {state.review_note ? (
        <p className="text-xs text-muted-foreground">
          {t('compliance.kyc.lastNote')}: {state.review_note}
        </p>
      ) : null}

      {decidable ? (
        <>
          <Textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={2}
            placeholder={t('compliance.kyc.notePlaceholder')}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              disabled={submitting}
              onClick={() => onReview(true, note.trim())}
            >
              {t('compliance.kyc.approve')}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={submitting || note.trim().length === 0}
              onClick={() => onReview(false, note.trim())}
            >
              {t('compliance.kyc.reject')}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {t('compliance.kyc.rejectNeedsNote')}
          </p>
        </>
      ) : null}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value?.trim() || '—'}</dd>
    </div>
  );
}
