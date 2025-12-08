'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useStore } from '@/hooks/useStore';
import { useCategoriesStore } from '@/lib/store';
import useCourseEdit from '@/components/course/useCourseEdit';
import CourseForm from '@/components/course/CourseForm';
import EditHeader from '@/components/course/EditHeader';
import AccessControlGuard from '@/components/access-control/AccessControlGuard';

export default function EditCoursePage() {
  const router = useRouter();
  const { selectedStore } = useStore();
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

  if (!selectedStore) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-muted-foreground">
              No Store Selected
            </h2>
            <p className="text-muted-foreground">
              Please select a store from the header to edit courses.
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
    <AccessControlGuard
      resource={course}
      action="modify"
      fallbackPath="/courses"
      fallbackMessage="You can only edit your own courses."
    >
      <div className="flex-1 space-y-6 p-6">
        <EditHeader course={course!} onBack={() => router.back()} />

        <div className="max-w-4xl">
          <CourseForm
            initialValues={initialValues}
            categories={categories}
            isSubmitting={isSubmitting}
            onSubmit={onSubmit}
            onCancel={() => router.back()}
            submitLabel="Update Course"
          />
        </div>
      </div>
    </AccessControlGuard>
  );
}
