import type { TemplatePreset } from '@/types/api';

/**
 * The catalog key a preset's design system and category are registered under.
 * A dedicated copy inherits both from the original it was forked from, so
 * everything keyed by the catalog must resolve through here, not through `id`.
 */
export function presetSourceKey(preset: TemplatePreset): string {
  return preset.sourcePresetKey ?? preset.id;
}

/**
 * A dedicated copy is named "<academy name> - <base template name>". The
 * academy name has no length limit, so on its own it can blow out a card
 * title or the editor header — shorten only that part, never the template
 * name, and leave any other preset name untouched.
 */
export function formatPresetDisplayName(
  name: string,
  maxAcademyChars = 18
): string {
  const separator = ' - ';
  const separatorIndex = name.indexOf(separator);
  if (separatorIndex === -1) return name;

  const academyName = name.slice(0, separatorIndex);
  const templateName = name.slice(separatorIndex + separator.length);
  if (academyName.length <= maxAcademyChars) return name;

  return `${academyName.slice(0, maxAcademyChars)}…${separator}${templateName}`;
}
