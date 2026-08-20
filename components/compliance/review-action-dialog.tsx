'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/lib/i18n/hooks';
import {
  CONTENT_REVIEW_STATUS,
  type ContentReviewStatus,
  type ReviewQueueItem
} from '@/types/compliance';

type Props = {
  item: ReviewQueueItem | null;
  action: ContentReviewStatus | null;
  submitting: boolean;
  onClose: () => void;
  onConfirm: (note: string) => void;
};

/**
 * Suspending takes a real site offline and publishes the note to students, so
 * it demands a reason; approving does not.
 */
export function ReviewActionDialog({
  item,
  action,
  submitting,
  onClose,
  onConfirm
}: Props) {
  const { t } = useTranslation();
  const [note, setNote] = useState('');

  const isSuspend = action === CONTENT_REVIEW_STATUS.SUSPENDED;
  const noteRequired = isSuspend || action === CONTENT_REVIEW_STATUS.FLAGGED;
  const canConfirm = !submitting && (!noteRequired || note.trim().length > 0);

  const close = () => {
    setNote('');
    onClose();
  };

  return (
    <Dialog
      open={Boolean(item && action)}
      onOpenChange={(open) => !open && close()}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {t(`compliance.action.${action ?? 'PENDING'}.title`)}
          </DialogTitle>
          <DialogDescription>
            {item?.academy_name}
            {item?.custom_domain ? ` — ${item.custom_domain}` : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="review-note">
            {noteRequired
              ? t('compliance.action.noteRequired')
              : t('compliance.action.noteOptional')}
          </Label>
          <Textarea
            id="review-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={4}
            placeholder={
              isSuspend
                ? t('compliance.action.suspendNotePlaceholder')
                : t('compliance.action.notePlaceholder')
            }
          />
          {isSuspend ? (
            <p className="text-xs text-muted-foreground">
              {t('compliance.action.suspendWarning')}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={close} disabled={submitting}>
            {t('common.cancel')}
          </Button>
          <Button
            variant={isSuspend ? 'destructive' : 'default'}
            onClick={() => onConfirm(note.trim())}
            disabled={!canConfirm}
          >
            {t('compliance.action.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
