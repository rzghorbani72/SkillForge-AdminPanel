'use client';

import { useTranslation } from '@/lib/i18n/hooks';
import type { BorderRadius } from '../sidebar-types';
import { AccordionSection } from '../sidebar-primitives';

// Ordered by how round each option actually renders. The px values are the
// single source of truth shared with Backend theme-css.util.ts and edusphere
// theme-apply.ts — if those maps change, change these together or the sidebar
// preview stops matching the published site.
export const RADIUS_PRESETS: {
  labelKey: string;
  value: BorderRadius;
  px: number;
}[] = [
  { labelKey: 'sitePreview.cornerSharp', value: 'sharp', px: 4 },
  { labelKey: 'sitePreview.cornerRound', value: 'rounded', px: 16 },
  { labelKey: 'sitePreview.cornerExtraRound', value: 'soft', px: 24 },
];

// ── Rounded Corners ───────────────────────────────────────────────────────────

export function RoundedCornersSection({
  borderRadius,
  onBorderRadiusChange,
}: {
  borderRadius: BorderRadius;
  onBorderRadiusChange: (r: BorderRadius) => void;
}) {
  const { t } = useTranslation();

  return (
    <AccordionSection title={t('sitePreview.cornerRadius')}>
      <div className="grid grid-cols-3 gap-1.5">
        {RADIUS_PRESETS.map(({ labelKey, value, px }) => {
          const selected = borderRadius === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => onBorderRadiusChange(value)}
              className={`flex flex-col items-center gap-1.5 rounded-lg border-2 px-2 py-2.5 transition-colors ${
                selected ? 'border-blue-500 bg-blue-50' : 'border-zinc-200 hover:border-zinc-400'
              }`}
            >
              <span
                className="h-8 w-full border-2 border-zinc-400 bg-white"
                style={{ borderRadius: `${px}px` }}
              />
              <span className="text-[11px] font-medium text-zinc-700">{t(labelKey)}</span>
            </button>
          );
        })}
      </div>
    </AccordionSection>
  );
}
