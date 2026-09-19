import type { CourseType } from '../course-drafts';
import type { CourseFormData } from '../schema';

/** The steps a course is built in, in create and in edit alike. */
export const COURSE_WIZARD_STEPS = [
  'basics',
  'content',
  'classroom',
  'access',
  'pricing',
  'preview',
] as const;

export type CourseWizardStep = (typeof COURSE_WIZARD_STEPS)[number];

const LIVE_ONLY_STEPS: readonly CourseWizardStep[] = ['classroom'];
const RECORDED_ONLY_STEPS: readonly CourseWizardStep[] = ['content', 'pricing'];

/**
 * A live course has no lesson tree and no separate price step — its topics,
 * seat prices and timetable are all managed in `classroom`, so a manager sets
 * each price in exactly one place.
 */
export function stepsFor(courseType: CourseType): readonly CourseWizardStep[] {
  const hidden = courseType === 'LIVE' ? RECORDED_ONLY_STEPS : LIVE_ONLY_STEPS;
  return COURSE_WIZARD_STEPS.filter((step) => !hidden.includes(step));
}

export const WIZARD_STEP_LABEL: Record<CourseWizardStep, string> = {
  basics: 'courses.wizard.stepBasics',
  content: 'courses.wizard.stepContent',
  classroom: 'courses.wizard.stepClassroom',
  access: 'courses.wizard.stepAccess',
  pricing: 'courses.wizard.stepPricing',
  preview: 'courses.wizard.stepPreview',
};

export const WIZARD_STEP_HINT: Record<CourseWizardStep, string> = {
  basics: 'courses.wizard.stepBasicsHint',
  content: 'courses.wizard.stepContentHint',
  classroom: 'courses.wizard.stepClassroomHint',
  access: 'courses.wizard.stepAccessHint',
  pricing: 'courses.wizard.stepPricingHint',
  preview: 'courses.wizard.stepPreviewHint',
};

/** Fields each step owns, so Next validates only what is on screen. */
export const WIZARD_STEP_FIELDS: Record<CourseWizardStep, (keyof CourseFormData)[]> = {
  basics: ['title', 'description', 'requirements', 'difficulty', 'access_duration_days'],
  content: [],
  classroom: [],
  access: ['meta_title', 'meta_description', 'keywords'],
  pricing: ['primary_price', 'secondary_price'],
  preview: [],
};

export function stepFromParam(
  value: string | null,
  steps: readonly CourseWizardStep[] = COURSE_WIZARD_STEPS,
): CourseWizardStep {
  return steps.find((step) => step === value) ?? 'basics';
}
