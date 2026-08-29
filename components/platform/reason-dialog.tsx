'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';

type ReasonDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  subject: string;
  confirmLabel: string;
  onConfirm: (reason: string) => Promise<unknown>;
  onDone?: () => void;
};

/**
 * Every blocking action here is the same shape: name the person or academy,
 * type the reason the blocked person will read, confirm. One dialog serves the
 * platform ban, the academy ban and the academy suspension.
 */
export function ReasonDialog({
  open,
  onOpenChange,
  title,
  description,
  subject,
  confirmLabel,
  onConfirm,
  onDone
}: ReasonDialogProps) {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setReason('');
  }, [open]);

  const submit = async () => {
    if (reason.trim().length < 3) {
      ErrorHandler.showError(t('accountActions.reasonRequired'));
      return;
    }
    setSaving(true);
    try {
      await onConfirm(reason.trim());
      onOpenChange(false);
      onDone?.();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <p className="rounded-lg bg-muted px-3 py-2 text-sm font-medium">
            {subject}
          </p>
          <div className="space-y-2">
            <Label htmlFor="block-reason">
              {t('accountActions.reasonLabel')}
            </Label>
            <Textarea
              id="block-reason"
              rows={3}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder={t('accountActions.reasonPlaceholder')}
              maxLength={500}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={() => void submit()}
            disabled={saving}
          >
            {saving && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
