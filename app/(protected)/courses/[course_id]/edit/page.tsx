'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useSchool } from '@/contexts/SchoolContext';
import { useCategoriesStore } from '@/lib/store';
import useCourseEdit from '@/components/course/useCourseEdit';
import CourseForm from '@/components/course/CourseForm';
import EditHeader from '@/components/course/EditHeader';

export default function EditCoursePage() {
  const router = useRouter();
  const { selectedSchool } = useSchool();
  const { categories } = useCategoriesStore();
  const {
    course,
    isLoading,
    isSubmitting,
    initialValues,
    onSubmit,
    handleCoverImageChange,
    removeCoverImage,
    coverImage,
    coverPreview
  } = useCourseEdit();
  console.log('coverPreview', coverPreview);

  console.log('initialValues', initialValues);
  if (!selectedSchool) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-muted-foreground">
              No School Selected
            </h2>
            <p className="text-muted-foreground">
              Please select a school from the header to edit courses.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
            <p className="mt-2 text-sm text-gray-600">Loading course...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-muted-foreground">
              Course Not Found
            </h2>
            <p className="text-muted-foreground">
              The course you're looking for doesn't exist or you don't have
              permission to edit it.
            </p>
            <Button onClick={() => router.push('/courses')} className="mt-4">
              Back to Courses
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!initialValues) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
            <p className="mt-2 text-sm text-gray-600">Loading course data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <EditHeader course={course!} onBack={() => router.back()} />

      <div className="max-w-4xl">
        <CourseForm
          initialValues={initialValues}
          categories={categories}
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
          onCancel={() => router.back()}
          onCoverImageChange={handleCoverImageChange}
          onRemoveCoverImage={removeCoverImage}
          coverImage={coverImage}
          coverPreview={
            coverPreview?.startsWith('/')
              ? `${process.env.NEXT_PUBLIC_HOST}${coverPreview}`
              : coverPreview
          }
          submitLabel="Update Course"
        />
      </div>
    </div>
  );
}
