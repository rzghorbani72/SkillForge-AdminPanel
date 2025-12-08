'use client';

import { useProductCreate } from '@/components/product/useProductCreate';
import CreateProductHeader from '@/components/product/CreateProductHeader';
import CreateProductForm from '@/components/product/CreateProductForm';
import CreateProductNoStoreState from '@/components/product/CreateProductNoStoreState';

export default function CreateProductPage() {
  const {
    form,
    selectedStore,
    isLoading,
    coverImage,
    coverPreview,
    isUploading,
    handleCoverImageChange,
    removeCoverImage,
    uploadCoverImage,
    cancelUpload,
    onSubmit,
    handleBack
  } = useProductCreate();

  if (!selectedStore) {
    return <CreateProductNoStoreState />;
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <CreateProductHeader storeName={selectedStore.name} onBack={handleBack} />

      <CreateProductForm
        form={form}
        isLoading={isLoading}
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
