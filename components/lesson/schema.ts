import * as z from 'zod';

export const lessonFormSchema = z.object({
  title: z
    .string()
    .min(5, 'validation.titleMin5')
    .max(80, 'validation.titleMax80'),
  description: z.string().max(400, 'validation.descriptionMax400').optional(),
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
