'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AcademyEditForm, type AcademyEditPayload } from '@/components/academies/academy-edit-form';
import type { Academy } from '@/types/api';

type AcademyEditModalProps = {
  academy: Academy | null;
  onClose: () => void;
  onSubmit: (id: string, data: AcademyEditPayload) => Promise<void>;
  t: (k: string) => string;
};

export function AcademyEditModal({ academy, onClose, onSubmit, t }: AcademyEditModalProps) {
  return (
    <Dialog open={!!academy} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <p className="text-xs text-muted-foreground">{t('stores.editAcademy')}</p>
          <DialogTitle className="text-xl">{t('stores.editModalHeading')}</DialogTitle>
        </DialogHeader>
        {academy ? (
          <AcademyEditForm
            academy={academy}
            compact
            t={t}
            onCancel={onClose}
            onSubmit={async (data) => {
              await onSubmit(academy.id, data);
              onClose();
            }}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
