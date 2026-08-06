import { useCallback, useState } from 'react';
import {
  emptyLesson,
  emptySeason,
  type LessonDraft,
  type SeasonDraft
} from './course-drafts';

/**
 * The editable curriculum of one course: seasons, lessons and the ids deleted
 * along the way. Kept apart from the course form so the ordering rules can be
 * read — and tested — on their own.
 */
export function useCurriculumDraft() {
  const [seasons, setSeasons] = useState<SeasonDraft[]>([]);
  const [lessons, setLessons] = useState<LessonDraft[]>([]);
  const [deletedSeasonIds, setDeletedSeasonIds] = useState<string[]>([]);
  const [deletedLessonIds, setDeletedLessonIds] = useState<string[]>([]);

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
      const remaining = prev.filter((x) => x.clientKey !== key);
      // Move the orphans instead of unassigning them: a lesson with no season
      // is still saved but is never rendered, so it vanishes from the builder.
      const fallback = remaining[0]?.clientKey;
      if (fallback) {
        setLessons((ls) =>
          ls.map((l) =>
            l.seasonClientKey === key ? { ...l, seasonClientKey: fallback } : l
          )
        );
      }
      return remaining;
    });
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

  const addLesson = useCallback((seasonClientKey: string, title = '') => {
    setLessons((prev) => [...prev, { ...emptyLesson(seasonClientKey), title }]);
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

  /** Move a lesson to another season. Every lesson always belongs to one. */
  const assignLesson = useCallback(
    (lessonKey: string, seasonClientKey: string) =>
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

  const clearDeleted = useCallback(() => {
    setDeletedSeasonIds([]);
    setDeletedLessonIds([]);
  }, []);

  return {
    seasons,
    lessons,
    deletedSeasonIds,
    deletedLessonIds,
    setSeasons,
    setLessons,
    clearDeleted,
    addSeason,
    removeSeason,
    updateSeason,
    reorderSeasons,
    addLesson,
    removeLesson,
    updateLesson,
    assignLesson,
    reorderLessons
  };
}
