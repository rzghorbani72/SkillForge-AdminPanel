'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImageUploadField } from '@/components/academies/image-upload-field';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { cn } from '@/lib/utils';
import { META_DESCRIPTION_MAX, META_TITLE_MAX, type SeoFormState } from './use-seo-form-state';

type SeoFormProps = {
  state: SeoFormState;
};

function CharCounter({ value, max }: { value: number; max: number }) {
  const formatNumber = useNumberFormat();
  return (
    <span className={cn('text-xs', value > max ? 'text-destructive' : 'text-muted-foreground')}>
      {formatNumber(value)} / {formatNumber(max)}
    </span>
  );
}

export function SeoForm({ state }: SeoFormProps) {
  const { t } = useTranslation();
  const {
    metaTitle,
    setMetaTitle,
    metaDescription,
    setMetaDescription,
    shareImage,
    saving,
    canSave,
    save,
  } = state;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('website.seo.formTitle')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="meta-title">{t('website.seo.metaTitle')}</Label>
            <CharCounter value={metaTitle.length} max={META_TITLE_MAX} />
          </div>
          <Input
            id="meta-title"
            value={metaTitle}
            maxLength={META_TITLE_MAX}
            placeholder={t('website.seo.metaTitlePlaceholder')}
            onChange={(e) => setMetaTitle(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">{t('website.seo.metaTitleHint')}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="meta-description">{t('website.seo.metaDescription')}</Label>
            <CharCounter value={metaDescription.length} max={META_DESCRIPTION_MAX} />
          </div>
          <Textarea
            id="meta-description"
            rows={3}
            value={metaDescription}
            maxLength={META_DESCRIPTION_MAX}
            placeholder={t('website.seo.metaDescriptionPlaceholder')}
            onChange={(e) => setMetaDescription(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">{t('website.seo.metaDescriptionHint')}</p>
        </div>

        <ImageUploadField
          label={t('website.seo.shareImage')}
          hint={t('website.seo.shareImageHint')}
          replaceHint={t('website.seo.shareImageReplace')}
          previewUrl={shareImage.preview}
          uploading={shareImage.uploading}
          onFile={shareImage.upload}
        />

        <div className="flex justify-end">
          <Button disabled={!canSave} onClick={() => void save()}>
            {saving ? t('common.saving') : t('common.save')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
