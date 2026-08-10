'use client';

import { useStore } from '@/hooks/useStore';
import { useCategoriesStore } from '@/lib/store';
import useLessonForm from '@/components/lesson/useLessonForm';
import LessonFormPage from '@/components/lesson/LessonFormPage';
import { useTranslation } from '@/lib/i18n/hooks';

export default function CreateLessonPage() {
  const { t } = useTranslation();
  const { selectedAcademy } = useStore();
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

  if (!selectedAcademy) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-muted-foreground">
              {t('common.noStoreSelected')}
            </h2>
            <p className="text-muted-foreground">
              {t('common.selectStoreToManageLessons')}
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
            <p className="text-muted-foreground">{t('common.loading')}</p>
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
