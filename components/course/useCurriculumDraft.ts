import { useCallback, useState } from 'react';
import { emptyLesson, emptySeason, type LessonDraft, type SeasonDraft } from './course-drafts';

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

  const addSeason = useCallback(() => setSeasons((s) => [...s, emptySeason()]), []);

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
          ls.map((l) => (l.seasonClientKey === key ? { ...l, seasonClientKey: fallback } : l)),
        );
      }
      return remaining;
    });
  }, []);

  /**
   * The last season can't be removed (a course needs one to hold lessons), so
   * this is what its trash button does instead: wipe it back to the same
   * blank state a freshly added season starts in.
   */
  const clearSeason = useCallback((seasonKey: string) => {
    setLessons((prev) => {
      const idsToDelete = prev
        .filter((l) => l.seasonClientKey === seasonKey && l.id)
        .map((l) => l.id!);
      if (idsToDelete.length) {
        setDeletedLessonIds((ids) => [...ids, ...idsToDelete]);
      }
      return prev.filter((l) => l.seasonClientKey !== seasonKey);
    });
    setSeasons((prev) => prev.map((s) => (s.clientKey === seasonKey ? { ...s, title: '' } : s)));
  }, []);

  const updateSeason = useCallback(
    (key: string, patch: Partial<Pick<SeasonDraft, 'title'>>) =>
      setSeasons((s) => s.map((x) => (x.clientKey === key ? { ...x, ...patch } : x))),
    [],
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

  /**
   * The last lesson in a season can't be removed outright — that would leave
   * the season empty, which blocks publishing and re-triggers the "add a
   * season" guard. Instead it resets back to a blank draft in the same spot,
   * exactly like a lesson never started.
   */
  const clearLesson = useCallback((lessonKey: string) => {
    setLessons((prev) =>
      prev.map((l) => {
        if (l.clientKey !== lessonKey) return l;
        if (l.id) setDeletedLessonIds((ids) => [...ids, l.id!]);
        return emptyLesson(l.seasonClientKey);
      }),
    );
  }, []);

  const updateLesson = useCallback(
    (lessonKey: string, patch: Partial<LessonDraft>) =>
      setLessons((prev) => prev.map((l) => (l.clientKey === lessonKey ? { ...l, ...patch } : l))),
    [],
  );

  /** Move a lesson to another season. Every lesson always belongs to one. */
  const assignLesson = useCallback(
    (lessonKey: string, seasonClientKey: string) =>
      setLessons((prev) =>
        prev.map((l) => (l.clientKey === lessonKey ? { ...l, seasonClientKey } : l)),
      ),
    [],
  );

  /** Reorder lessons within a section (unassigned or a specific season) */
  const reorderLessons = useCallback((sectionKey: string | undefined, from: number, to: number) => {
    setLessons((prev) => {
      const inSection = prev.filter((l) => l.seasonClientKey === sectionKey);
      if (from >= inSection.length || to >= inSection.length) return prev;

      const reordered = [...inSection];
      const [moved] = reordered.splice(from, 1);
      reordered.splice(to, 0, moved);

      // Rebuild full array: replace section slots in original order
      let sectionIdx = 0;
      return prev.map((l) => (l.seasonClientKey === sectionKey ? reordered[sectionIdx++] : l));
    });
  }, []);

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
    clearSeason,
    updateSeason,
    reorderSeasons,
    addLesson,
    removeLesson,
    clearLesson,
    updateLesson,
    assignLesson,
    reorderLessons,
  };
}
