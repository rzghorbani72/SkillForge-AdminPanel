import * as z from 'zod';

export const lessonFormSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(80, 'Title must be less than 80 characters'),
  description: z
    .string()
    .max(400, 'Description must be less than 400 characters')
    .optional(),
  season_id: z.string().min(1, 'Season is required'),
  audio_id: z.string().optional(),
  video_id: z.string().optional(),
  image_id: z.string().optional(),
  document_id: z.string().optional(),
  category_id: z.string().optional(),
  published: z.boolean().default(false),
  is_free: z.boolean().default(false),
  lesson_type: z.enum(['VIDEO', 'AUDIO', 'TEXT', 'QUIZ']).default('VIDEO')
});

export type LessonFormData = z.infer<typeof lessonFormSchema>;
