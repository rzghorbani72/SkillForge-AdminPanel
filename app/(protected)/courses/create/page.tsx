'use client';

import { useCourseCreate } from '@/components/course/useCourseCreate';
import CreateCourseHeader from '@/components/course/CreateCourseHeader';
import CreateCourseForm from '@/components/course/CreateCourseForm';
import CreateCourseNoStoreState from '@/components/course/CreateCourseNoStoreState';

export default function CreateCoursePage() {
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
  } = useCourseCreate();

  if (!selectedStore) {
    return <CreateCourseNoStoreState />;
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <CreateCourseHeader storeName={selectedStore.name} onBack={handleBack} />

      <CreateCourseForm
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
