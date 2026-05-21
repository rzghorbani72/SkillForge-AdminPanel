'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useStore } from '@/hooks/useStore';
import { toast } from 'sonner';
import type { Season, Lesson } from '@/types/api';
import { courseFormSchema, type CourseFormData } from './schema';

// ─── Draft types ──────────────────────────────────────────────────────────────

export interface LessonDraft {
  id?: number;
  title: string;
  description: string;
  is_free: boolean;
  published: boolean;
  video_id?: number;
  audio_id?: number;
  cover_id?: number;
  videoPreviewUrl?: string;
  audioPreviewUrl?: string;
  coverPreviewUrl?: string;
  clientKey: string;
  /** clientKey of the SeasonDraft this lesson belongs to (undefined = unassigned) */
  seasonClientKey?: string;
}

export interface SeasonDraft {
  id?: number;
  title: string;
  description: string;
  clientKey: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

let _keyCounter = 0;
const newKey = () => `k-${++_keyCounter}`;

export const emptyLesson = (seasonClientKey?: string): LessonDraft => ({
  title: '',
  description: '',
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

function extractId(resp: unknown): number | undefined {
  const r = resp as Record<string, unknown>;
  return (r?.data as any)?.data?.id ?? (r?.data as any)?.id ?? (r as any)?.id;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useCourseForm(courseId?: number) {
  const router = useRouter();
  const { selectedAcademy } = useStore();
  const isEdit = courseId !== undefined;

  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState('');
  const [seasons, setSeasons] = useState<SeasonDraft[]>([]);
  const [lessons, setLessons] = useState<LessonDraft[]>([emptyLesson()]);
  const [deletedSeasonIds, setDeletedSeasonIds] = useState<number[]>([]);
  const [deletedLessonIds, setDeletedLessonIds] = useState<number[]>([]);
  const existingCoverUrl = useRef<string | null>(null);

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
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

        existingCoverUrl.current = course.cover?.publicUrl ?? null;

        form.reset({
          title: course.title ?? '',
          description: course.description ?? '',
          primary_price: Math.trunc(course.price ?? 0).toString(),
          secondary_price: Math.trunc(course.original_price ?? 0).toString(),
          category_id: course.category_id?.toString() ?? '',
          cover_id: course.cover?.id?.toString() ?? '',
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
        const seasonDbIdToClientKey = new Map<number, string>(
          loadedSeasons.map((s) => [s.id!, s.clientKey])
        );

        const loadedLessons: LessonDraft[] = (rawLessons as Lesson[]).map(
          (l) => ({
            id: l.id,
            title: l.title,
            description: l.description ?? '',
            is_free: l.is_free,
            published: l.is_published,
            video_id: l.video_id,
            cover_id: l.image_id,
            videoPreviewUrl: l.video?.publicUrl,
            coverPreviewUrl: l.image?.publicUrl,
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

  // ── Save ──────────────────────────────────────────────────────────────────

  const save = useCallback(
    async (data: CourseFormData) => {
      if (!selectedAcademy) {
        toast.error('Select an academy first');
        return;
      }
      if (isSaving) return;

      setIsSaving(true);
      try {
        // 1. Flush pending deletes
        if (
          isEdit &&
          (deletedLessonIds.length > 0 || deletedSeasonIds.length > 0)
        ) {
          setSaveProgress('Removing deleted items…');
          await Promise.allSettled([
            ...deletedLessonIds.map((id) => apiClient.deleteLesson(id)),
            ...deletedSeasonIds.map((id) => apiClient.deleteSeason(id))
          ]);
          setDeletedLessonIds([]);
          setDeletedSeasonIds([]);
        }

        // 2. Create / update course
        const coursePayload = {
          title: data.title.trim(),
          description: data.description.trim(),
          primary_price: Number(data.primary_price),
          secondary_price: Number(data.secondary_price),
          category_id: data.category_id ? Number(data.category_id) : undefined,
          cover_id: data.cover_id ? Number(data.cover_id) : undefined,
          published: data.published,
          is_featured: data.is_featured
        };

        let courseDbId: number;
        if (isEdit) {
          setSaveProgress('Updating course…');
          await apiClient.updateCourse(courseId, coursePayload);
          courseDbId = courseId;

          // 3. Upsert seasons — build clientKey → dbId map
          const seasonIdMap = new Map<string, number>();
          for (let si = 0; si < seasons.length; si++) {
            const s = seasons[si];
            if (!s.title.trim()) continue;
            setSaveProgress(`Saving season ${si + 1}…`);
            let dbId = s.id;
            if (dbId) {
              await apiClient.updateSeason(dbId, {
                title: s.title.trim(),
                description: s.description.trim() || undefined
              });
            } else {
              const resp = await apiClient.createSeason({
                title: s.title.trim(),
                description: s.description.trim() || undefined,
                order: si + 1,
                course_id: courseDbId
              });
              dbId = extractId(resp);
            }
            if (dbId) seasonIdMap.set(s.clientKey, dbId);
          }

          // 4. Upsert lessons
          for (let li = 0; li < lessons.length; li++) {
            const l = lessons[li];
            if (!l.title.trim()) continue;
            setSaveProgress(`Saving lesson ${li + 1}…`);

            const season_id = l.seasonClientKey
              ? (seasonIdMap.get(l.seasonClientKey) ?? null)
              : null;
            const media = {
              video_id: l.video_id,
              audio_id: l.audio_id,
              cover_id: l.cover_id
            };

            if (l.id) {
              await apiClient.updateLesson(l.id, {
                title: l.title.trim(),
                description: l.description.trim() || undefined,
                is_free: l.is_free,
                published: l.published,
                season_id,
                ...media
              });
            } else {
              await apiClient.createLesson({
                title: l.title.trim(),
                description: l.description.trim() || undefined,
                course_id: courseDbId,
                season_id: season_id ?? undefined,
                is_free: l.is_free,
                published: l.published,
                ...media
              });
            }
          }
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
                  is_free: l.is_free,
                  published: l.published,
                  video_id: l.video_id,
                  audio_id: l.audio_id,
                  cover_id: l.cover_id
                }))
            }));

          const resp = await apiClient.createCourse({
            ...coursePayload,
            seasons: seasonsPayload.length > 0 ? seasonsPayload : undefined
          });
          const id = extractId(resp);
          if (!id) throw new Error('Course creation returned no id');
          courseDbId = id;
        }

        toast.success(isEdit ? 'Course updated' : 'Course created');
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
      router
    ]
  );

  return {
    form,
    isLoading,
    isSaving,
    saveProgress,
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
