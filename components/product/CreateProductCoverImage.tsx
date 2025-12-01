'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UseFormReturn } from 'react-hook-form';
import { ProductCreateFormData } from './useProductCreate';
import ImageUploadPreview from '@/components/ui/ImageUploadPreview';
import { useTranslation } from '@/lib/i18n/hooks';

type Props = {
  form: UseFormReturn<ProductCreateFormData>;
  coverImage: File | null;
  coverPreview: string | null;
  isUploading: boolean;
  onCoverImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveCoverImage: () => void;
  onUploadCoverImage: () => void;
  onCancelUpload: () => void;
};

const CreateProductCoverImage = ({ form }: Props) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('products.coverImage')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ImageUploadPreview
          title={form.watch('title') || t('products.productCover')}
          description={
            form.watch('description') || t('products.productCoverImage')
          }
          onSuccess={(image) => {
            form.setValue('cover_id', image.id.toString());
          }}
          selectedImageId={form.watch('cover_id')}
          alt={t('products.productCoverPreview')}
          className="aspect-[5/4] w-full max-w-md"
          placeholderText={t('products.noCoverImageSelected')}
          placeholderSubtext={t('products.uploadImageToPreview')}
          uploadButtonText={t('products.uploadCoverImage')}
          selectButtonText={t('products.selectImageFirst')}
        />
      </CardContent>
    </Card>
  );
};

export default CreateProductCoverImage;
