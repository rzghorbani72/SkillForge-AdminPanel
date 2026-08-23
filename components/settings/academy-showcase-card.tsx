'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';

import { ImageUploadField } from '@/components/academies/image-upload-field';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { useImageUpload } from '@/hooks/use-image-upload';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { resolveMediaUrl } from '@/lib/media-url';

/**
 * Landing-page showcase shots. These are platform editorial — the marketing site
 * pairs the desktop image with the mobile one for every academy it features — so
 * the card is only rendered for platform admins, and the API rejects anyone else.
 */
export function AcademyShowcaseCard() {
  const { t } = useTranslation();
  const desktop = useImageUpload();
  const mobile = useImageUpload();
  const [saving, setSaving] = useState(false);

  // The academies list does not carry these two fields, so read the detail
  // endpoint directly instead of the store's cached academy.
  const load = useCallback(async () => {
    try {
      const data = await apiClient.getCurrentAcademyDetail();
      desktop.reset(resolveMediaUrl(data.showcase_desktop?.publicUrl));
      mobile.reset(resolveMediaUrl(data.showcase_mobile?.publicUrl));
    } catch (error) {
      ErrorHandler.handleApiError(error);
    }
    // The upload hooks are stable ref-like results; depending on them would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const dirty = Boolean(desktop.id || mobile.id);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.updateAcademy({
        ...(desktop.id ? { showcase_desktop_id: desktop.id } : {}),
        ...(mobile.id ? { showcase_mobile_id: mobile.id } : {})
      });
      ErrorHandler.showSuccess(t('settings.showcaseSaved'));
      await load();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settings.showcaseTitle')}</CardTitle>
        <CardDescription>{t('settings.showcaseDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
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
      </CardContent>
    </Card>
  );
}
