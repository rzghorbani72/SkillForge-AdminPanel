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
  prepareCurriculumForSave,
  secondsToDuration,
  validateForPublish,
  type CourseType,
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
  // A live course promises a timetable, not lessons: the publish rules differ.
  const [courseType, setCourseType] = useState<CourseType>('OFFLINE');
  const router = useRouter();
  const { t } = useTranslation();
  const { selectedAcademy } = useStore();

  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const isSaving = saveStatus === 'saving';
  const savingRef = useRef(false);
  // Fingerprint of the last payload the server accepted — see `save`.
  const lastSavedRef = useRef<string | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
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
      secondary_price: '',
      meta_title: '',
      meta_description: '',
      keywords: [],
      category_id: '',
      cover_id: '',
      published: false,
      is_featured: false,
      base_price_active: true,
      allow_downloads: false,
      apply_downloads_to_lessons: false
    }
  });

  const buildPayload = useCallback(
    (
      data: CourseFormData,
      seasonList: SeasonDraft[],
      lessonList: LessonDraft[],
      removedSeasonIds: string[],
      removedLessonIds: string[]
    ) => {
      const curriculum = prepareCurriculumForSave(
        seasonList,
        lessonList,
        removedSeasonIds
      );
      const coverId = data.cover_id?.trim();
      // Undefined keys are dropped from the JSON body, and every course field
      // on the server is optional — so omitting them leaves them untouched.
      return {
        title: data.title.trim(),
        description: data.description.trim(),
        meta_title: data.meta_title.trim(),
        meta_description: data.meta_description.trim(),
        keywords: data.keywords,
        primary_price: Number(data.primary_price),
        secondary_price: Number(data.secondary_price) || 0,
        category_id: data.category_id || undefined,
        cover_id: coverId ? coverId : null,
        published: data.published,
        is_featured: data.is_featured,
        base_price_active: data.base_price_active,
        allow_downloads: data.allow_downloads,
        apply_downloads_to_lessons:
          data.apply_downloads_to_lessons || undefined,
        seasons: curriculum.seasons.map((s, i) => ({
          id: s.id,
          client_key: s.clientKey,
          title: s.title.trim() || t('courses.seasonNumber', { n: i + 1 })
        })),
        lessons: curriculum.lessons.map((l) => ({
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
          curriculum.deletedSeasonIds.length > 0
            ? curriculum.deletedSeasonIds
            : undefined,
        deleted_lesson_ids:
          removedLessonIds.length > 0 ? removedLessonIds : undefined
      };
    },
    [t]
  );

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

        const lessonList = rawLessons as Lesson[];
        const courseAllowsDownloads = course.allow_downloads ?? false;
        // Ticked when every lesson already follows the course switch, so the
        // box shows the real state after a reload instead of always resetting.
        const lessonsFollowCourse =
          lessonList.length > 0 &&
          lessonList.every(
            (l) =>
              (l.allow_download_enrollment ?? false) ===
                courseAllowsDownloads &&
              (l.allow_download_subscription ?? false) ===
                courseAllowsDownloads &&
              (l.allow_download_tutoring ?? false) === courseAllowsDownloads
          );

        setCourseType(
          ((course as { course_type?: CourseType }).course_type ??
            'OFFLINE') as CourseType
        );
        const cover = (course as any).Image ?? course.cover;
        const categoryId =
          (course as any).Category?.id ?? course.category?.id ?? '';
        setCoverPreviewUrl(cover?.publicUrl ?? null);

        const loadedForm: CourseFormData = {
          title: course.title ?? '',
          description: course.description ?? '',
          meta_title: course.meta_title ?? '',
          meta_description: course.meta_description ?? '',
          keywords: course.keywords ?? [],
          primary_price: Math.trunc(course.price ?? 0).toString(),
          secondary_price: course.original_price
            ? Math.trunc(course.original_price).toString()
            : '',
          category_id: categoryId,
          cover_id: cover?.id ?? '',
          published: course.is_published ?? false,
          is_featured: course.is_featured ?? false,
          base_price_active: course.base_price_active ?? true,
          allow_downloads: courseAllowsDownloads,
          apply_downloads_to_lessons: lessonsFollowCourse
        };
        form.reset(loadedForm);

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

        const loadedLessons: LessonDraft[] = lessonList.map((l) => ({
          id: l.id,
          title: l.title,
          description: l.description ?? '',
          // The file's own stored length wins whenever the lesson never got
          // one, so an old row shows the truth without re-measuring anything.
          duration: secondsToDuration(
            l.duration || l.Video?.duration || l.Audio?.duration
          ),
          lesson_type: l.lesson_type ?? 'VIDEO',
          is_free: l.is_free,
          published: l.is_published,
          video_id: l.video_id,
          audio_id: l.audio_id,
          cover_id: l.image_id,
          document_id: l.document_id,
          videoPreviewUrl:
            l.Video?.publicUrl ??
            (l.video_id ? apiClient.getVideoStreamUrl(l.video_id) : undefined),
          audioPreviewUrl: l.Audio?.publicUrl,
          coverPreviewUrl: l.Image?.publicUrl,
          documentPreviewName: l.Document?.title ?? undefined,
          clientKey: newKey(),
          seasonClientKey:
            (l.season_id != null
              ? seasonDbIdToClientKey.get(l.season_id)
              : undefined) ?? defaultSeasonKey
        }));

        setSeasons(loadedSeasons);
        setLessons(loadedLessons);
        lastSavedRef.current = JSON.stringify(
          buildPayload(loadedForm, loadedSeasons, loadedLessons, [], [])
        );
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
      // Lock immediately so a second autosave/manual save cannot race past the
      // fingerprint check and double-create seasons/lessons (409 duplicate).
      if (savingRef.current) return false;
      savingRef.current = true;

      if (data.published) {
        const problem = validateForPublish(seasons, lessons, courseType);
        if (problem) {
          savingRef.current = false;
          if (!silent) toast.error(t(problem));
          return false;
        }
      }

      const payload = buildPayload(
        data,
        seasons,
        lessons,
        deletedSeasonIds,
        deletedLessonIds
      );

      // Nothing changed since the last successful save, so there is nothing to
      // send. This is what keeps autosave from firing a request per keystroke.
      const fingerprint = JSON.stringify(payload);
      const hasDeletes =
        (payload.deleted_season_ids?.length ?? 0) > 0 ||
        (payload.deleted_lesson_ids?.length ?? 0) > 0;
      if (!hasDeletes && fingerprint === lastSavedRef.current) {
        savingRef.current = false;
        setSaveStatus('saved');
        if (!silent) toast.success(t('courses.updatedToast'));
        return true;
      }

      setSaveStatus('saving');
      try {
        const response = await apiClient.updateCourseContent(courseId, payload);
        clearDeleted();

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

        const seasonIds = saved?.season_ids;
        const lessonIds = saved?.lesson_ids;
        const seasonKeysWithLessons = new Set(
          payload.lessons
            .map((l) => l.season_client_key)
            .filter((key): key is string => !!key)
        );
        setSeasons((prev) => {
          const withIds = seasonIds
            ? prev.map((s) =>
                seasonIds[s.clientKey]
                  ? { ...s, id: seasonIds[s.clientKey] }
                  : s
              )
            : prev;
          const next = withIds.map((s) =>
            seasonKeysWithLessons.has(s.clientKey) ? s : { ...s, id: undefined }
          );
          return next.length > 0 ? next : [emptySeason()];
        });
        if (lessonIds) {
          setLessons((prev) =>
            prev.map((l) =>
              lessonIds[l.clientKey] ? { ...l, id: lessonIds[l.clientKey] } : l
            )
          );
        }

        // Fingerprint must include the ids we just received, otherwise the next
        // autosave looks "changed" only because ids appeared and re-POSTs creates.
        lastSavedRef.current = JSON.stringify({
          ...payload,
          seasons: payload.seasons.map((s) => ({
            ...s,
            id: s.id ?? seasonIds?.[s.client_key]
          })),
          lessons: payload.lessons.map((l) => ({
            ...l,
            id: l.id ?? lessonIds?.[l.client_key]
          }))
        });

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
      courseType,
      seasons,
      lessons,
      deletedSeasonIds,
      deletedLessonIds,
      clearDeleted,
      buildPayload,
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
    // A half-filled form cannot be saved yet, so show what is missing instead
    // of dropping the new cover without a word.
    if (!courseFormSchema.safeParse(values).success) {
      void form.trigger();
      return;
    }
    await save(values, { silent: true });
  }, [form, save]);

  const handleCoverImageChange = useCallback(
    (image: { id: string; url: string }) => {
      if (image.id) {
        form.setValue('cover_id', image.id, {
          shouldDirty: true,
          shouldTouch: true
        });
        setCoverPreviewUrl(image.url || null);
      } else {
        form.setValue('cover_id', '', { shouldDirty: true, shouldTouch: true });
        setCoverPreviewUrl(null);
      }
      void saveCover();
    },
    [form, saveCover]
  );

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

  /**
   * Save and exit to the courses list — used by the explicit Save button.
   */
  const saveAndExit = useCallback(async () => {
    const saved = await saveNow();
    if (saved) {
      router.push('/courses');
    }
  }, [saveNow, router]);

  return {
    form,
    courseType,
    isLoading,
    isSaving,
    saveStatus,
    ...curriculum,
    selectedAcademy,
    coverPreviewUrl,
    handleCoverImageChange,
    togglePublish,
    retrySave,
    saveNow,
    saveAndExit,
    saveCover
  };
}
