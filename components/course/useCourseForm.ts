'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useStore } from '@/hooks/useStore';
import { useImageUpload } from '@/hooks/useImageUpload';
import { toast } from 'sonner';
import type { Season, Lesson } from '@/types/api';
import { courseFormSchema, type CourseFormData } from './schema';

// ─── Local draft types ────────────────────────────────────────────────────────

export interface LessonDraft {
  /** undefined = not yet saved to backend */
  id?: number;
  title: string;
  description: string;
  is_free: boolean;
  published: boolean;
  /** Uploaded video id */
  video_id?: number;
  /** Uploaded cover image id */
  cover_id?: number;
  /** Preview URLs — UI only, not sent to backend */
  videoPreviewUrl?: string;
  coverPreviewUrl?: string;
  /** UI-only sort key */
  clientKey: string;
}

export interface SeasonDraft {
  id?: number;
  title: string;
  description: string;
  lessons: LessonDraft[];
  clientKey: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

let _keyCounter = 0;
const newKey = () => `k-${++_keyCounter}`;

export const emptyLesson = (): LessonDraft => ({
  title: '',
  description: '',
  is_free: false,
  published: false,
  clientKey: newKey()
});

export const emptySeason = (): SeasonDraft => ({
  title: '',
  description: '',
  lessons: [emptyLesson()],
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
  const [seasons, setSeasons] = useState<SeasonDraft[]>([emptySeason()]);
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

  const coverUpload = useImageUpload({
    onSuccess: (img) => form.setValue('cover_id', img.id.toString())
  });

  // ── Load existing course for edit ─────────────────────────────────────────
  useEffect(() => {
    if (!isEdit) return;

    (async () => {
      setIsLoading(true);
      try {
        const [course, rawSeasons] = await Promise.all([
          apiClient.getCourse(courseId),
          apiClient.getSeasons(courseId)
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
            clientKey: newKey(),
            lessons: (s.lessons ?? []).map((l: Lesson) => ({
              id: l.id,
              title: l.title,
              description: l.description ?? '',
              is_free: l.is_free,
              published: l.is_published,
              video_id: l.video_id,
              cover_id: l.image_id,
              videoPreviewUrl: l.video?.publicUrl,
              coverPreviewUrl: l.image?.publicUrl,
              clientKey: newKey()
            }))
          })
        );

        setSeasons(loadedSeasons.length > 0 ? loadedSeasons : [emptySeason()]);
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

  const removeSeason = useCallback(
    (key: string) => setSeasons((s) => s.filter((x) => x.clientKey !== key)),
    []
  );

  const updateSeason = useCallback(
    (key: string, patch: Partial<Pick<SeasonDraft, 'title' | 'description'>>) =>
      setSeasons((s) =>
        s.map((x) => (x.clientKey === key ? { ...x, ...patch } : x))
      ),
    []
  );

  const reorderSeasons = useCallback(
    (from: number, to: number) =>
      setSeasons((s) => {
        const next = [...s];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        return next;
      }),
    []
  );

  // ── Lesson mutations ──────────────────────────────────────────────────────

  const addLesson = useCallback(
    (seasonKey: string) =>
      setSeasons((s) =>
        s.map((x) =>
          x.clientKey === seasonKey
            ? { ...x, lessons: [...x.lessons, emptyLesson()] }
            : x
        )
      ),
    []
  );

  const removeLesson = useCallback(
    (seasonKey: string, lessonKey: string) =>
      setSeasons((s) =>
        s.map((x) =>
          x.clientKey !== seasonKey
            ? x
            : {
                ...x,
                lessons: x.lessons.filter((l) => l.clientKey !== lessonKey)
              }
        )
      ),
    []
  );

  const updateLesson = useCallback(
    (seasonKey: string, lessonKey: string, patch: Partial<LessonDraft>) =>
      setSeasons((s) =>
        s.map((x) =>
          x.clientKey !== seasonKey
            ? x
            : {
                ...x,
                lessons: x.lessons.map((l) =>
                  l.clientKey === lessonKey ? { ...l, ...patch } : l
                )
              }
        )
      ),
    []
  );

  const reorderLessons = useCallback(
    (seasonKey: string, from: number, to: number) =>
      setSeasons((s) =>
        s.map((x) => {
          if (x.clientKey !== seasonKey) return x;
          const next = [...x.lessons];
          const [moved] = next.splice(from, 1);
          next.splice(to, 0, moved);
          return { ...x, lessons: next };
        })
      ),
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
        const primaryPrice = Number(data.primary_price);
        const secondaryPrice = Number(data.secondary_price);

        const coursePayload = {
          title: data.title.trim(),
          description: data.description.trim(),
          primary_price: primaryPrice,
          secondary_price: secondaryPrice,
          meta_tags: [],
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
        } else {
          setSaveProgress('Creating course…');
          const resp = await apiClient.createCourse(coursePayload);
          const id = extractId(resp);
          if (!id) throw new Error('Course creation returned no id');
          courseDbId = id;
        }

        // Seasons & lessons: optimistic sequential upsert
        for (let si = 0; si < seasons.length; si++) {
          const s = seasons[si];
          if (!s.title.trim()) continue;

          setSaveProgress(`Saving season ${si + 1}…`);

          let seasonDbId = s.id;
          if (seasonDbId) {
            await apiClient.updateSeason(seasonDbId, {
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
            seasonDbId = extractId(resp);
          }
          if (!seasonDbId) continue;

          for (let li = 0; li < s.lessons.length; li++) {
            const l = s.lessons[li];
            if (!l.title.trim()) continue;

            setSaveProgress(`Season ${si + 1} › lesson ${li + 1}…`);

            const lessonMediaPayload = {
              video_id: l.video_id,
              cover_id: l.cover_id
            };

            if (l.id) {
              await apiClient.updateLesson(l.id, {
                title: l.title.trim(),
                description: l.description.trim() || undefined,
                is_free: l.is_free,
                published: l.published,
                ...lessonMediaPayload
              });
            } else {
              await apiClient.createLesson({
                title: l.title.trim(),
                description: l.description.trim() || undefined,
                season_id: seasonDbId,
                is_free: l.is_free,
                published: l.published,
                ...lessonMediaPayload
              });
            }
          }
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
    [selectedAcademy, isSaving, isEdit, courseId, seasons, router]
  );

  return {
    form,
    isLoading,
    isSaving,
    saveProgress,
    seasons,
    isEdit,
    selectedAcademy,
    coverUpload,
    existingCoverUrl: existingCoverUrl.current,
    // season/lesson mutations
    addSeason,
    removeSeason,
    updateSeason,
    reorderSeasons,
    addLesson,
    removeLesson,
    updateLesson,
    reorderLessons,
    save
  };
}
