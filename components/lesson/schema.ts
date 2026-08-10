import * as z from 'zod';

// Single source of truth for the lesson description limit shown in the counter
// — must stay equal to the backend lesson DTOs.
export const LESSON_DESCRIPTION_MAX = 4000;

export const lessonFormSchema = z.object({
  title: z
    .string()
    .min(5, 'validation.titleMin5')
    .max(80, 'validation.titleMax80'),
  description: z
    .string()
    .max(LESSON_DESCRIPTION_MAX, 'validation.descriptionMax')
    .optional(),
  season_id: z.string().min(1, 'validation.seasonRequired'),
  audio_id: z.string().optional(),
  video_id: z.string().optional(),
  cover_id: z.string().optional(),
  document_id: z.string().optional(),
  category_id: z.string().optional(),
  published: z.boolean().default(false),
  is_free: z.boolean().default(false),
  lesson_type: z
    .enum(['VIDEO', 'AUDIO', 'TEXT', 'QUIZ', 'ASSIGNMENT', 'LIVE'])
    .default('VIDEO')
});

export type LessonFormData = z.infer<typeof lessonFormSchema>;
