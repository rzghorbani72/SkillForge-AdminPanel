'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useTranslation } from '@/lib/i18n/hooks';
import type { CancelTutoringGroupPayload } from '@/types/learning-operations';
import { CancelClassForm } from './cancel-class-form';

export function CancelClassDialog({
  groupId,
  disabled,
  onConfirm,
}: {
  groupId: string;
  disabled: boolean;
  onConfirm: (payload: CancelTutoringGroupPayload) => Promise<boolean>;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="destructive" disabled={disabled}>
          {t('tutoring.groups.cancel')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('tutoring.groups.cancel')}</DialogTitle>
          <DialogDescription>{t('tutoring.groups.cancelHint')}</DialogDescription>
        </DialogHeader>
        {open ? (
          <CancelClassForm groupId={groupId} onConfirm={onConfirm} onClose={() => setOpen(false)} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
