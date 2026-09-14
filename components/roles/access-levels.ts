import type { InterpolationParams } from '@/lib/i18n';

type TranslateFn = (key: string, params?: InterpolationParams) => string;

/**
 * Access is stored as a number (Role.hierarchy_level, 0-6) but managers think in
 * people, so every level carries a name. A level is named after the tier it
 * grants, never after a single role: level 4 covers FINANCE and SUPPORT, level 0
 * covers USER and AFFILIATE, and a custom role may sit on any of them.
 */
export const ACCESS_LEVELS = [
  { level: 6, labelKey: 'roles.level6' },
  { level: 5, labelKey: 'roles.level5' },
  { level: 4, labelKey: 'roles.level4' },
  { level: 3, labelKey: 'roles.level3' },
  { level: 2, labelKey: 'roles.level2' },
  { level: 1, labelKey: 'roles.level1' },
  { level: 0, labelKey: 'roles.level0' },
] as const;

export function getAccessLevelLabel(level: number, t: TranslateFn): string {
  const tier = ACCESS_LEVELS.find((entry) => entry.level === level);
  return tier ? t(tier.labelKey) : t('roles.levelUnknown');
}

export function selectableAccessLevels(maxLevel: number) {
  return ACCESS_LEVELS.filter((entry) => entry.level <= maxLevel);
}
