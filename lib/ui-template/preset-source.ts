import type { TemplatePreset } from '@/types/api';

/**
 * The catalog key a preset's design system and category are registered under.
 * A dedicated copy inherits both from the original it was forked from, so
 * everything keyed by the catalog must resolve through here, not through `id`.
 */
export function presetSourceKey(preset: TemplatePreset): string {
  return preset.sourcePresetKey ?? preset.id;
}
