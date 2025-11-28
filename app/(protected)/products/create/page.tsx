'use client';

import { useProductCreate } from '@/components/product/useProductCreate';
import CreateProductHeader from '@/components/product/CreateProductHeader';
import CreateProductForm from '@/components/product/CreateProductForm';
import CreateProductNoSchoolState from '@/components/product/CreateProductNoSchoolState';

export default function CreateProductPage() {
  const {
    form,
    selectedSchool,
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

  if (!selectedSchool) {
    return <CreateProductNoSchoolState />;
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <CreateProductHeader
        schoolName={selectedSchool.name}
        onBack={handleBack}
      />

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
