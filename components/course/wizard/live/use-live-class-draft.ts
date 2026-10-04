'use client';

import { useMemo, useState } from 'react';

import { useLiveCourse } from '@/app/(protected)/courses/[course_id]/live/hooks/use-live-course';
import { useCreateTutoringOffer } from '@/app/(protected)/courses/[course_id]/live/hooks/use-create-tutoring-offer';
import { defaultTimezone } from '@/lib/class-slot-time';
import { ErrorHandler } from '@/lib/error-handler';
import type { Course } from '@/types/api';
import type { TutoringGroup } from '@/types/learning-operations';
import {
  EMPTY_LIVE_DRAFT,
  STEP_FIELDS,
  defaultDeadline,
  draftErrors,
  draftFromGroup,
  groupWrite,
  sessionDates,
  sessionsMissedAtDeadline,
  stepHasErrors,
  type LiveClassDraft,
} from './live-class-draft';
import { isScheduleEditable, saveLiveClass } from './persist-live-class';
import { clearStash, readStash, writeStash } from './draft-stash';

export type LiveClassStepName = keyof typeof STEP_FIELDS;

/** The class the wizard edits: the oldest one still alive; others live on the classes page. */
const primaryClass = (groups: readonly TutoringGroup[]): TutoringGroup | null =>
  groups.filter((group) => group.status !== 'CANCELLED').at(-1) ?? null;

/**
 * The live class behind the wizard's schedule, class-type and meeting steps.
 * It is written to the server as one unit, because a class needs a price before
 * it can exist; until then the draft is kept on this device so nothing is lost.
 */
export function useLiveClassDraft(courseId: string, enabled: boolean) {
  const live = useLiveCourse(courseId, enabled);
  const createOffer = useCreateTutoringOffer();
  const [edited, setEdited] = useState<LiveClassDraft | null>(null);
  const [revealErrors, setRevealErrors] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const group = primaryClass(live.groups);
  const timezone = group?.timezone ?? defaultTimezone();
  const scheduleLocked = !isScheduleEditable(group);
  const draft = useMemo(
    () => edited ?? (group ? draftFromGroup(group) : (readStash(courseId) ?? EMPTY_LIVE_DRAFT)),
    [edited, group, courseId],
  );
  const dates = useMemo(() => sessionDates(draft, timezone), [draft, timezone]);
  const errors = useMemo(
    () => draftErrors(draft, dates, new Date(), scheduleLocked),
    [draft, dates, scheduleLocked],
  );

  const update = (partial: Partial<LiveClassDraft>) => {
    const next = { ...draft, ...partial };
    if (partial.startsOn && !draft.joinDeadline)
      next.joinDeadline = defaultDeadline(partial.startsOn);
    setEdited(next);
    if (!group) writeStash(courseId, next);
  };

  const isComplete = Object.keys(errors).length === 0;

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

  /** Returns the saved class, or null after showing why it could not be saved. */
  const save = async (): Promise<TutoringGroup | null> => {
    if (!isComplete || !live.course) {
      setRevealErrors(true);
      return null;
    }
    setIsSaving(true);
    try {
      const offerId = await resolveOfferId(live.course);
      const write = groupWrite(draft, live.course.title, timezone);
      const saved = await saveLiveClass(group, offerId, write, draft);
      clearStash(courseId);
      await live.reload();
      setEdited(null);
      return saved;
    } catch (error) {
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
    group,
    otherClasses: Math.max(live.groups.length - 1, 0),
    scheduleLocked,
    draft,
    dates,
    errors,
    shownErrors: revealErrors ? errors : {},
    missedAtDeadline: sessionsMissedAtDeadline(draft, dates),
    isComplete,
    isSaving,
    update,
    revealErrors: () => setRevealErrors(true),
    stepHasErrors: (step: LiveClassStepName) => stepHasErrors(errors, step),
    save,
  };
}

export type LiveClassDraftApi = ReturnType<typeof useLiveClassDraft>;
