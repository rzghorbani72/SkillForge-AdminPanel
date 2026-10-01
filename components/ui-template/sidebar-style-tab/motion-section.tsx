'use client';

import { useTranslation } from '@/lib/i18n/hooks';
import type { ElementAnimation } from '../sidebar-types';
import { AccordionSection } from '../sidebar-primitives';

// ── Motion & Shadow ───────────────────────────────────────────────────────────

export const MOTION_OPTIONS: { labelKey: string; value: ElementAnimation }[] = [
  { labelKey: 'sitePreview.motionNone', value: 'none' },
  { labelKey: 'sitePreview.motionSubtle', value: 'subtle' },
  { labelKey: 'sitePreview.motionModerate', value: 'moderate' },
  { labelKey: 'sitePreview.motionDynamic', value: 'dynamic' },
];

export function MotionSection({
  elementAnimation,
  onElementAnimationChange,
}: {
  elementAnimation: ElementAnimation;
  onElementAnimationChange: (a: ElementAnimation) => void;
}) {
  const { t } = useTranslation();
  return (
    <AccordionSection title={t('sitePreview.motionTitle')}>
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-1.5">
          {MOTION_OPTIONS.map(({ labelKey, value }) => (
            <button
              key={value}
              type="button"
              onClick={() => onElementAnimationChange(value)}
              className={`rounded-lg border py-2 text-[11px] font-medium transition-colors ${
                elementAnimation === value
                  ? 'border-blue-500 bg-blue-600 text-white'
                  : 'border-zinc-200 text-zinc-700 hover:border-zinc-400'
              }`}
            >
              {t(labelKey)}
            </button>
          ))}
        </div>
        <p className="text-[10px] leading-relaxed text-zinc-500">{t('sitePreview.motionHint')}</p>
      </div>
    </AccordionSection>
  );
}
