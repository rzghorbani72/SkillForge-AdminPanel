'use client';

import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ExternalLink, Info } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import { EnamadStatusBadge } from './review-status-badge';
import { ENAMAD_STATUS, type EnamadStatus, type ReviewQueueItem } from '@/types/compliance';

type Props = {
  item: ReviewQueueItem;
  status: EnamadStatus;
  submitting: boolean;
  onReview: (approved: boolean, note: string) => void;
};

/**
 * Staff decision on an academy's submitted eNamad code. The code is verified by
 * looking it up on enamad.ir against the academy's own domain — we deliberately
 * do not auto-verify, because the check that matters is that the seal belongs to
 * the same legal entity that registered here.
 */
export function EnamadReviewPanel({ item, status, submitting, onReview }: Props) {
  const { t } = useTranslation();
  const [note, setNote] = useState('');

  if (!item.is_public_domain) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>{t('compliance.enamadReview.notApplicable')}</AlertDescription>
      </Alert>
    );
  }

  const decidable = status === ENAMAD_STATUS.PENDING || status === ENAMAD_STATUS.REJECTED;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <EnamadStatusBadge status={status} />
        {item.custom_domain ? (
          <Button variant="outline" size="sm" asChild>
            <a
              href={`https://enamad.ir/Search?q=${encodeURIComponent(item.custom_domain)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="me-1 h-3.5 w-3.5" />
              {t('compliance.enamadReview.lookup')}
            </a>
          </Button>
        ) : null}
      </div>

      {status === ENAMAD_STATUS.REQUIRED ? (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>{t('compliance.enamadReview.awaitingSubmission')}</AlertDescription>
        </Alert>
      ) : null}

      {decidable ? (
        <>
          <Textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={2}
            placeholder={t('compliance.enamadReview.notePlaceholder')}
          />
          <div className="flex flex-wrap gap-2">
            <Button size="sm" disabled={submitting} onClick={() => onReview(true, note.trim())}>
              {t('compliance.enamadReview.approve')}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={submitting || note.trim().length === 0}
              onClick={() => onReview(false, note.trim())}
            >
              {t('compliance.enamadReview.reject')}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {t('compliance.enamadReview.rejectNeedsNote')}
          </p>
        </>
      ) : null}
    </div>
  );
}
