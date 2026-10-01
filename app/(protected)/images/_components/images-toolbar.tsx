'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Image as ImageIcon, Sparkles, ImagePlus } from 'lucide-react';
import { ErrorHandler } from '@/lib/error-handler';
import ImageUploadModal from '@/components/modal/image-upload-modal';
import { useTranslation } from '@/lib/i18n/hooks';
import { ImageItem } from '../_lib/page-helpers';

export function ImagesToolbar({
  fetchImages,
  filteredImages,
  images,
}: {
  fetchImages: () => Promise<void>;
  filteredImages: ImageItem[];
  images: ImageItem[];
}) {
  const { t } = useTranslation();
  return (
    <div className="fade-in-up flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div className="icon-container-warning">
          <ImageIcon className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t('media.images')}</h1>
            <Badge
              variant="secondary"
              className="hidden rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary sm:flex"
            >
              <Sparkles className="me-1 h-3 w-3" />
              {images.length} {t('media.files')}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground sm:text-base">
            {t('media.manageImageLibrary')} ({filteredImages.length} / {images.length})
          </p>
        </div>
      </div>
      <ImageUploadModal
        trigger={
          <Button className="gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/90 shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-xl hover:shadow-primary/30">
            <ImagePlus className="h-4 w-4" />
            {t('media.uploadImage')}
          </Button>
        }
        onSuccess={() => {
          fetchImages();
        }}
        onError={(error) => {
          console.error('Error uploading image:', error);
          ErrorHandler.handleApiError(error);
        }}
        modalTitle={t('media.uploadImage')}
        modalDescription={t('media.manageImageLibrary')}
      />
    </div>
  );
}
