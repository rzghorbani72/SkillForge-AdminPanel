import { z } from 'zod';

// ─── Schema (no academy_id — derived from context) ───────────────────────────

export const schema = z.object({
  title: z.string().min(2),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers and hyphens'),
  price: z.coerce.number().min(0),
  description: z.string().optional(),
});

export type FormValues = z.infer<typeof schema>;
