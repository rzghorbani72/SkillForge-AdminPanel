import type { CourseFormData } from '../schema';

/**
 * The five steps a recorded (OFFLINE) course is built in. Create starts at
 * `basics`; every later step needs a saved course, so it only opens once the
 * course row exists.
 */
export const COURSE_WIZARD_STEPS = [
  'basics',
  'content',
  'access',
  'pricing',
  'preview'
] as const;

export type CourseWizardStep = (typeof COURSE_WIZARD_STEPS)[number];

export const WIZARD_STEP_LABEL: Record<CourseWizardStep, string> = {
  basics: 'courses.wizard.stepBasics',
  content: 'courses.wizard.stepContent',
  access: 'courses.wizard.stepAccess',
  pricing: 'courses.wizard.stepPricing',
  preview: 'courses.wizard.stepPreview'
};

export const WIZARD_STEP_HINT: Record<CourseWizardStep, string> = {
  basics: 'courses.wizard.stepBasicsHint',
  content: 'courses.wizard.stepContentHint',
  access: 'courses.wizard.stepAccessHint',
  pricing: 'courses.wizard.stepPricingHint',
  preview: 'courses.wizard.stepPreviewHint'
};

/** Fields each step owns, so Next validates only what is on screen. */
export const WIZARD_STEP_FIELDS: Record<
  CourseWizardStep,
  (keyof CourseFormData)[]
> = {
  basics: ['title', 'description'],
  content: [],
  access: ['meta_title', 'meta_description', 'keywords'],
  pricing: ['primary_price', 'secondary_price'],
  preview: []
};

export function stepFromParam(value: string | null): CourseWizardStep {
  const found = COURSE_WIZARD_STEPS.find((step) => step === value);
  return found ?? 'basics';
}
