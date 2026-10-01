'use client';

import { useTranslation } from '@/lib/i18n/hooks';
import type { TextDirection } from '../sidebar-types';
import { AccordionSection } from '../sidebar-primitives';

// ── Text Direction ────────────────────────────────────────────────────────────

export function DirectionSection({
  textDirection,
  onTextDirectionChange,
}: {
  textDirection: TextDirection;
  onTextDirectionChange: (d: TextDirection) => void;
}) {
  const { t } = useTranslation();
  const options: {
    label: string;
    desc: string;
    icon: string;
    value: TextDirection;
  }[] = [
    {
      label: t('sitePreview.textDirectionRtl'),
      desc: t('sitePreview.textDirectionRtlDesc'),
      icon: '←',
      value: 'rtl',
    },
    {
      label: t('sitePreview.textDirectionLtr'),
      desc: t('sitePreview.textDirectionLtrDesc'),
      icon: '→',
      value: 'ltr',
    },
  ];

  return (
    <AccordionSection title={t('sitePreview.textDirectionTitle')}>
      <div className="space-y-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onTextDirectionChange(opt.value)}
            className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-right transition-all ${
              textDirection === opt.value
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-zinc-200 hover:border-zinc-400'
            }`}
          >
            <span className="text-base font-bold text-zinc-600">{opt.icon}</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-zinc-800">{opt.label}</p>
              <p className="text-[10px] text-zinc-500">{opt.desc}</p>
            </div>
            {textDirection === opt.value && (
              <span className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
            )}
          </button>
        ))}
      </div>
    </AccordionSection>
  );
}
