import type { PublicSubscriptionPlanData, SubscriptionPlanData } from './types-1';
import type { SupportInboxResult } from './types-2';

export function unwrapDataEnvelope<T>(payload: T | { data: T }): T {
  if (typeof payload === 'object' && payload !== null && 'data' in payload) {
    return payload.data;
  }
  return payload;
}

/** The upload endpoints answer in a few envelope shapes; only the id matters. */
export function uploadedFileId(payload: unknown): string {
  if (payload && typeof payload === 'object') {
    if ('data' in payload && payload.data) return uploadedFileId(payload.data);
    if ('id' in payload && typeof payload.id === 'string') return payload.id;
  }
  throw new Error('Upload did not return a file id');
}

export const LEGAL_CONSENT_REQUIRED_EVENT = 'mentoma:legal-consent-required';

export const SUBSCRIPTION_REQUIRED_EVENT = 'mentoma:subscription-required';

// Public plans only ever come back active and pre-sorted by the backend, so
// the array index doubles as sort_order and is_active is always true.
// created_at/updated_at aren't part of the public shape; they're unused by
// every screen that consumes this normalized data, so they're left blank.
export function mapPublicPlanToSubscriptionPlan(
  plan: PublicSubscriptionPlanData,
  index: number,
): SubscriptionPlanData {
  return {
    id: plan.slug,
    name: plan.name,
    slug: plan.slug,
    price_monthly: plan.price_monthly_toman,
    price_yearly: plan.price_yearly_toman,
    commission_rate: plan.commission_rate,
    storage_limit_gb: plan.storage_gb,
    features: plan.features,
    is_active: true,
    sort_order: index,
    limits: plan.limits,
    is_most_popular: plan.is_most_popular,
    annual_months_included: plan.annual_months_included,
    vat_rate: plan.vat_rate,
    created_at: '',
    updated_at: '',
  };
}

/**
 * Support routes answer with the `{ message, status, data }` envelope, so the
 * payload sits one level deeper than `res.data`. Reading it without this is
 * how a ticket detail ends up with an undefined `capabilities`.
 */
export function unwrapEnvelope<T>(res: unknown): T {
  const outer = (res as { data?: unknown }).data;
  if (outer && typeof outer === 'object' && 'data' in outer) {
    return (outer as { data: T }).data;
  }
  return outer as T;
}

export function unwrapSupportInbox(res: unknown): SupportInboxResult {
  const payload = (res as { data?: SupportInboxResult | { data?: SupportInboxResult } }).data;
  if (payload && 'items' in payload) return payload;
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: SupportInboxResult }).data;
  }
  return { items: [], total: 0, page: 1, limit: 20 };
}
