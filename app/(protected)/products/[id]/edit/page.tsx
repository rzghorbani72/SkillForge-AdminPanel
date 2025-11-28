'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useProductEdit } from '@/components/product/useProductEdit';
import EditProductHeader from '@/components/product/EditProductHeader';
import CreateProductForm from '@/components/product/CreateProductForm';
import CreateProductNoSchoolState from '@/components/product/CreateProductNoSchoolState';

export default function EditProductPage() {
  const router = useRouter();
  const {
    product,
    form,
    selectedSchool,
    isLoading,
    isSubmitting,
    coverImage,
    coverPreview,
    isUploading,
    handleCoverImageChange,
    removeCoverImage,
    uploadCoverImage,
    cancelUpload,
    onSubmit,
    handleBack
  } = useProductEdit();

  if (!selectedSchool) {
    return <CreateProductNoSchoolState />;
  }

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
            <p className="mt-2 text-sm text-gray-600">Loading product...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-muted-foreground">
              Product Not Found
            </h2>
            <p className="text-muted-foreground">
              The product you're looking for doesn't exist or you don't have
              permission to edit it.
            </p>
            <Button onClick={() => router.push('/products')} className="mt-4">
              Back to Products
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <EditProductHeader product={product} onBack={handleBack} />

      <CreateProductForm
        form={form}
        isLoading={isSubmitting}
        coverImage={coverImage}
        coverPreview={coverPreview}
        isUploading={isUploading}
        onCoverImageChange={handleCoverImageChange}
        onRemoveCoverImage={removeCoverImage}
        onUploadCoverImage={uploadCoverImage}
        onCancelUpload={cancelUpload}
        onSubmit={onSubmit}
        onBack={handleBack}
      />
    </div>
  );
}
