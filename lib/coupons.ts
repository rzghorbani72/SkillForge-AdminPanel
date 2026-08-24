export const COUPON_TYPES = [
  'PERCENT',
  'FIXED',
  'FREE_TRIAL',
  'FULL_DISCOUNT'
] as const;

export const USAGE_TYPES = ['UNLIMITED', 'LIMITED', 'ONE_TIME'] as const;

export type CouponType = (typeof COUPON_TYPES)[number];
export type UsageType = (typeof USAGE_TYPES)[number];

export const COUPON_TYPE_LABEL_KEY: Record<CouponType, string> = {
  PERCENT: 'coupons.typePercent',
  FIXED: 'coupons.typeFixed',
  FREE_TRIAL: 'coupons.freeTrial',
  FULL_DISCOUNT: 'coupons.fullDiscount'
};

export const USAGE_TYPE_LABEL_KEY: Record<UsageType, string> = {
  UNLIMITED: 'coupons.unlimited',
  LIMITED: 'coupons.limited',
  ONE_TIME: 'coupons.oneTime'
};

export const COUPON_TYPE_BADGE: Record<CouponType, string> = {
  PERCENT: 'percent',
  FIXED: 'fixed',
  FREE_TRIAL: 'free_trial',
  FULL_DISCOUNT: 'full_discount'
};

export interface CouponSummary {
  id: string;
  code: string;
  coupon_type?: CouponType;
  discount_type?: 'PERCENT' | 'FIXED';
  discount_value?: number;
  free_trial_days?: number | null;
  end_date?: string;
}

export function couponTypeOf(coupon: CouponSummary): CouponType {
  return coupon.coupon_type ?? coupon.discount_type ?? 'PERCENT';
}

/** Matches backend normalizeDiscountCode — trim + uppercase for comparisons. */
export function normalizeDiscountCode(code: string): string {
  return code.trim().toUpperCase();
}
