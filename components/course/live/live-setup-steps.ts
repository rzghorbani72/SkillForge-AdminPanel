import type { LiveCourseReadiness } from '@/components/course/course-drafts';

export type LiveSetupStepId = 'topics' | 'pricing' | 'class';

export interface LiveSetupStep {
  id: LiveSetupStepId;
  done: boolean;
  labelKey: string;
  hintKey: string;
}

/**
 * The three things a live course needs before it can be sold, in the order the
 * server checks them (`validateLiveForPublish`). A teacher sees the same order
 * on the page, so "what is missing" and "why publish is disabled" are one
 * answer instead of two.
 */
export function liveSetupSteps(readiness: LiveCourseReadiness): LiveSetupStep[] {
  return [
    {
      id: 'topics',
      done: readiness.topics > 0,
      labelKey: 'courses.live.stepTopics',
      hintKey: 'courses.live.stepTopicsHint',
    },
    {
      id: 'pricing',
      done: readiness.sellingOffers > 0,
      labelKey: 'courses.live.stepPricing',
      hintKey: 'courses.live.stepPricingHint',
    },
    {
      id: 'class',
      done: readiness.classesWithSchedule > 0,
      labelKey: 'courses.live.stepClass',
      hintKey: 'courses.live.stepClassHint',
    },
  ];
}

/** The step the teacher should do next, or `null` when the course is ready. */
export function currentLiveSetupStep(steps: readonly LiveSetupStep[]): LiveSetupStep | null {
  return steps.find((step) => !step.done) ?? null;
}

export function liveSetupDoneCount(steps: readonly LiveSetupStep[]): number {
  return steps.filter((step) => step.done).length;
}
