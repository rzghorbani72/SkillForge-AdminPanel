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
 * academy name has no length limit, so on its own — or repeated by an old
 * naming bug that kept prepending it — it can blow out a card title or the
 * editor header. Split on the LAST separator so everything before it (the
 * academy, however many times it repeats) gets shortened, while the base
 * template name after it — the meaningful, platform-defined part — always
 * stays fully visible.
 */
export function formatPresetDisplayName(
  name: string,
  maxAcademyChars = 14
): string {
  const separator = ' - ';
  const separatorIndex = name.lastIndexOf(separator);
  if (separatorIndex === -1) return name;

  const academyName = name.slice(0, separatorIndex);
  const templateName = name.slice(separatorIndex + separator.length);
  if (academyName.length <= maxAcademyChars) return name;

  return `${academyName.slice(0, maxAcademyChars)}…${separator}${templateName}`;
}
