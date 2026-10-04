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
import { courseFormSchema, parseCourseDifficulty, type CourseFormData } from './schema';
import {
  durationToSeconds,
  emptySeason,
  newKey,
  secondsToDuration,
  type CourseType,
  type LessonDraft,
  type SeasonDraft,
} from './course-drafts';
import { useCurriculumDraft } from './useCurriculumDraft';
import { useDebouncedCallback } from '@/hooks/use-debounced-callback';
import { useCourseSave } from './use-course-form/use-course-save';
import { useCourseCover } from './use-course-form/use-course-cover';
import { SaveStatus } from './_lib/useCourseForm-helpers';

// Autosave is a safety net, not a keystroke logger: it waits for a real pause
// in typing, and an unchanged payload is never sent at all (see lastSavedRef).
const AUTOSAVE_DELAY_MS = 5000;

export type { LessonDraft, LessonType, SeasonDraft } from './course-drafts';
export { durationToSeconds, secondsToDuration };

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
    clearDeleted,
  } = curriculum;

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: {
      title: '',
      description: '',
      learning_outcomes: '',
      requirements: '',
      difficulty: 'BEGINNER',
      is_certificate: false,
      certificate_rule: 'ALL_QUIZZES',
      access_duration_days: '',
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
      apply_downloads_to_lessons: false,
    },
  });

  const { buildPayload, save } = useCourseSave({
    clearDeleted,
    courseId,
    courseType,
    deletedLessonIds,
    deletedSeasonIds,
    lastSavedRef,
    lessons,
    savingRef,
    seasons,
    selectedAcademy,
    setLessons,
    setSaveStatus,
    setSeasons,
  });

  // ── Load existing course for edit ─────────────────────────────────────────

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const [course, rawSeasons, rawLessons] = await Promise.all([
          apiClient.getCourse(courseId),
          apiClient.getSeasons(courseId),
          apiClient.getLessons({ course_id: courseId }),
        ]);

        const lessonList = rawLessons as Lesson[];
        const courseAllowsDownloads = course.allow_downloads ?? false;
        // Ticked when every lesson already follows the course switch, so the
        // box shows the real state after a reload instead of always resetting.
        const lessonsFollowCourse =
          lessonList.length > 0 &&
          lessonList.every(
            (l) =>
              (l.allow_download_enrollment ?? false) === courseAllowsDownloads &&
              (l.allow_download_subscription ?? false) === courseAllowsDownloads &&
              (l.allow_download_tutoring ?? false) === courseAllowsDownloads,
          );

        setCourseType(
          ((course as { course_type?: CourseType }).course_type ?? 'OFFLINE') as CourseType,
        );
        const cover = (course as any).Image ?? course.cover;
        const categoryId = (course as any).Category?.id ?? course.category?.id ?? '';
        setCoverPreviewUrl(cover?.publicUrl ?? null);

        const loadedForm: CourseFormData = {
          title: course.title ?? '',
          description: course.description ?? '',
          learning_outcomes: course.learning_outcomes ?? '',
          requirements: course.requirements ?? '',
          difficulty: parseCourseDifficulty(course.difficulty),
          is_certificate: course.is_certificate ?? false,
          certificate_rule: course.certificate_rule ?? 'ALL_QUIZZES',
          access_duration_days:
            course.access_duration_days != null ? String(course.access_duration_days) : '',
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
          apply_downloads_to_lessons: lessonsFollowCourse,
        };
        form.reset(loadedForm);

        const loadedSeasons: SeasonDraft[] = (rawSeasons as Season[]).map((s) => ({
          id: s.id,
          title: s.title,
          clientKey: newKey(),
        }));
        // Lessons are only ever rendered inside a season, so there must always
        // be one to hold them.
        if (loadedSeasons.length === 0) loadedSeasons.push(emptySeason());
        const defaultSeasonKey = loadedSeasons[0].clientKey;

        // Map season DB id → clientKey so lessons can reference their season
        const seasonDbIdToClientKey = new Map<string, string>(
          loadedSeasons.map((s) => [s.id!, s.clientKey]),
        );

        const loadedLessons: LessonDraft[] = lessonList.map((l) => ({
          id: l.id,
          title: l.title,
          description: l.description ?? '',
          // The file's own stored length wins whenever the lesson never got
          // one, so an old row shows the truth without re-measuring anything.
          duration: secondsToDuration(l.duration || l.Video?.duration || l.Audio?.duration),
          lesson_type: l.lesson_type ?? 'VIDEO',
          is_free: l.is_free,
          published: l.is_published,
          video_id: l.video_id,
          audio_id: l.audio_id,
          cover_id: l.image_id,
          document_id: l.document_id,
          // One switch stands for the four per-route flags. The lesson settings
          // page still edits them individually when a course needs that.
          allow_download: Boolean(
            l.allow_download_enrollment ||
              l.allow_download_subscription ||
              l.allow_download_tutoring ||
              l.allow_download_free,
          ),
          videoHlsStatus: l.Video?.hls_status,
          videoPreviewUrl:
            l.Video?.publicUrl ??
            (l.video_id ? apiClient.getVideoStreamUrl(l.video_id) : undefined),
          audioPreviewUrl: l.Audio?.publicUrl,
          coverPreviewUrl: l.Image?.publicUrl,
          documentPreviewName: l.Document?.title ?? undefined,
          clientKey: newKey(),
          seasonClientKey:
            (l.season_id != null ? seasonDbIdToClientKey.get(l.season_id) : undefined) ??
            defaultSeasonKey,
        }));

        setSeasons(loadedSeasons);
        setLessons(loadedLessons);
        lastSavedRef.current = JSON.stringify(
          buildPayload(loadedForm, loadedSeasons, loadedLessons, [], []),
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
  const { handleCoverImageChange, saveCover } = useCourseCover({ form, save, setCoverPreviewUrl });

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
    [form, save],
  );

  const retrySave = useCallback(async () => {
    await save(form.getValues());
  }, [form, save]);

  /**
   * The explicit Save button. Autosave already covers the normal case, but a
   * manager should never have to trust an invisible mechanism: this validates
   * and saves immediately. A validation or network failure still surfaces as a
   * toast (and a 401 still redirects to login) — `silentSuccess` only drops the
   * confirmation toast, for callers that already show their own, like the
   * wizard header's Save button flashing "ذخیره شد" on its own.
   */
  const saveNow = useCallback(
    async (options?: { silentSuccess?: boolean }) => {
      const valid = await form.trigger();
      if (!valid) {
        toast.error(t('courses.fixErrorsBeforeSaving'));
        return false;
      }
      return save(form.getValues(), {
        silentSuccess: options?.silentSuccess,
      });
    },
    [form, save, t],
  );

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
    saveCover,
  };
}
export type { SaveStatus } from './_lib/useCourseForm-helpers';
