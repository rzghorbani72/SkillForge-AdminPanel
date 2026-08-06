import * as z from 'zod';

export const courseFormSchema = z.object({
  title: z
    .string()
    .min(5, 'courses.errors.titleMin')
    .max(80, 'courses.errors.titleMax'),
  description: z
    .string()
    .min(1, 'courses.errors.descriptionRequired')
    .max(400, 'courses.errors.descriptionMax'),
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
  secondary_price: z
    .string()
    .min(1, 'courses.errors.secondaryPriceRequired')
    .refine(
      (val) => /^\d+$/.test(val.trim()),
      'courses.errors.secondaryPriceWholeNumber'
    )
    .refine((val) => {
      const num = Number(val);
      return !isNaN(num) && num >= 0 && num <= 999999999;
    }, 'courses.errors.secondaryPriceRange'),
  category_id: z.string().optional(),
  season_id: z.string().optional(),
  audio_id: z.string().optional(),
  video_id: z.string().optional(),
  cover_id: z.string().optional(),
  published: z.boolean().default(false),
  is_featured: z.boolean().default(false)
});

export type CourseFormData = z.infer<typeof courseFormSchema>;
