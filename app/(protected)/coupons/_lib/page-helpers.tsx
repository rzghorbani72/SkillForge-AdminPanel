import { z } from 'zod';
import { COUPON_TYPES, USAGE_TYPES } from '@/lib/coupons';

export function buildCouponSchema(endBeforeStartMessage: string) {
  return z
    .object({
      code: z.string().min(1, 'validation.required'),
      coupon_type: z.enum(COUPON_TYPES),
      discount_value: z.coerce.number().min(0).optional(),
      free_trial_days: z.coerce.number().int().min(1).optional(),
      start_date: z.string().min(1, 'validation.required'),
      end_date: z.string().min(1, 'validation.required'),
      usage_type: z.enum(USAGE_TYPES),
      usage_limit: z.coerce.number().int().min(1).optional(),
      academy_id: z.string().optional(),
      max_discount_amount: z.coerce.number().optional(),
      min_purchase_amount: z.coerce.number().optional(),
    })
    .refine((values) => values.coupon_type !== 'FREE_TRIAL' || (values.free_trial_days ?? 0) >= 1, {
      path: ['free_trial_days'],
      message: 'validation.required',
    })
    .refine((values) => values.usage_type !== 'LIMITED' || (values.usage_limit ?? 0) >= 1, {
      path: ['usage_limit'],
      message: 'validation.required',
    })
    .refine(
      (values) => !values.start_date || !values.end_date || values.start_date < values.end_date,
      { path: ['end_date'], message: endBeforeStartMessage },
    );
}

export type CouponValues = z.infer<ReturnType<typeof buildCouponSchema>>;
