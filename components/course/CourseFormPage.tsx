'use client';

import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Form } from '@/components/ui/form';
import { useTranslation } from '@/lib/i18n/hooks';
import { useRouter } from 'next/navigation';
import { useCourseForm } from './useCourseForm';
import CreateCourseBasicInfo from './CreateCourseBasicInfo';
import CreateCoursePricing from './CreateCoursePricing';
import CreateCourseAssociations from './CreateCourseAssociations';
import CreateCourseCoverImage from './CreateCourseCoverImage';
import { SeasonsSection } from './SeasonsSection';

// ─── Props ────────────────────────────────────────────────────────────────────

interface CourseFormPageProps {
  /** Present when editing an existing course */
  courseId?: number;
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
    selectedAcademy,
    coverUpload,
    existingCoverUrl,
    addSeason,
    removeSeason,
    updateSeason,
    reorderSeasons,
    addLesson,
    removeLesson,
    updateLesson,
    reorderLessons,
    save
  } = useCourseForm(courseId);

  // ── Guards ──────────────────────────────────────────────────────────────

  if (!selectedAcademy) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6">
        <p className="text-muted-foreground">{t('common.noStoreSelected')}</p>
        <Button variant="outline" onClick={() => router.push('/courses')}>
          {t('courses.backToCourses')}
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
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
    <div className="flex-1 space-y-6 p-6">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
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
          {/* Publish toggle */}
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
                {isEdit ? t('courses.saveChanges') : t('courses.createCourse')}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* ── Form ─────────────────────────────────────────────────────────── */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(save)}
          className="max-w-4xl space-y-6"
          noValidate
        >
          {/* Basic info: title + description */}
          <CreateCourseBasicInfo form={form as any} />

          {/* Cover image */}
          <CreateCourseCoverImage
            form={form as any}
            coverImage={coverUpload.selectedFile}
            coverPreview={coverUpload.preview ?? existingCoverUrl}
            isUploading={coverUpload.isUploading}
            onCoverImageChange={coverUpload.handleFileChange}
            onRemoveCoverImage={coverUpload.removeFile}
            onUploadCoverImage={coverUpload.uploadImage}
            onCancelUpload={coverUpload.cancelUpload}
          />

          {/* Category */}
          <CreateCourseAssociations form={form as any} />

          {/* Pricing */}
          <CreateCoursePricing form={form as any} />

          {/* Seasons & Lessons */}
          <SeasonsSection
            seasons={seasons}
            onAddSeason={addSeason}
            onRemoveSeason={removeSeason}
            onUpdateSeason={updateSeason}
            onReorderSeasons={reorderSeasons}
            onAddLesson={addLesson}
            onRemoveLesson={removeLesson}
            onUpdateLesson={updateLesson}
            onReorderLessons={reorderLessons}
          />

          {/* Footer actions */}
          <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              {t('common.cancel')}
            </Button>

            <Button type="submit" disabled={isSaving} className="min-w-[140px]">
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {saveProgress || t('courses.saving')}
                </span>
              ) : isEdit ? (
                t('courses.saveChanges')
              ) : (
                t('courses.createCourse')
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
