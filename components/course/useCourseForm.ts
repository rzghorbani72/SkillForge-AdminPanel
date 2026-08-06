'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useStore } from '@/hooks/useStore';
import { toast } from 'react-toastify';
import { useTranslation } from '@/lib/i18n/hooks';
import type { Season, Lesson } from '@/types/api';
import { courseFormSchema, type CourseFormData } from './schema';
import {
  durationToSeconds,
  emptyLesson,
  newKey,
  secondsToDuration,
  validateForPublish,
  type LessonDraft,
  type SeasonDraft
} from './course-drafts';
import { useCurriculumDraft } from './useCurriculumDraft';

export type { LessonDraft, LessonType, SeasonDraft } from './course-drafts';
export { durationToSeconds, secondsToDuration, validateForPublish };

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * Drives the course builder: one page that loads a course and saves the whole
 * of it — details, cover, pricing and curriculum — in a single request.
 */
export function useCourseForm(courseId: string) {
  const router = useRouter();
  const { t } = useTranslation();
  const { selectedAcademy } = useStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState('');
  const existingCoverUrl = useRef<string | null>(null);
  const curriculum = useCurriculumDraft();
  const {
    seasons,
    lessons,
    deletedSeasonIds,
    deletedLessonIds,
    setSeasons,
    setLessons,
    clearDeleted
  } = curriculum;

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: {
      title: '',
      description: '',
      primary_price: '0',
      secondary_price: '0',
      category_id: '',
      published: false,
      is_featured: false
    }
  });

  // ── Load existing course for edit ─────────────────────────────────────────

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const [course, rawSeasons, rawLessons] = await Promise.all([
          apiClient.getCourse(courseId),
          apiClient.getSeasons(courseId),
          apiClient.getLessons({ course_id: courseId })
        ]);

        const cover = (course as any).Image ?? course.cover;
        const categoryId =
          (course as any).Category?.id ?? course.category?.id ?? '';
        existingCoverUrl.current = cover?.publicUrl ?? null;

        form.reset({
          title: course.title ?? '',
          description: course.description ?? '',
          primary_price: Math.trunc(course.price ?? 0).toString(),
          secondary_price: Math.trunc(course.original_price ?? 0).toString(),
          category_id: categoryId,
          cover_id: cover?.id ?? '',
          published: course.is_published ?? false,
          is_featured: course.is_featured ?? false
        });

        const loadedSeasons: SeasonDraft[] = (rawSeasons as Season[]).map(
          (s) => ({
            id: s.id,
            title: s.title,
            description: s.description ?? '',
            clientKey: newKey()
          })
        );

        // Map season DB id → clientKey so lessons can reference their season
        const seasonDbIdToClientKey = new Map<string, string>(
          loadedSeasons.map((s) => [s.id!, s.clientKey])
        );

        const loadedLessons: LessonDraft[] = (rawLessons as Lesson[]).map(
          (l) => ({
            id: l.id,
            title: l.title,
            description: l.description ?? '',
            duration: secondsToDuration(l.duration),
            lesson_type: l.lesson_type ?? 'VIDEO',
            is_free: l.is_free,
            published: l.is_published,
            video_id: l.video_id,
            audio_id: l.audio_id,
            cover_id: l.image_id,
            document_id: l.document_id,
            videoPreviewUrl:
              l.Video?.publicUrl ??
              (l.video_id
                ? apiClient.getVideoStreamUrl(l.video_id)
                : undefined),
            audioPreviewUrl: l.Audio?.publicUrl,
            coverPreviewUrl: l.Image?.publicUrl,
            clientKey: newKey(),
            seasonClientKey:
              l.season_id != null
                ? seasonDbIdToClientKey.get(l.season_id)
                : undefined
          })
        );

        setSeasons(loadedSeasons);
        setLessons(loadedLessons.length > 0 ? loadedLessons : [emptyLesson()]);
      } catch (err) {
        ErrorHandler.handleApiError(err);
        router.push('/courses');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [courseId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Save ──────────────────────────────────────────────────────────────────

  /**
   * One atomic save: course details + every season/lesson + deletes in a single
   * backend transaction, so a mid-save error can never leave half a course.
   * Publishing is just a flag on this same save — a course stays a draft until
   * the manager turns it on.
   */
  const save = useCallback(
    async (data: CourseFormData) => {
      if (!selectedAcademy) {
        toast.error(t('toasts.selectAcademyFirst'));
        return;
      }
      if (isSaving) return;

      if (data.published) {
        const problem = validateForPublish(seasons, lessons);
        if (problem) {
          toast.error(t(problem));
          return;
        }
      }

      setIsSaving(true);
      setSaveProgress(t('courses.savingCourse'));
      try {
        await apiClient.updateCourseContent(courseId, {
          title: data.title.trim(),
          description: data.description.trim(),
          primary_price: Number(data.primary_price),
          secondary_price: Number(data.secondary_price),
          category_id: data.category_id || undefined,
          cover_id: data.cover_id || undefined,
          published: data.published,
          is_featured: data.is_featured,
          seasons: seasons
            .filter((s) => s.title.trim())
            .map((s) => ({
              id: s.id,
              client_key: s.clientKey,
              title: s.title.trim(),
              description: s.description.trim() || undefined
            })),
          lessons: lessons
            .filter((l) => l.title.trim())
            .map((l) => ({
              id: l.id,
              title: l.title.trim(),
              description: l.description.trim() || undefined,
              duration: durationToSeconds(l.duration),
              lesson_type: l.lesson_type,
              is_free: l.is_free,
              published: l.published,
              video_id: l.video_id,
              audio_id: l.audio_id,
              cover_id: l.cover_id,
              document_id: l.document_id,
              season_client_key: l.seasonClientKey
            })),
          deleted_season_ids:
            deletedSeasonIds.length > 0 ? deletedSeasonIds : undefined,
          deleted_lesson_ids:
            deletedLessonIds.length > 0 ? deletedLessonIds : undefined
        });
        clearDeleted();
        toast.success(
          t(data.published ? 'courses.updatedToast' : 'courses.draftSavedToast')
        );
      } catch (err) {
        ErrorHandler.handleApiError(err);
      } finally {
        setIsSaving(false);
        setSaveProgress('');
      }
    },
    [
      selectedAcademy,
      isSaving,
      courseId,
      seasons,
      lessons,
      deletedSeasonIds,
      deletedLessonIds,
      clearDeleted,
      t
    ]
  );

  /**
   * The cover file already lives on the server, so persist it right away
   * instead of waiting for a manual save. Published state is untouched: an
   * upload never publishes a course and never unpublishes a live one.
   */
  const saveCover = useCallback(async () => {
    const values = form.getValues();
    // Quiet check: nothing valid to save yet while fields are incomplete, and
    // firing red errors right after an upload is noise.
    if (!courseFormSchema.safeParse(values).success) return;
    await save(values);
  }, [form, save]);

  return {
    form,
    isLoading,
    isSaving,
    saveProgress,
    ...curriculum,
    selectedAcademy,
    existingCoverUrl: existingCoverUrl.current,
    save,
    saveCover
  };
}
