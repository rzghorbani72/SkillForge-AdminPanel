'use client';

import { useTranslation } from '@/lib/i18n/hooks';
import type { FontFamily } from '../sidebar-types';
import { FONT_OPTIONS } from '../sidebar-types';
import { AccordionSection } from '../sidebar-primitives';
import { FontPreview } from './font-preview';

// ── Font Family ───────────────────────────────────────────────────────────────

export const SCRIPT_GROUPS: { script: 'arabic' | 'latin'; labelKey: string }[] = [
  { script: 'arabic', labelKey: 'sitePreview.fontScriptArabic' },
  { script: 'latin', labelKey: 'sitePreview.fontScriptLatin' },
];

export function FontFamilySection({
  fontFamily,
  onFontFamilyChange,
}: {
  fontFamily: FontFamily;
  onFontFamilyChange: (f: FontFamily) => void;
}) {
  const { t } = useTranslation();
  return (
    <AccordionSection title={t('sitePreview.fontFamilyTitle')}>
      <div className="space-y-3">
        <FontPreview fontFamily={fontFamily} />
        {SCRIPT_GROUPS.map(({ script, labelKey }) => {
          const group = FONT_OPTIONS.filter((f) => f.script === script);
          return (
            <div key={script}>
              <p className="mb-1.5 text-[10px] font-semibold text-zinc-500">{t(labelKey)}</p>
              <div className="grid grid-cols-2 gap-1.5">
                {group.map((font) => (
                  <button
                    key={font.slug}
                    type="button"
                    onClick={() => onFontFamilyChange(font.slug)}
                    style={{ fontFamily: font.preview }}
                    className={`rounded-lg border py-2 text-sm font-medium transition-colors ${
                      fontFamily === font.slug
                        ? 'border-blue-500 bg-blue-600 text-white'
                        : 'border-zinc-200 text-zinc-700 hover:border-zinc-400'
                    }`}
                  >
                    {font.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </AccordionSection>
  );
}
