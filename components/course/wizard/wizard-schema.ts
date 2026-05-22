import * as z from 'zod';

export const PRICING_TYPES = [
  'FREE',
  'ONE_TIME',
  'PAYMENT_PLAN',
  'SUBSCRIPTION'
] as const;
export type PricingType = (typeof PRICING_TYPES)[number];

export const wizardSchema = z.object({
  // Step 1: Details
  title: z.string().min(5, 'Title must be at least 5 characters').max(80),
  subtitle: z.string().max(120).optional(),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000),
  category_id: z.string().optional(),
  cover_id: z.string().optional(),

  // Step 2: Pricing
  pricing_type: z.enum(PRICING_TYPES),
  price: z.coerce.number().min(0).optional(),
  access_duration_days: z.coerce.number().int().min(1).optional().nullable(),

  // Payment plan (only when pricing_type === PAYMENT_PLAN)
  installment_count: z.coerce.number().int().min(2).optional(),
  amount_per_installment: z.coerce.number().min(0).optional(),
  interval_days: z.coerce.number().int().min(1).optional(),

  // Step 3: Access & Settings
  prerequisite_course_id: z.coerce.number().int().optional().nullable(),
  is_published: z.boolean().default(false),
  is_featured: z.boolean().default(false)
});

export type WizardValues = z.infer<typeof wizardSchema>;

export const STEP_LABELS = [
  {
    step: 1,
    title: 'Course Details',
    description: 'Name your course and add a description'
  },
  { step: 2, title: 'Pricing', description: 'Choose how students pay' },
  { step: 3, title: 'Access Settings', description: 'Control who can enroll' },
  {
    step: 4,
    title: 'Review & Publish',
    description: 'Confirm and create your course'
  }
] as const;
