import * as z from 'zod';

export const courseFormSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(80, 'Title must be less than 80 characters'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(400, 'Description must be less than 400 characters'),
  primary_price: z
    .string()
    .min(1, 'Primary price is required')
    .refine((val) => {
      const num = Number(val);
      return !isNaN(num) && num >= 0;
    }, 'Primary price must be a valid number'),
  secondary_price: z
    .string()
    .min(1, 'Secondary price is required')
    .refine((val) => {
      const num = Number(val);
      return !isNaN(num) && num >= 0;
    }, 'Secondary price must be a valid number'),
  category_id: z.string().optional(),
  season_id: z.string().optional(),
  audio_id: z.string().optional(),
  video_id: z.string().optional(),
  cover_id: z.string().optional(),
  published: z.boolean().default(false)
});

export type CourseFormData = z.infer<typeof courseFormSchema>;
