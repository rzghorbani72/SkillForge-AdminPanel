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

// ─── Draft types ──────────────────────────────────────────────────────────────

export type LessonType =
  | 'VIDEO'
  | 'AUDIO'
  | 'TEXT'
  | 'QUIZ'
  | 'ASSIGNMENT'
  | 'LIVE';

export interface LessonDraft {
  id?: string;
  title: string;
  description: string;
  /** Lesson length as mm:ss (stored on the backend as whole seconds) */
  duration: string;
  lesson_type: LessonType;
  is_free: boolean;
  published: boolean;
  video_id?: string;
  audio_id?: string;
  cover_id?: string;
  document_id?: string;
  videoPreviewUrl?: string;
  audioPreviewUrl?: string;
  coverPreviewUrl?: string;
  documentPreviewName?: string;
  clientKey: string;
  /** clientKey of the SeasonDraft this lesson belongs to (undefined = unassigned) */
  seasonClientKey?: string;
}

export interface SeasonDraft {
  id?: string;
  title: string;
  description: string;
  clientKey: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

let _keyCounter = 0;
const newKey = () => `k-${++_keyCounter}`;

const DEFAULT_DURATION = '00:00';

/** mm:ss (or hh:mm:ss) → whole seconds. Bad input falls back to 0. */
export function durationToSeconds(value: string): number {
  const parts = value.split(':').map((p) => Number(p));
  if (parts.some((n) => Number.isNaN(n) || n < 0)) return 0;
  return parts.reduce((acc, n) => acc * 60 + n, 0);
}

/** Whole seconds → mm:ss (zero-padded). */
export function secondsToDuration(total?: number | null): string {
  if (!total || total < 0) return DEFAULT_DURATION;
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Pre-publish gate. Returns a translation key for the first problem found, or
 * null when the curriculum is publishable. Kept pure so it is unit-testable.
 */
export function validateForPublish(
  seasons: SeasonDraft[],
  lessons: LessonDraft[]
): string | null {
  if (seasons.some((s) => !s.title.trim())) {
    return 'courses.publishSeasonTitleRequired';
  }
  if (lessons.some((l) => !l.title.trim())) {
    return 'courses.publishLessonTitleRequired';
  }
  const hasEmptySeason = seasons.some(
    (s) => !lessons.some((l) => l.seasonClientKey === s.clientKey)
  );
  if (hasEmptySeason) return 'courses.publishEmptySeason';
  if (lessons.length === 0) return 'courses.publishNeedsLesson';
  return null;
}

export const emptyLesson = (seasonClientKey?: string): LessonDraft => ({
  title: '',
  description: '',
  duration: DEFAULT_DURATION,
  lesson_type: 'VIDEO',
  is_free: false,
  published: false,
  clientKey: newKey(),
  seasonClientKey
});

export const emptySeason = (): SeasonDraft => ({
  title: '',
  description: '',
  clientKey: newKey()
});

function extractId(resp: unknown): string | undefined {
  const r = resp as Record<string, unknown>;
  return (r?.data as any)?.data?.id ?? (r?.data as any)?.id ?? (r as any)?.id;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useCourseForm(courseId?: string) {
  const router = useRouter();
  const { t } = useTranslation();
  const { selectedAcademy } = useStore();
  const isEdit = courseId !== undefined;

  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState('');
  /** Create flow only: 1 = basic info, 2 = curriculum. Edit is always step 2. */
  const [step, setStep] = useState<1 | 2>(1);
  const [seasons, setSeasons] = useState<SeasonDraft[]>([]);
  const [lessons, setLessons] = useState<LessonDraft[]>([emptyLesson()]);
  const [deletedSeasonIds, setDeletedSeasonIds] = useState<string[]>([]);
  const [deletedLessonIds, setDeletedLessonIds] = useState<string[]>([]);
  const existingCoverUrl = useRef<string | null>(null);

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
    if (!isEdit) return;

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
  }, [courseId, isEdit]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Season mutations ──────────────────────────────────────────────────────

  const addSeason = useCallback(
    () => setSeasons((s) => [...s, emptySeason()]),
    []
  );

  const removeSeason = useCallback((key: string) => {
    setSeasons((prev) => {
      const toRemove = prev.find((x) => x.clientKey === key);
      if (toRemove?.id) {
        setDeletedSeasonIds((ids) => [...ids, toRemove.id!]);
      }
      return prev.filter((x) => x.clientKey !== key);
    });
    // Unassign lessons that belonged to this season (they stay in the course)
    setLessons((prev) =>
      prev.map((l) =>
        l.seasonClientKey === key ? { ...l, seasonClientKey: undefined } : l
      )
    );
  }, []);

  const updateSeason = useCallback(
    (key: string, patch: Partial<Pick<SeasonDraft, 'title' | 'description'>>) =>
      setSeasons((s) =>
        s.map((x) => (x.clientKey === key ? { ...x, ...patch } : x))
      ),
    []
  );

  const reorderSeasons = useCallback((from: number, to: number) => {
    setSeasons((s) => {
      const next = [...s];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }, []);

  // ── Lesson mutations ──────────────────────────────────────────────────────

  const addLesson = useCallback((seasonClientKey?: string) => {
    setLessons((prev) => [...prev, emptyLesson(seasonClientKey)]);
  }, []);

  const removeLesson = useCallback((lessonKey: string) => {
    setLessons((prev) => {
      const toRemove = prev.find((l) => l.clientKey === lessonKey);
      if (toRemove?.id) {
        setDeletedLessonIds((ids) => [...ids, toRemove.id!]);
      }
      return prev.filter((l) => l.clientKey !== lessonKey);
    });
  }, []);

  const updateLesson = useCallback(
    (lessonKey: string, patch: Partial<LessonDraft>) =>
      setLessons((prev) =>
        prev.map((l) => (l.clientKey === lessonKey ? { ...l, ...patch } : l))
      ),
    []
  );

  /** Assign or unassign a lesson to/from a season */
  const assignLesson = useCallback(
    (lessonKey: string, seasonClientKey: string | undefined) =>
      setLessons((prev) =>
        prev.map((l) =>
          l.clientKey === lessonKey ? { ...l, seasonClientKey } : l
        )
      ),
    []
  );

  /** Reorder lessons within a section (unassigned or a specific season) */
  const reorderLessons = useCallback(
    (sectionKey: string | undefined, from: number, to: number) => {
      setLessons((prev) => {
        const inSection = prev.filter((l) => l.seasonClientKey === sectionKey);
        if (from >= inSection.length || to >= inSection.length) return prev;

        const reordered = [...inSection];
        const [moved] = reordered.splice(from, 1);
        reordered.splice(to, 0, moved);

        // Rebuild full array: replace section slots in original order
        let sectionIdx = 0;
        return prev.map((l) =>
          l.seasonClientKey === sectionKey ? reordered[sectionIdx++] : l
        );
      });
    },
    []
  );

  // ── Create-flow steps ────────────────────────────────────────────────────

  /** Validate step 1 fields, then move to the curriculum step. */
  const goToCurriculumStep = useCallback(async () => {
    const valid = await form.trigger();
    if (valid) setStep(2);
  }, [form]);

  const goToBasicInfoStep = useCallback(() => setStep(1), []);

  // ── Save ──────────────────────────────────────────────────────────────────

  const save = useCallback(
    async (data: CourseFormData) => {
      if (!selectedAcademy) {
        toast.error('Select an academy first');
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
      try {
        // Create / update course
        const coursePayload = {
          title: data.title.trim(),
          description: data.description.trim(),
          primary_price: Number(data.primary_price),
          secondary_price: Number(data.secondary_price),
          category_id: data.category_id || undefined,
          cover_id: data.cover_id || undefined,
          published: data.published,
          is_featured: data.is_featured
        };

        let courseDbId: string;
        if (isEdit) {
          // One atomic save: course + every season/lesson + deletes in a single
          // backend transaction. No more half-saved course on a mid-save error.
          setSaveProgress('Saving course…');
          await apiClient.updateCourseContent(courseId!, {
            ...coursePayload,
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
          courseDbId = courseId!;
          setDeletedLessonIds([]);
          setDeletedSeasonIds([]);
        } else {
          // Create: send everything in one atomic request
          setSaveProgress('Creating course…');
          const seasonsPayload = seasons
            .filter((s) => s.title.trim())
            .map((s) => ({
              title: s.title.trim(),
              description: s.description.trim() || undefined,
              lessons: lessons
                .filter(
                  (l) => l.seasonClientKey === s.clientKey && l.title.trim()
                )
                .map((l) => ({
                  title: l.title.trim(),
                  description: l.description.trim() || undefined,
                  duration: durationToSeconds(l.duration),
                  lesson_type: l.lesson_type,
                  is_free: l.is_free,
                  published: l.published,
                  video_id: l.video_id,
                  audio_id: l.audio_id,
                  cover_id: l.cover_id,
                  document_id: l.document_id
                }))
            }));

          // Lessons not attached to any season — sent top-level so they are
          // persisted unassigned instead of being silently dropped.
          const unassignedLessons = lessons
            .filter((l) => !l.seasonClientKey && l.title.trim())
            .map((l) => ({
              title: l.title.trim(),
              description: l.description.trim() || undefined,
              duration: durationToSeconds(l.duration),
              lesson_type: l.lesson_type,
              is_free: l.is_free,
              published: l.published,
              video_id: l.video_id,
              audio_id: l.audio_id,
              cover_id: l.cover_id,
              document_id: l.document_id
            }));

          const resp = await apiClient.createCourse({
            ...coursePayload,
            seasons: seasonsPayload.length > 0 ? seasonsPayload : undefined,
            lessons:
              unassignedLessons.length > 0 ? unassignedLessons : undefined
          });
          const id = extractId(resp);
          if (!id) throw new Error('Course creation returned no id');
          courseDbId = id;
        }

        toast.success(isEdit ? 'Course updated' : 'Course created');
        // Course + curriculum are already saved atomically at this point, so
        // both flows land on the plain detail view — never back on a form
        // pre-filled with what was just submitted.
        router.push(`/courses/${courseDbId}`);
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
      isEdit,
      courseId,
      seasons,
      lessons,
      deletedSeasonIds,
      deletedLessonIds,
      router,
      t
    ]
  );

  return {
    form,
    isLoading,
    isSaving,
    saveProgress,
    step,
    goToCurriculumStep,
    goToBasicInfoStep,
    seasons,
    lessons,
    isEdit,
    selectedAcademy,
    existingCoverUrl: existingCoverUrl.current,
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
  };
}
