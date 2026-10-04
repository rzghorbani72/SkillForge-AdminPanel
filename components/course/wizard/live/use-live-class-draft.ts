'use client';

import { useMemo, useState } from 'react';

import { useLiveCourse } from '@/app/(protected)/courses/[course_id]/live/hooks/use-live-course';
import { useCreateTutoringOffer } from '@/app/(protected)/courses/[course_id]/live/hooks/use-create-tutoring-offer';
import { defaultTimezone } from '@/lib/class-slot-time';
import { ErrorHandler } from '@/lib/error-handler';
import type { Course } from '@/types/api';
import type { TutoringGroup } from '@/types/learning-operations';
import { newClassDraft, type ClassScheduleDraft } from './class-schedule-draft';
import {
  draftFromGroups,
  emptyLiveDraft,
  groupWrite,
  stepHasErrors,
  type LiveClassDraft,
  type LiveClassStepName,
} from './live-class-draft';
import { saveLiveClass } from './persist-live-class';
import { clearStash, readStash, writeStash } from './draft-stash';
import { useClassSchedules } from './use-class-schedules';

const ENDED_STATUSES: readonly string[] = ['CANCELLED', 'COMPLETED'];

/** Oldest first, so "class 1" in the wizard stays the first class made. */
const liveClasses = (groups: readonly TutoringGroup[]): TutoringGroup[] =>
  groups.filter((group) => !ENDED_STATUSES.includes(group.status)).reverse();

/**
 * The course's live classes behind the schedule, class-type and meeting steps.
 * They are written to the server together, because a class needs a price before
 * it can exist; until then a new course's draft is kept on this device.
 */
export function useLiveClassDraft(courseId: string, enabled: boolean) {
  const live = useLiveCourse(courseId, enabled);
  const createOffer = useCreateTutoringOffer();
  const [edited, setEdited] = useState<LiveClassDraft | null>(null);
  const [revealErrors, setRevealErrors] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const groups = useMemo(() => liveClasses(live.groups), [live.groups]);
  const timezone = groups[0]?.timezone ?? defaultTimezone();
  const draft = useMemo(
    () =>
      edited ??
      (groups.length > 0 ? draftFromGroups(groups) : (readStash(courseId) ?? emptyLiveDraft())),
    [edited, groups, courseId],
  );

  const update = (partial: Partial<LiveClassDraft>) => {
    const next = { ...draft, ...partial };
    setEdited(next);
    if (groups.length === 0) writeStash(courseId, next);
  };
  const setClasses = (classes: ClassScheduleDraft[]) => update({ classes });

  const { classes, errors } = useClassSchedules(draft, groups, timezone, revealErrors, setClasses);
  const isComplete = Object.keys(errors.shared).length === 0 && !stepHasErrors(errors, 'schedule');

  const resolveOfferId = async (course: Course): Promise<string> => {
    const existing = live.offers.find((offer) => offer.kind === 'GROUP');
    if (existing) return existing.id;
    const target = {
      courseId,
      courseTitle: course.title,
      tutorProfileId: String(course.author_id),
    };
    return (await createOffer(target, 'GROUP', Number(draft.price))).id;
  };

  /**
   * Saves classes one by one. A class created before a later one fails keeps
   * its new id, so the next try updates it instead of creating it twice.
   */
  const save = async (): Promise<TutoringGroup[] | null> => {
    if (!isComplete || !live.course) {
      setRevealErrors(true);
      return null;
    }
    setIsSaving(true);
    let saved = draft.classes;
    try {
      const offerId = await resolveOfferId(live.course);
      const results: TutoringGroup[] = [];
      for (const schedule of draft.classes) {
        const previous = groups.find((group) => group.id === schedule.groupId) ?? null;
        const write = groupWrite(draft, schedule, live.course.title, timezone);
        const group = await saveLiveClass(previous, offerId, write, draft);
        results.push(group);
        saved = saved.map((item) =>
          item.key === schedule.key ? { ...item, groupId: group.id } : item,
        );
      }
      clearStash(courseId);
      await live.reload();
      setEdited(null);
      return results;
    } catch (error) {
      setEdited({ ...draft, classes: saved });
      ErrorHandler.handleApiError(error);
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    courseId,
    course: live.course,
    topics: live.topics,
    isLoading: live.isLoading,
    reload: live.reload,
    patchTopics: live.patch,
    groups,
    timezone,
    draft,
    classes,
    shownErrors: revealErrors ? errors.shared : {},
    errorsShown: revealErrors,
    isComplete,
    isSaving,
    update,
    addClass: () => setClasses([...draft.classes, newClassDraft()]),
    removeClass: (key: string) =>
      setClasses(draft.classes.filter((item) => item.key !== key || item.groupId !== null)),
    revealErrors: () => setRevealErrors(true),
    stepHasErrors: (step: LiveClassStepName) => stepHasErrors(errors, step),
    save,
  };
}

export type LiveClassDraftApi = ReturnType<typeof useLiveClassDraft>;
