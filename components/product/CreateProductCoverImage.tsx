import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UseFormReturn } from 'react-hook-form';
import { ProductCreateFormData } from './useProductCreate';
import ImageUploadPreview from '@/components/ui/ImageUploadPreview';

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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cover Image</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ImageUploadPreview
          title={form.watch('title') || 'Product Cover'}
          description={form.watch('description') || 'Product cover image'}
          onSuccess={(image) => {
            form.setValue('cover_id', image.id.toString());
          }}
          selectedImageId={form.watch('cover_id')}
          alt="Product cover preview"
          className="aspect-[5/4] w-full max-w-md"
          placeholderText="No cover image selected"
          placeholderSubtext="Upload an image to preview it here"
          uploadButtonText="Upload Cover Image"
          selectButtonText="Select an image first"
        />
      </CardContent>
    </Card>
  );
};

export default CreateProductCoverImage;
