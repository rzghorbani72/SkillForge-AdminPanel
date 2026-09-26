'use client';

import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { AcademyCreateInput } from '@/lib/academy-create';
import type { TranslateFn } from '@/lib/i18n/role-label';
import { AcademyCreateBrandingSection } from './academy-create-branding-section';
import { AcademyCreateIdentitySection } from './academy-create-identity-section';
import { useAcademyCreateForm } from './use-academy-create-form';

type AcademyCreateModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AcademyCreateInput) => Promise<void>;
  t: TranslateFn;
};

export function AcademyCreateModal({ open, onClose, onSubmit, t }: AcademyCreateModalProps) {
  const form = useAcademyCreateForm(onSubmit);

  function handleCancel() {
    form.clear();
    onClose();
  }

  async function handleSubmit() {
    if (await form.submit()) onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent dir="rtl" className="max-h-[90dvh] gap-0 rounded-2xl sm:max-w-3xl sm:p-6">
        <DialogHeader className="space-y-1.5 text-start">
          <DialogTitle className="text-xl font-semibold">
            {t('stores.createModalHeading')}
          </DialogTitle>
          <p className="text-sm leading-6 text-muted-foreground">
            {t('stores.createModalSubtitle')}
          </p>
        </DialogHeader>

        <div className="mt-4 grid gap-x-8 gap-y-6 sm:grid-cols-12">
          <AcademyCreateIdentitySection form={form} t={t} />
          <AcademyCreateBrandingSection form={form} t={t} />
        </div>

        <DialogFooter className="mt-5 flex-row justify-end gap-3 border-t border-border/60 pt-4 sm:space-x-0">
          <button
            type="button"
            disabled={form.saving}
            onClick={handleCancel}
            className="inline-flex h-10 items-center justify-center rounded-xl px-5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-60"
          >
            {t('stores.cancel')}
          </button>
          <button
            type="button"
            disabled={!form.canSubmit}
            onClick={handleSubmit}
            className="inline-flex h-10 min-w-[10rem] items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {form.saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {t('common.create')}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
