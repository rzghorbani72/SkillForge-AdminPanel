import * as z from 'zod';

// Single source of truth for the limits shown in the counter, enforced by the
// schema and validated again by the backend DTOs — they must never drift.
export const COURSE_TITLE_MAX = 80;
export const COURSE_DESCRIPTION_MAX = 4000;

export const courseFormFields = z.object({
  title: z
    .string()
    .min(5, 'courses.errors.titleMin')
    .max(COURSE_TITLE_MAX, 'courses.errors.titleMax'),
  description: z
    .string()
    .min(1, 'courses.errors.descriptionRequired')
    .max(COURSE_DESCRIPTION_MAX, 'courses.errors.descriptionMax'),
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
  category_id: z.string().optional(),
  season_id: z.string().optional(),
  audio_id: z.string().optional(),
  video_id: z.string().optional(),
  cover_id: z.string().optional(),
  published: z.boolean().default(false),
  is_featured: z.boolean().default(false),
  // False = the course is not sold at its own price; another selling way carries it.
  base_price_active: z.boolean().default(true)
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
