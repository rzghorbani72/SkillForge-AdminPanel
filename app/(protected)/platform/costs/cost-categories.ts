export const PLATFORM_COST_TREE = {
  marketing: ['social', 'search', 'content', 'referral', 'events', 'influencer', 'other'],
  infrastructure: ['hosting', 'storage', 'sms', 'domain', 'cdn', 'other'],
  people: ['salary', 'contractor', 'other'],
  operations: ['legal', 'accounting', 'tools', 'office', 'other'],
  other: ['other'],
} as const;

export type PlatformCostCategory = keyof typeof PLATFORM_COST_TREE;

export const PLATFORM_COST_CATEGORIES = Object.keys(PLATFORM_COST_TREE) as PlatformCostCategory[];

export function isCostCategory(value: string): value is PlatformCostCategory {
  return value in PLATFORM_COST_TREE;
}
