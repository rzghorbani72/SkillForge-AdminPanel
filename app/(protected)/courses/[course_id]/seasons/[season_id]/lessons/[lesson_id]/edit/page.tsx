'use client';

import { useStore } from '@/hooks/useStore';
import { useCategoriesStore } from '@/lib/store';
import useLessonForm from '@/components/lesson/useLessonForm';
import LessonFormPage from '@/components/lesson/LessonFormPage';
import { useTranslation } from '@/lib/i18n/hooks';
import { QuizBuilder } from '@/components/quiz/quiz-builder';
import { LessonDownloadPolicyEditor } from '@/components/lesson/lesson-download-policy-editor';

export default function EditLessonPage() {
  const { t } = useTranslation();
  const { selectedAcademy } = useStore();
  const { categories } = useCategoriesStore();
  const {
    lesson,
    season,
    course,
    isLoading,
    isSubmitting,
    initialValues,
    onSubmit,
    isEdit,
    refetch
  } = useLessonForm(true);

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

  if (isLoading) {
    return (
      <div id="edit-lesson-page" className="container mx-auto py-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            <p className="text-muted-foreground">{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!initialValues) {
    return (
      <div id="edit-lesson-page" className="container mx-auto py-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">
              {t('courses.lessonNotFound')}
            </p>
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
      lesson={lesson}
      onLiveSessionSaved={refetch}
    >
      {lesson && (
        <section aria-label={t('downloadPolicy.title')}>
          <LessonDownloadPolicyEditor lesson={lesson} />
        </section>
      )}
      {lesson?.lesson_type === 'QUIZ' && (
        <section aria-label={t('quiz.manager')}>
          <QuizBuilder lessonId={lesson.id} />
        </section>
      )}
    </LessonFormPage>
  );
}
