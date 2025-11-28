import React from 'react';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { UseFormReturn } from 'react-hook-form';
import { ProductCreateFormData } from './useProductCreate';
import CreateProductBasicInfo from './CreateProductBasicInfo';
import CreateProductCoverImage from './CreateProductCoverImage';
import CreateProductPricing from './CreateProductPricing';
import CreateProductTypeSettings from './CreateProductTypeSettings';
import CreateProductPublishSettings from './CreateProductPublishSettings';
import CreateProductAssociations from './CreateProductAssociations';

type Props = {
  form: UseFormReturn<ProductCreateFormData>;
  isLoading: boolean;
  coverImage: File | null;
  coverPreview: string | null;
  isUploading: boolean;
  onCoverImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveCoverImage: () => void;
  onUploadCoverImage: () => void;
  onCancelUpload: () => void;
  onSubmit: (data: ProductCreateFormData) => void;
  onBack: () => void;
};

const CreateProductForm = ({
  form,
  isLoading,
  coverImage,
  coverPreview,
  isUploading,
  onCoverImageChange,
  onRemoveCoverImage,
  onUploadCoverImage,
  onCancelUpload,
  onSubmit,
  onBack
}: Props) => {
  return (
    <div className="max-w-4xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <CreateProductBasicInfo form={form} />

          <CreateProductCoverImage
            form={form}
            coverImage={coverImage}
            coverPreview={coverPreview}
            isUploading={isUploading}
            onCoverImageChange={onCoverImageChange}
            onRemoveCoverImage={onRemoveCoverImage}
            onUploadCoverImage={onUploadCoverImage}
            onCancelUpload={onCancelUpload}
          />

          <CreateProductPricing form={form} />

          <CreateProductTypeSettings form={form} />

          <CreateProductAssociations form={form} />

          <CreateProductPublishSettings form={form} />

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onBack}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Product'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CreateProductForm;
