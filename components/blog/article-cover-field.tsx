'use client';

/* eslint-disable @next/next/no-img-element */
import { useState } from 'react';
import { ImagePlus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { pickAndUploadImage } from '@/components/blog/upload-article-image';
import { useTranslation } from '@/lib/i18n/hooks';

type ArticleCoverFieldProps = {
  imageUrl: string | null;
  onChange: (imageId: string | null, imageUrl: string | null) => void;
};

/** The cover shown on the blog list and used as the social share image. */
export function ArticleCoverField({
  imageUrl,
  onChange
}: ArticleCoverFieldProps) {
  const { t } = useTranslation();
  const [isUploading, setIsUploading] = useState(false);

  const handlePick = async () => {
    setIsUploading(true);
    try {
      const uploaded = await pickAndUploadImage();
      if (uploaded) onChange(uploaded.id, uploaded.publicUrl);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label>{t('blog.fields.cover')}</Label>
      <div className="flex items-center gap-3">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            className="h-20 w-32 rounded-md border object-cover"
          />
        ) : (
          <div className="flex h-20 w-32 items-center justify-center rounded-md border border-dashed text-muted-foreground">
            <ImagePlus className="h-5 w-5" />
          </div>
        )}
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isUploading}
            onClick={() => void handlePick()}
          >
            {t('blog.actions.uploadCover')}
          </Button>
          {imageUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange(null, null)}
            >
              {t('common.remove')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
