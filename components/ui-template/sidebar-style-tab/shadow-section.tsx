'use client';

import { useTranslation } from '@/lib/i18n/hooks';
import type { Shadow } from '../sidebar-types';
import { AccordionSection } from '../sidebar-primitives';

export const SHADOW_OPTIONS: { labelKey: string; value: Shadow; css: string }[] = [
  { labelKey: 'sitePreview.shadowNone', value: 'none', css: 'none' },
  {
    labelKey: 'sitePreview.shadowSubtle',
    value: 'subtle',
    css: '0 1px 2px 0 rgba(0,0,0,0.05)',
  },
  {
    labelKey: 'sitePreview.shadowMedium',
    value: 'medium',
    css: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
  },
  {
    labelKey: 'sitePreview.shadowStrong',
    value: 'strong',
    css: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
  },
];

export function ShadowSection({
  shadow,
  onShadowChange,
}: {
  shadow: Shadow;
  onShadowChange: (s: Shadow) => void;
}) {
  const { t } = useTranslation();
  return (
    <AccordionSection title={t('sitePreview.shadowTitle')}>
      <div className="grid grid-cols-4 gap-1.5">
        {SHADOW_OPTIONS.map(({ labelKey, value, css }) => (
          <button
            key={value}
            type="button"
            onClick={() => onShadowChange(value)}
            className={`flex flex-col items-center gap-1.5 rounded-lg border-2 px-1 py-2 transition-colors ${
              shadow === value
                ? 'border-blue-500 bg-blue-50'
                : 'border-zinc-200 hover:border-zinc-400'
            }`}
          >
            <span className="h-6 w-full rounded bg-white" style={{ boxShadow: css }} />
            <span className="text-[10px] font-medium text-zinc-700">{t(labelKey)}</span>
          </button>
        ))}
      </div>
    </AccordionSection>
  );
}
