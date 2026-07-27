/**
 * Maps a subscription plan slug to its Farsi display name.
 * `SubscriptionPlan.name` is already stored in Farsi in the database, but
 * several places only have the slug (e.g. `Academy.subscription_plan`,
 * `AcademySubscriptionInvoice.plan_name`) without a live join to the plan
 * row. This mapping keeps those raw slugs readable in the UI.
 */
const PLAN_DISPLAY_NAMES_FA: Record<string, string> = {
  basic: 'استارتر',
  starter: 'استارتر',
  growth: 'رشد',
  builder: 'رشد',
  business: 'بیزینس',
  pro: 'بیزینس',
  professional: 'بیزینس',
  enterprise: 'بیزینس',
  custom: 'سفارشی'
};

export function getPlanDisplayName(slug?: string | null): string | null {
  if (!slug) return null;
  return PLAN_DISPLAY_NAMES_FA[slug.toLowerCase()] ?? slug;
}
