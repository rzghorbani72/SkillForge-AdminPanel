'use client';

import { useSchool } from '@/hooks/useSchool';
import { useCategoriesStore } from '@/lib/store';
import useLessonForm from '@/components/lesson/useLessonForm';
import LessonFormPage from '@/components/lesson/LessonFormPage';

export default function CreateLessonPage() {
  const { selectedSchool } = useSchool();
  const { categories } = useCategoriesStore();
  const {
    season,
    course,
    isLoading,
    isSubmitting,
    initialValues,
    onSubmit,
    isEdit
  } = useLessonForm(false);

  if (!selectedSchool) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-muted-foreground">
              No Store Selected
            </h2>
            <p className="text-muted-foreground">
              Please select a store from the header to create lessons.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || !initialValues || !season || !course) {
    return (
      <div id="create-lesson-page" className="container mx-auto py-6">
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
  );
}
