'use client';

import { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { ImageUploadField } from '@/components/academies/image-upload-field';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { useImageUpload } from '@/hooks/use-image-upload';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { resolveMediaUrl } from '@/lib/media-url';
import type { Academy } from '@/types/api';

type AcademyShowcaseModalProps = {
  academy: Pick<
    Academy,
    'id' | 'name' | 'showcase_desktop' | 'showcase_mobile'
  >;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
};

export function AcademyShowcaseModal({
  academy,
  open,
  onClose,
  onSaved
}: AcademyShowcaseModalProps) {
  const { t } = useTranslation();
  const desktop = useImageUpload();
  const mobile = useImageUpload();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    desktop.reset(resolveMediaUrl(academy.showcase_desktop?.publicUrl));
    mobile.reset(resolveMediaUrl(academy.showcase_mobile?.publicUrl));
    // Reset only when the modal opens for this academy.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, academy.id]);

  const dirty = Boolean(desktop.id || mobile.id);

  async function handleSave() {
    setSaving(true);
    try {
      await apiClient.setAcademyShowcase(academy.id, {
        ...(desktop.id ? { showcase_desktop_id: desktop.id } : {}),
        ...(mobile.id ? { showcase_mobile_id: mobile.id } : {})
      });
      ErrorHandler.showSuccess(t('settings.showcaseSaved'));
      onSaved();
      onClose();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{t('settings.showcaseTitle')}</DialogTitle>
          <DialogDescription>
            {academy.name} — {t('settings.showcaseDescription')}
          </DialogDescription>
        </DialogHeader>
        <div className="grid items-stretch gap-4 sm:grid-cols-2">
          <ImageUploadField
            label={t('settings.showcaseDesktop')}
            hint={t('settings.showcaseDesktopHint')}
            replaceHint={t('stores.brandingReplaceHint')}
            previewUrl={desktop.preview}
            uploading={desktop.uploading}
            onFile={desktop.upload}
          />
          <ImageUploadField
            label={t('settings.showcaseMobile')}
            hint={t('settings.showcaseMobileHint')}
            replaceHint={t('stores.brandingReplaceHint')}
            previewUrl={mobile.preview}
            uploading={mobile.uploading}
            onFile={mobile.upload}
          />
        </div>
        <div className="flex justify-end">
          <Button
            disabled={!dirty || saving || desktop.uploading || mobile.uploading}
            onClick={() => void handleSave()}
          >
            {saving ? (
              <Loader2 className="me-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="me-1.5 h-3.5 w-3.5" />
            )}
            {t('common.save')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
