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
  emptySeason,
  newKey,
  secondsToDuration,
  validateForPublish,
  type LessonDraft,
  type SeasonDraft
} from './course-drafts';
import { useCurriculumDraft } from './useCurriculumDraft';
import { useDebouncedCallback } from '@/hooks/use-debounced-callback';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

// Autosave is a safety net, not a keystroke logger: it waits for a real pause
// in typing, and an unchanged payload is never sent at all (see lastSavedRef).
const AUTOSAVE_DELAY_MS = 5000;

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
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const isSaving = saveStatus === 'saving';
  const savingRef = useRef(false);
  // Fingerprint of the last payload the server accepted — see `save`.
  const lastSavedRef = useRef<string | null>(null);
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
            clientKey: newKey()
          })
        );
        // Lessons are only ever rendered inside a season, so there must always
        // be one to hold them.
        if (loadedSeasons.length === 0) loadedSeasons.push(emptySeason());
        const defaultSeasonKey = loadedSeasons[0].clientKey;

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
              (l.season_id != null
                ? seasonDbIdToClientKey.get(l.season_id)
                : undefined) ?? defaultSeasonKey
          })
        );

        setSeasons(loadedSeasons);
        setLessons(loadedLessons);
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
   *
   * `silent` is the autosave path: it reports through `saveStatus` only, because
   * a toast on every pause in typing would be noise.
   */
  const save = useCallback(
    async (data: CourseFormData, { silent = false } = {}) => {
      if (!selectedAcademy) {
        if (!silent) toast.error(t('toasts.selectAcademyFirst'));
        return false;
      }
      if (savingRef.current) return false;

      if (data.published) {
        const problem = validateForPublish(seasons, lessons);
        if (problem) {
          if (!silent) toast.error(t(problem));
          return false;
        }
      }

      const payload = {
        title: data.title.trim(),
        description: data.description.trim(),
        primary_price: Number(data.primary_price),
        secondary_price: Number(data.secondary_price),
        category_id: data.category_id || undefined,
        cover_id: data.cover_id || undefined,
        published: data.published,
        is_featured: data.is_featured,
        // Untitled seasons are named rather than dropped: the backend skips a
        // season with no title, which silently orphans every lesson in it.
        seasons: seasons.map((s, i) => ({
          id: s.id,
          client_key: s.clientKey,
          title: s.title.trim() || t('courses.seasonNumber', { n: i + 1 })
        })),
        lessons: lessons
          .filter((l) => l.title.trim())
          .map((l) => ({
            id: l.id,
            client_key: l.clientKey,
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
      };

      // Nothing changed since the last successful save, so there is nothing to
      // send. This is what keeps autosave from firing a request per keystroke.
      const fingerprint = JSON.stringify(payload);
      const hasDeletes =
        deletedSeasonIds.length > 0 || deletedLessonIds.length > 0;
      if (!hasDeletes && fingerprint === lastSavedRef.current) {
        setSaveStatus('saved');
        if (!silent) toast.success(t('courses.updatedToast'));
        return true;
      }

      savingRef.current = true;
      setSaveStatus('saving');
      try {
        const response = await apiClient.updateCourseContent(courseId, payload);
        clearDeleted();
        lastSavedRef.current = fingerprint;

        // The backend never learns a draft's clientKey — it only echoes back
        // which real id it created for it. Without writing that id back here,
        // every season/lesson still missing one gets CREATED AGAIN on the
        // next save instead of updated, since nothing else links them.
        const saved = (
          response.data as {
            data?: {
              season_ids?: Record<string, string>;
              lesson_ids?: Record<string, string>;
            };
          }
        )?.data;
        if (saved?.season_ids) {
          const ids = saved.season_ids;
          setSeasons((prev) =>
            prev.map((s) =>
              ids[s.clientKey] ? { ...s, id: ids[s.clientKey] } : s
            )
          );
        }
        if (saved?.lesson_ids) {
          const ids = saved.lesson_ids;
          setLessons((prev) =>
            prev.map((l) =>
              ids[l.clientKey] ? { ...l, id: ids[l.clientKey] } : l
            )
          );
        }

        setSaveStatus('saved');
        // Autosave stays quiet (the status indicator is feedback enough); a
        // save the manager asked for always confirms itself.
        if (!silent) toast.success(t('courses.updatedToast'));
        return true;
      } catch (err) {
        setSaveStatus('error');
        if (!silent) ErrorHandler.handleApiError(err);
        return false;
      } finally {
        savingRef.current = false;
      }
    },
    [
      selectedAcademy,
      courseId,
      seasons,
      lessons,
      deletedSeasonIds,
      deletedLessonIds,
      clearDeleted,
      t
    ]
  );

  // ── Autosave ──────────────────────────────────────────────────────────────

  /**
   * Every edit lands on its own, so closing the tab mid-build can never lose
   * work. Incomplete forms are skipped quietly rather than shown as errors.
   */
  const autosaveRef = useRef<() => void>(() => {});
  const autosave = useDebouncedCallback(() => {
    // Edits made during a save would otherwise be dropped — wait it out.
    if (savingRef.current) {
      autosaveRef.current();
      return;
    }
    const values = form.getValues();
    if (!courseFormSchema.safeParse(values).success) return;
    void save(values, { silent: true });
  }, AUTOSAVE_DELAY_MS);
  autosaveRef.current = autosave;

  useEffect(() => {
    const subscription = form.watch((_values, { name }) => {
      // Publishing is deliberate: it saves through togglePublish, not silently.
      if (isLoading || name === 'published') return;
      autosave();
    });
    return () => subscription.unsubscribe();
  }, [form, autosave, isLoading]);

  const curriculumSettled = useRef(false);
  useEffect(() => {
    if (isLoading) return;
    // The first post-load commit is the loaded curriculum, not an edit.
    if (!curriculumSettled.current) {
      curriculumSettled.current = true;
      return;
    }
    autosave();
  }, [seasons, lessons, isLoading, autosave]);

  /**
   * The cover file already lives on the server, so persist it right away
   * instead of waiting for the debounce. Published state is untouched: an
   * upload never publishes a course and never unpublishes a live one.
   */
  const saveCover = useCallback(async () => {
    const values = form.getValues();
    if (!courseFormSchema.safeParse(values).success) return;
    await save(values, { silent: true });
  }, [form, save]);

  /**
   * Publishing changes what students see, so it never rides the silent
   * debounce: it saves immediately and speaks up on success or failure.
   */
  const togglePublish = useCallback(
    async (next: boolean) => {
      form.setValue('published', next);
      const saved = await save({ ...form.getValues(), published: next });
      // A rejected publish (incomplete curriculum, network error) must not
      // leave the switch claiming a state the server never accepted.
      if (!saved) form.setValue('published', !next);
    },
    [form, save]
  );

  const retrySave = useCallback(async () => {
    await save(form.getValues());
  }, [form, save]);

  /**
   * The explicit Save button. Autosave already covers the normal case, but a
   * manager should never have to trust an invisible mechanism: this validates,
   * saves immediately and confirms with a toast.
   */
  const saveNow = useCallback(async () => {
    const valid = await form.trigger();
    if (!valid) {
      toast.error(t('courses.fixErrorsBeforeSaving'));
      return false;
    }
    return save(form.getValues());
  }, [form, save, t]);

  return {
    form,
    isLoading,
    isSaving,
    saveStatus,
    ...curriculum,
    selectedAcademy,
    existingCoverUrl: existingCoverUrl.current,
    togglePublish,
    retrySave,
    saveNow,
    saveCover
  };
}
