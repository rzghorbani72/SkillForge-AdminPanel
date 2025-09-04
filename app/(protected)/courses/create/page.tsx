'use client';

import { useCategoriesStore } from '@/lib/store';
import { useCourseCreate } from '@/components/course/useCourseCreate';
import CreateCourseHeader from '@/components/course/CreateCourseHeader';
import CreateCourseForm from '@/components/course/CreateCourseForm';
import CreateCourseNoSchoolState from '@/components/course/CreateCourseNoSchoolState';

export default function CreateCoursePage() {
  const { categories } = useCategoriesStore();
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
  } = useCourseCreate();

  if (!selectedSchool) {
    return <CreateCourseNoSchoolState />;
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <CreateCourseHeader
        schoolName={selectedSchool.name}
        onBack={handleBack}
      />

      <CreateCourseForm
        form={form}
        categories={categories}
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
