'use client';

import { useSchool } from '@/contexts/SchoolContext';
import { useCategoriesStore } from '@/lib/store';
import useLessonForm from '@/components/lesson/useLessonForm';
import LessonFormPage from '@/components/lesson/LessonFormPage';
import AccessControlGuard from '@/components/access-control/AccessControlGuard';

export default function EditLessonPage() {
  const { selectedSchool } = useSchool();
  const { categories } = useCategoriesStore();
  const {
    lesson,
    season,
    course,
    isLoading,
    isSubmitting,
    initialValues,
    onSubmit,
    isEdit
  } = useLessonForm(true);

  if (!selectedSchool) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-muted-foreground">
              No School Selected
            </h2>
            <p className="text-muted-foreground">
              Please select a school from the header to edit lessons.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || !initialValues || !season || !course) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AccessControlGuard
      resource={{
        owner_id: course?.author_id,
        school_id: course?.school_id,
        access_control: (lesson as any)?.access_control
      }}
      action="modify"
      fallbackPath={`/courses/${course?.id}/seasons/${season?.id}/lessons`}
      fallbackMessage="You can only edit your own lessons."
    >
      <LessonFormPage
        initialValues={initialValues}
        categories={categories}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
        onCancel={() => window.history.back()}
        season={season}
        course={course}
        isEdit={isEdit}
      />
    </AccessControlGuard>
  );
}
