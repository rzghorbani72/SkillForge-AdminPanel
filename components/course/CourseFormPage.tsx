'use client';

import { useState } from 'react';
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
import { CourseAccessSection } from '@/components/access/course-access-section';
import { applyAccessSelection } from '@/components/access/staged-access-section';
import type { AssignAccessSelection } from '@/components/access/assign-access-form';
import { SaveStatusIndicator } from './SaveStatusIndicator';

interface CourseFormPageProps {
  courseId: string;
}

/**
 * The course builder: everything about one course on a single page. A course is
 * created empty elsewhere (quick create) and shaped here, staying a draft until
 * the publish switch is turned on.
 */
export default function CourseFormPage({ courseId }: CourseFormPageProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const {
    form,
    isLoading,
    isSaving,
    saveStatus,
    seasons,
    lessons,
    selectedAcademy,
    existingCoverUrl,
    addSeason,
    removeSeason,
    clearSeason,
    updateSeason,
    reorderSeasons,
    addLesson,
    removeLesson,
    clearLesson,
    updateLesson,
    assignLesson,
    reorderLessons,
    togglePublish,
    retrySave,
    saveNow,
    saveCover
  } = useCourseForm(courseId);

  const [pendingAccess, setPendingAccess] =
    useState<AssignAccessSelection | null>(null);

  /**
   * One Save for the whole page: the course first, then the access chosen in
   * the box below, so the manager never has to submit that separately.
   */
  const saveAll = async () => {
    if (!(await saveNow())) return;
    await applyAccessSelection(courseId, pendingAccess);
    router.push('/courses');
  };

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
            onClick={() => router.push('/courses')}
            aria-label={t('common.back')}
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t('courses.editCourse')}
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {selectedAcademy.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <SaveStatusIndicator status={saveStatus} onRetry={retrySave} />

          <Button
            type="button"
            disabled={isSaving}
            onClick={() => void saveAll()}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {t('common.saveChanges')}
          </Button>

          {/* Publish switch — the only thing that makes a course public */}
          <div className="flex items-center gap-2 rounded-lg border px-3 py-1.5">
            <Switch
              checked={isPublished}
              disabled={isSaving}
              onCheckedChange={(v) => void togglePublish(v)}
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
        </div>
      </div>

      <div className="w-full max-w-5xl p-6">
        <p className="mb-6 text-sm text-muted-foreground">
          {isPublished
            ? t('courses.builderPublishedHint')
            : t('courses.builderDraftHint')}
        </p>

        <Form {...form}>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="w-full space-y-6"
            noValidate
          >
            <CreateCourseBasicInfo form={form} />

            <Card>
              <CardHeader>
                <CardTitle>{t('courses.coverImage')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUploadPreview
                  title={form.watch('title')}
                  description={form.watch('description')}
                  existingImageUrl={existingCoverUrl}
                  onSuccess={(img) => {
                    form.setValue('cover_id', img.id.toString());
                    // The image is already on the server; persist the course it
                    // belongs to instead of waiting for a manual save.
                    void saveCover();
                  }}
                  selectedImageId={form.watch('cover_id')}
                  className="aspect-video w-full max-w-md"
                  placeholderText={t('courses.noCoverImageSelected')}
                  placeholderSubtext={t('courses.uploadImageToPreview')}
                />
              </CardContent>
            </Card>

            <CreateCourseAssociations
              categoryId={form.watch('category_id')}
              onCategoryChange={(id) => form.setValue('category_id', id)}
              error={form.formState.errors.category_id?.message}
            />

            <CreateCoursePricing form={form} />

            <SeasonsSection
              seasons={seasons}
              lessons={lessons}
              onAddSeason={addSeason}
              onRemoveSeason={removeSeason}
              onClearSeason={clearSeason}
              onUpdateSeason={updateSeason}
              onReorderSeasons={reorderSeasons}
              onAddLesson={addLesson}
              onRemoveLesson={removeLesson}
              onClearLesson={clearLesson}
              onUpdateLesson={updateLesson}
              onAssignLesson={assignLesson}
              onReorderLessons={reorderLessons}
            />

            {/* Multi-price offerings */}
            <CourseOffersSection courseId={courseId} />

            {/* Hand the course to students/groups without a purchase */}
            <CourseAccessSection
              courseId={courseId}
              onPendingChange={setPendingAccess}
            />

            {/* Footer actions */}
            <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push(`/courses/${courseId}`)}
              >
                {t('courses.viewCourse')}
              </Button>

              <div className="flex items-center gap-3">
                <SaveStatusIndicator status={saveStatus} onRetry={retrySave} />
                <Button
                  type="button"
                  disabled={isSaving}
                  onClick={() => void saveAll()}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  {t('common.saveChanges')}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
}
