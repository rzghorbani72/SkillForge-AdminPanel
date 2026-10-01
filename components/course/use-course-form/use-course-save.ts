'use client';

import { useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { toast } from 'react-toastify';
import { useTranslation } from '@/lib/i18n/hooks';
import { parseAccessDurationDays, type CourseFormData } from '../schema';
import {
  durationToSeconds,
  emptySeason,
  prepareCurriculumForSave,
  validateForPublish,
  type CourseType,
  type LessonDraft,
  type SeasonDraft,
} from '../course-drafts';
import type { Dispatch, SetStateAction, RefObject } from 'react';
import { SaveStatus } from '../_lib/useCourseForm-helpers';
import { Academy } from '@/types/api';

export function useCourseSave({
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
}: {
  clearDeleted: () => void;
  courseId: string;
  courseType: CourseType;
  deletedLessonIds: string[];
  deletedSeasonIds: string[];
  lastSavedRef: RefObject<string | null>;
  lessons: LessonDraft[];
  savingRef: RefObject<boolean>;
  seasons: SeasonDraft[];
  selectedAcademy: Academy | null;
  setLessons: Dispatch<SetStateAction<LessonDraft[]>>;
  setSaveStatus: Dispatch<SetStateAction<SaveStatus>>;
  setSeasons: Dispatch<SetStateAction<SeasonDraft[]>>;
}) {
  const { t } = useTranslation();
  const buildPayload = useCallback(
    (
      data: CourseFormData,
      seasonList: SeasonDraft[],
      lessonList: LessonDraft[],
      removedSeasonIds: string[],
      removedLessonIds: string[],
    ) => {
      const curriculum = prepareCurriculumForSave(seasonList, lessonList, removedSeasonIds);
      const coverId = data.cover_id?.trim();
      // Undefined keys are dropped from the JSON body, and every course field
      // on the server is optional — so omitting them leaves them untouched.
      return {
        title: data.title.trim(),
        description: data.description.trim(),
        learning_outcomes: (data.learning_outcomes ?? '').trim(),
        requirements: (data.requirements ?? '').trim(),
        difficulty: data.difficulty,
        is_certificate: data.is_certificate,
        certificate_rule: data.certificate_rule,
        access_duration_days: parseAccessDurationDays(data.access_duration_days),
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
        apply_downloads_to_lessons: data.apply_downloads_to_lessons || undefined,
        seasons: curriculum.seasons.map((s, i) => ({
          id: s.id,
          client_key: s.clientKey,
          title: s.title.trim() || t('courses.seasonNumber', { n: i + 1 }),
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
          // Omitted unless the manager touched this lesson's switch in this
          // session — see LessonDraft.allowDownloadTouched.
          allow_download: l.allowDownloadTouched ? l.allow_download : undefined,
          season_client_key: l.seasonClientKey,
        })),
        deleted_season_ids:
          curriculum.deletedSeasonIds.length > 0 ? curriculum.deletedSeasonIds : undefined,
        deleted_lesson_ids: removedLessonIds.length > 0 ? removedLessonIds : undefined,
      };
    },
    [t],
  );

  const save = useCallback(
    async (data: CourseFormData, { silent = false, silentSuccess = false } = {}) => {
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

      const payload = buildPayload(data, seasons, lessons, deletedSeasonIds, deletedLessonIds);

      // Nothing changed since the last successful save, so there is nothing to
      // send. This is what keeps autosave from firing a request per keystroke.
      const fingerprint = JSON.stringify(payload);
      const hasDeletes =
        (payload.deleted_season_ids?.length ?? 0) > 0 ||
        (payload.deleted_lesson_ids?.length ?? 0) > 0;
      if (!hasDeletes && fingerprint === lastSavedRef.current) {
        savingRef.current = false;
        setSaveStatus('saved');
        if (!silent && !silentSuccess) toast.success(t('courses.updatedToast'));
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
          payload.lessons.map((l) => l.season_client_key).filter((key): key is string => !!key),
        );
        setSeasons((prev) => {
          const withIds = seasonIds
            ? prev.map((s) => (seasonIds[s.clientKey] ? { ...s, id: seasonIds[s.clientKey] } : s))
            : prev;
          const next = withIds.map((s) =>
            seasonKeysWithLessons.has(s.clientKey) ? s : { ...s, id: undefined },
          );
          return next.length > 0 ? next : [emptySeason()];
        });
        if (lessonIds) {
          setLessons((prev) =>
            prev.map((l) => (lessonIds[l.clientKey] ? { ...l, id: lessonIds[l.clientKey] } : l)),
          );
        }

        // Fingerprint must include the ids we just received, otherwise the next
        // autosave looks "changed" only because ids appeared and re-POSTs creates.
        lastSavedRef.current = JSON.stringify({
          ...payload,
          seasons: payload.seasons.map((s) => ({
            ...s,
            id: s.id ?? seasonIds?.[s.client_key],
          })),
          lessons: payload.lessons.map((l) => ({
            ...l,
            id: l.id ?? lessonIds?.[l.client_key],
          })),
        });

        setSaveStatus('saved');
        // Autosave stays quiet (the status indicator is feedback enough); a
        // save the manager asked for always confirms itself.
        if (!silent && !silentSuccess) toast.success(t('courses.updatedToast'));
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
      t,
    ],
  );

  return { buildPayload, save };
}
