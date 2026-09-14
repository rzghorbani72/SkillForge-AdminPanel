/**
 * One source of truth for how an academy's subscription state is shown.
 *
 * The backend returns four states plus an `is_trial` flag. The UI used to fold
 * everything that was not ACTIVE into "expired", so a brand-new academy that
 * never started a plan (INACTIVE) wrongly read as منقضی‌شده / Expired. Each state
 * now maps to its own label and tone so the badge tells the truth.
 */
export type SubscriptionStatusValue = 'ACTIVE' | 'GRACE' | 'EXPIRED' | 'INACTIVE';

export type SubscriptionTone = 'active' | 'trial' | 'grace' | 'expired' | 'inactive';

export interface SubscriptionStatusDisplay {
  tone: SubscriptionTone;
  /** i18n key under `subscriptionStatus.*`. */
  labelKey: string;
  /** True when the academy has no live plan and should be nudged to start one. */
  needsPlan: boolean;
}

export function getSubscriptionStatusDisplay(
  status: SubscriptionStatusValue | undefined,
  isTrial?: boolean,
): SubscriptionStatusDisplay {
  if (status === 'ACTIVE') {
    return isTrial
      ? {
          tone: 'trial',
          labelKey: 'subscriptionStatus.trial',
          needsPlan: false,
        }
      : {
          tone: 'active',
          labelKey: 'subscriptionStatus.active',
          needsPlan: false,
        };
  }
  if (status === 'GRACE') {
    return {
      tone: 'grace',
      labelKey: 'subscriptionStatus.grace',
      needsPlan: true,
    };
  }
  if (status === 'EXPIRED') {
    return {
      tone: 'expired',
      labelKey: 'subscriptionStatus.expired',
      needsPlan: true,
    };
  }
  // undefined / INACTIVE — never started, or no plan on record.
  return {
    tone: 'inactive',
    labelKey: 'subscriptionStatus.inactive',
    needsPlan: true,
  };
}

/** Pill classes per tone, shared by the sidebar badge and the plans banner. */
export const SUBSCRIPTION_TONE_CLASSES: Record<SubscriptionTone, string> = {
  active: 'bg-success/10 text-success',
  trial: 'bg-info/10 text-info',
  grace: 'bg-warning/10 text-warning',
  expired: 'bg-destructive/10 text-destructive',
  inactive: 'bg-muted text-muted-foreground',
};
