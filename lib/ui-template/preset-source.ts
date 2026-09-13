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
 * A dedicated copy is named "<academy name> - <base template name>". Neither
 * part has a length limit at the source, so either one — or old rows saved
 * before a naming bug was fixed — can still blow out a card title or the
 * editor header. Cap each part on its own, then cap the assembled string as
 * a final safety net so no single cause can produce an unbounded name.
 */
export function formatPresetDisplayName(
  name: string,
  maxAcademyChars = 18,
  maxTemplateChars = 24,
  maxTotalChars = 40
): string {
  const separator = ' - ';
  const separatorIndex = name.indexOf(separator);
  if (separatorIndex === -1) return truncate(name, maxTotalChars);

  const academyName = name.slice(0, separatorIndex);
  const templateName = name.slice(separatorIndex + separator.length);

  const shortAcademy = truncate(academyName, maxAcademyChars);
  const shortTemplate = truncate(templateName, maxTemplateChars);
  const result = `${shortAcademy}${separator}${shortTemplate}`;

  return truncate(result, maxTotalChars);
}

function truncate(value: string, maxChars: number): string {
  if (value.length <= maxChars) return value;
  return `${value.slice(0, maxChars)}…`;
}
