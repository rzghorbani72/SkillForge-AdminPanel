'use client';

import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Form } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n/hooks';
import { useRouter } from 'next/navigation';
import { useCourseForm } from './useCourseForm';
import CreateCourseBasicInfo from './CreateCourseBasicInfo';
import CreateCoursePricing from './CreateCoursePricing';
import CreateCourseAssociations from './CreateCourseAssociations';
import ImageUploadPreview from '@/components/ui/ImageUploadPreview';
import { SeasonsSection } from './SeasonsSection';
import { CourseOffersSection } from './CourseOffersSection';

// ─── Props ────────────────────────────────────────────────────────────────────

interface CourseFormPageProps {
  /** Present when editing an existing course */
  courseId?: string;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CourseFormPage({ courseId }: CourseFormPageProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const isEdit = courseId !== undefined;

  const {
    form,
    isLoading,
    isSaving,
    saveProgress,
    seasons,
    lessons,
    selectedAcademy,
    existingCoverUrl,
    addSeason,
    removeSeason,
    updateSeason,
    reorderSeasons,
    addLesson,
    removeLesson,
    updateLesson,
    assignLesson,
    reorderLessons,
    save
  } = useCourseForm(courseId);

  // ── Guards ──────────────────────────────────────────────────────────────

  if (!selectedAcademy) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-3 p-6">
        <p className="text-muted-foreground">{t('common.noStoreSelected')}</p>
        <Button variant="outline" onClick={() => router.push('/courses')}>
          {t('courses.backToCourses')}
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-full items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            {t('courses.loadingCourses')}
          </p>
        </div>
      </div>
    );
  }

  const isPublished = form.watch('published');

  return (
    <>
      {/* ── Header (sticky; pinned while the layout container scrolls) ────── */}
      <div className="sticky top-0 z-10 flex flex-wrap items-start justify-between gap-4 border-b bg-background px-6 py-4">
        <div className="flex items-start gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="mt-0.5 h-8 w-8 shrink-0"
            onClick={() => router.back()}
            aria-label={t('common.back')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isEdit ? t('courses.editCourse') : t('courses.createCourse')}
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {selectedAcademy.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Publish toggle — only when editing; a brand-new course starts as a
              draft and is published from the curriculum step. */}
          {isEdit && (
            <div className="flex items-center gap-2 rounded-lg border px-3 py-1.5">
              <Switch
                checked={isPublished}
                onCheckedChange={(v) => form.setValue('published', v)}
                id="publish-toggle"
              />
              <label
                htmlFor="publish-toggle"
                className="cursor-pointer text-sm font-medium"
              >
                {isPublished ? (
                  <Badge className="text-xs">{t('courses.published')}</Badge>
                ) : (
                  <span className="text-muted-foreground">
                    {t('courses.draft')}
                  </span>
                )}
              </label>
            </div>
          )}

          <Button
            type="button"
            disabled={isSaving}
            onClick={form.handleSubmit(save)}
            className="min-w-[120px]"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {saveProgress || t('courses.saving')}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                {isEdit
                  ? t('courses.saveChanges')
                  : t('courses.createAndContinue')}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* ── Form (flows naturally; scrolls inside the layout container) ───── */}
      <div className="p-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(save)}
            className="w-full space-y-6"
            noValidate
          >
            {/* Basic info: title + description */}
            <CreateCourseBasicInfo form={form} />

            {/* Cover image */}
            <Card>
              <CardHeader>
                <CardTitle>{t('courses.coverImage')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUploadPreview
                  title={form.watch('title') || 'Course Cover'}
                  description={form.watch('description') || ''}
                  existingImageUrl={existingCoverUrl}
                  onSuccess={(img) =>
                    form.setValue('cover_id', img.id.toString())
                  }
                  selectedImageId={form.watch('cover_id')}
                  alt="Course cover"
                  className="aspect-video w-full max-w-md"
                  placeholderText={t('courses.noCoverImageSelected')}
                  placeholderSubtext={t('courses.uploadImageToPreview')}
                  uploadButtonText={t('courses.uploadCoverImage')}
                />
              </CardContent>
            </Card>

            {/* Category */}
            <CreateCourseAssociations
              categoryId={form.watch('category_id')}
              onCategoryChange={(id) => form.setValue('category_id', id)}
              error={form.formState.errors.category_id?.message}
            />

            {/* Pricing */}
            <CreateCoursePricing form={form} />

            {/* Seasons & Lessons — built in step 2 (the edit screen). On create
              we keep step 1 focused on the course basics. */}
            {isEdit && (
              <SeasonsSection
                seasons={seasons}
                lessons={lessons}
                onAddSeason={addSeason}
                onRemoveSeason={removeSeason}
                onUpdateSeason={updateSeason}
                onReorderSeasons={reorderSeasons}
                onAddLesson={addLesson}
                onRemoveLesson={removeLesson}
                onUpdateLesson={updateLesson}
                onAssignLesson={assignLesson}
                onReorderLessons={reorderLessons}
              />
            )}

            {/* Pricing offerings — multi-price per course (edit screen only) */}
            {isEdit && courseId && <CourseOffersSection courseId={courseId} />}

            {/* Footer actions */}
            <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.back()}
              >
                {t('common.cancel')}
              </Button>

              <Button
                type="submit"
                disabled={isSaving}
                className="min-w-[140px]"
              >
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {saveProgress || t('courses.saving')}
                  </span>
                ) : isEdit ? (
                  t('courses.saveChanges')
                ) : (
                  t('courses.createAndContinue')
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
}
