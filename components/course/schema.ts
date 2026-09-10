import * as z from 'zod';

// Single source of truth for the limits shown in the counter, enforced by the
// schema and validated again by the backend DTOs — they must never drift.
export const COURSE_TITLE_MAX = 80;
export const COURSE_DESCRIPTION_MAX = 4000;
export const COURSE_LEARNING_OUTCOMES_MAX = 2000;
export const COURSE_REQUIREMENTS_MAX = 2000;
export const COURSE_META_TITLE_MAX = 60;
export const COURSE_META_DESCRIPTION_MAX = 160;
export const COURSE_KEYWORDS_MAX = 10;
export const COURSE_KEYWORD_MAX = 40;
export const COURSE_ACCESS_DAYS_MAX = 1825;
export const COURSE_DIFFICULTIES = [
  'BEGINNER',
  'INTERMEDIATE',
  'ADVANCED',
  'EXPERT'
] as const;
export type CourseDifficultyLevel = (typeof COURSE_DIFFICULTIES)[number];

export function parseAccessDurationDays(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === '') return null;
  return Number(trimmed);
}

export function parseCourseDifficulty(value: unknown): CourseDifficultyLevel {
  if (
    typeof value === 'string' &&
    (COURSE_DIFFICULTIES as readonly string[]).includes(value)
  ) {
    return value as CourseDifficultyLevel;
  }
  return 'BEGINNER';
}

export const courseFormFields = z.object({
  title: z
    .string()
    .min(5, 'courses.errors.titleMin')
    .max(COURSE_TITLE_MAX, 'courses.errors.titleMax'),
  description: z
    .string()
    .min(1, 'courses.errors.descriptionRequired')
    .max(COURSE_DESCRIPTION_MAX, 'courses.errors.descriptionMax'),
  // One outcome per line. Empty hides the public "what you will learn" block.
  learning_outcomes: z
    .string()
    .max(COURSE_LEARNING_OUTCOMES_MAX, 'courses.errors.learningOutcomesMax')
    .default(''),
  // One requirement per line. Empty hides the public prerequisites block.
  requirements: z
    .string()
    .max(COURSE_REQUIREMENTS_MAX, 'courses.errors.requirementsMax')
    .default(''),
  difficulty: z.enum(COURSE_DIFFICULTIES).default('BEGINNER'),
  is_certificate: z.boolean().default(false),
  // Empty = students keep access while the academy is active.
  access_duration_days: z
    .string()
    .refine(
      (val) => val.trim() === '' || /^\d+$/.test(val.trim()),
      'courses.errors.accessDurationWholeNumber'
    )
    .refine((val) => {
      if (val.trim() === '') return true;
      const days = Number(val);
      return days >= 1 && days <= COURSE_ACCESS_DAYS_MAX;
    }, 'courses.errors.accessDurationRange')
    .default(''),
  primary_price: z
    .string()
    .min(1, 'courses.errors.primaryPriceRequired')
    .refine(
      (val) => /^\d+$/.test(val.trim()),
      'courses.errors.primaryPriceWholeNumber'
    )
    .refine((val) => {
      const num = Number(val);
      return !isNaN(num) && num >= 0 && num <= 999999999;
    }, 'courses.errors.primaryPriceRange'),
  // Optional: empty means the course is not advertised as discounted.
  secondary_price: z
    .string()
    .refine(
      (val) => val.trim() === '' || /^\d+$/.test(val.trim()),
      'courses.errors.beforeDiscountWholeNumber'
    )
    .refine((val) => {
      if (val.trim() === '') return true;
      const num = Number(val);
      return !isNaN(num) && num >= 0 && num <= 999999999;
    }, 'courses.errors.beforeDiscountRange'),
  // Search metadata. Empty = fall back to the course title/description.
  meta_title: z.string().max(COURSE_META_TITLE_MAX).default(''),
  meta_description: z.string().max(COURSE_META_DESCRIPTION_MAX).default(''),
  keywords: z
    .array(z.string().max(COURSE_KEYWORD_MAX))
    .max(COURSE_KEYWORDS_MAX)
    .default([]),
  category_id: z.string().optional(),
  season_id: z.string().optional(),
  audio_id: z.string().optional(),
  video_id: z.string().optional(),
  cover_id: z.string().optional(),
  published: z.boolean().default(false),
  is_featured: z.boolean().default(false),
  // False = the course is not sold at its own price; another selling way carries it.
  base_price_active: z.boolean().default(true),
  // False = secure media: students stream lesson video/audio but cannot save it.
  allow_downloads: z.boolean().default(false),
  // Not a course field: asks the server to push allow_downloads onto every
  // existing lesson, replacing per-lesson choices.
  apply_downloads_to_lessons: z.boolean().default(false)
});

// A "before discount" price must sit above the price actually charged, or it
// would advertise a discount that is not real.
export const courseFormSchema = courseFormFields.superRefine((data, ctx) => {
  if (
    data.secondary_price.trim() !== '' &&
    Number(data.secondary_price) <= Number(data.primary_price)
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['secondary_price'],
      message: 'courses.errors.beforeDiscountTooLow'
    });
  }
});

export type CourseFormData = z.infer<typeof courseFormFields>;
