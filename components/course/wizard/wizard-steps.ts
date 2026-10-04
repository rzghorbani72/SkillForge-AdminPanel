import type { CourseType } from '../course-drafts';
import type { CourseFormData } from '../schema';

/** The steps a course is built in, in create and in edit alike. */
export const COURSE_WIZARD_STEPS = [
  'basics',
  'content',
  'schedule',
  'classType',
  'meeting',
  'access',
  'pricing',
  'preview',
  'review',
] as const;

export type CourseWizardStep = (typeof COURSE_WIZARD_STEPS)[number];

const LIVE_ONLY_STEPS: readonly CourseWizardStep[] = ['schedule', 'classType', 'meeting', 'review'];
const RECORDED_ONLY_STEPS: readonly CourseWizardStep[] = [
  'content',
  'access',
  'pricing',
  'preview',
];

export const LIVE_CLASS_STEPS = ['schedule', 'classType', 'meeting'] as const;
export type LiveClassStep = (typeof LIVE_CLASS_STEPS)[number];

export const isLiveClassStep = (step: CourseWizardStep): step is LiveClassStep =>
  LIVE_CLASS_STEPS.some((liveStep) => liveStep === step);

/**
 * A live course is built as: what it is → when it meets → who it is for and
 * the price → how students enter → review and publish.
 */
export function stepsFor(courseType: CourseType): readonly CourseWizardStep[] {
  const hidden = courseType === 'LIVE' ? RECORDED_ONLY_STEPS : LIVE_ONLY_STEPS;
  return COURSE_WIZARD_STEPS.filter((step) => !hidden.includes(step));
}

export const WIZARD_STEP_LABEL: Record<CourseWizardStep, string> = {
  basics: 'courses.wizard.stepBasics',
  content: 'courses.wizard.stepContent',
  schedule: 'liveWizard.stepSchedule',
  classType: 'liveWizard.stepClassType',
  meeting: 'liveWizard.stepMeeting',
  access: 'courses.wizard.stepAccess',
  pricing: 'courses.wizard.stepPricing',
  preview: 'courses.wizard.stepPreview',
  review: 'liveWizard.stepReview',
};

export const WIZARD_STEP_HINT: Record<CourseWizardStep, string> = {
  basics: 'courses.wizard.stepBasicsHint',
  content: 'courses.wizard.stepContentHint',
  schedule: 'liveWizard.stepScheduleHint',
  classType: 'liveWizard.stepClassTypeHint',
  meeting: 'liveWizard.stepMeetingHint',
  access: 'courses.wizard.stepAccessHint',
  pricing: 'courses.wizard.stepPricingHint',
  preview: 'courses.wizard.stepPreviewHint',
  review: 'liveWizard.stepReviewHint',
};

/** Fields each step owns, so Next validates only what is on screen. */
export const WIZARD_STEP_FIELDS: Record<CourseWizardStep, (keyof CourseFormData)[]> = {
  basics: ['title', 'description', 'requirements', 'difficulty', 'access_duration_days'],
  content: [],
  schedule: [],
  classType: [],
  meeting: [],
  access: ['meta_title', 'meta_description', 'keywords'],
  pricing: ['primary_price', 'secondary_price'],
  preview: [],
  review: [],
};

export function stepFromParam(
  value: string | null,
  steps: readonly CourseWizardStep[] = COURSE_WIZARD_STEPS,
): CourseWizardStep {
  return steps.find((step) => step === value) ?? 'basics';
}
