'use client';

import { useCallback } from 'react';
import type { Dispatch, SetStateAction, RefObject } from 'react';
import { toast } from 'react-toastify';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { Academy } from '@/types/api';
import type { CourseFormData } from '../schema';
import type { LessonDraft, SeasonDraft } from '../course-drafts';
import { SaveStatus } from '../_lib/useCourseForm-helpers';
import { buildCoursePayload } from './build-course-payload';
import {
  readSavedIds,
  savedFingerprint,
  withSavedLessonIds,
  withSavedSeasonIds,
} from './saved-ids';

type UseCourseSaveArgs = {
  clearDeleted: () => void;
  courseId: string;
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
};

export function useCourseSave(args: UseCourseSaveArgs) {
  const { clearDeleted, courseId, deletedLessonIds, deletedSeasonIds, lastSavedRef } = args;
  const { lessons, savingRef, seasons, selectedAcademy, setLessons, setSaveStatus, setSeasons } =
    args;
  const { t } = useTranslation();

  const buildPayload = useCallback(
    (
      data: CourseFormData,
      seasonList: SeasonDraft[],
      lessonList: LessonDraft[],
      removedSeasonIds: string[],
      removedLessonIds: string[],
    ) =>
      buildCoursePayload(data, seasonList, lessonList, removedSeasonIds, removedLessonIds, (n) =>
        t('courses.seasonNumber', { n }),
      ),
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

      const payload = buildPayload(data, seasons, lessons, deletedSeasonIds, deletedLessonIds);
      const confirm = () => {
        setSaveStatus('saved');
        if (!silent && !silentSuccess) toast.success(t('courses.updatedToast'));
        return true;
      };

      // Unchanged since the last save: this keeps autosave from firing per keystroke.
      const hasDeletes = Boolean(payload.deleted_season_ids ?? payload.deleted_lesson_ids);
      if (!hasDeletes && JSON.stringify(payload) === lastSavedRef.current) {
        savingRef.current = false;
        return confirm();
      }

      setSaveStatus('saving');
      try {
        const response = await apiClient.updateCourseContent(courseId, payload);
        clearDeleted();
        const ids = readSavedIds(response.data);
        setSeasons((prev) => withSavedSeasonIds(prev, payload, ids.seasonIds));
        setLessons((prev) => withSavedLessonIds(prev, ids.lessonIds));
        lastSavedRef.current = savedFingerprint(payload, ids);
        return confirm();
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
      buildPayload,
      lastSavedRef,
      savingRef,
      setLessons,
      setSaveStatus,
      setSeasons,
      t,
    ],
  );

  return { buildPayload, save };
}
