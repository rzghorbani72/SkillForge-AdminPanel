'use client';

import { AlignCenter, AlignLeft, AlignRight } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';

type HeroAlign = 'start' | 'center' | 'end';

// Logical values: in the RTL panel "start" is the right edge.
const OPTIONS: {
  value: HeroAlign;
  labelKey: string;
  Icon: typeof AlignRight;
}[] = [
  { value: 'start', labelKey: 'sitePreview.panelAlignRight', Icon: AlignRight },
  {
    value: 'center',
    labelKey: 'sitePreview.panelAlignCenter',
    Icon: AlignCenter,
  },
  { value: 'end', labelKey: 'sitePreview.panelAlignLeft', Icon: AlignLeft },
];

export function HeroAlignPicker({
  value,
  onChange,
}: {
  value: unknown;
  onChange: (align: HeroAlign) => void;
}) {
  const { t } = useTranslation();
  const current: HeroAlign = value === 'start' || value === 'end' ? value : 'center';

  return (
    <div>
      <span className="mb-1.5 block text-xs text-zinc-600">
        {t('sitePreview.panelTextAlignment')}
      </span>
      <div className="grid grid-cols-3 gap-1.5">
        {OPTIONS.map(({ value: align, labelKey, Icon }) => (
          <button
            key={align}
            type="button"
            onClick={() => onChange(align)}
            className={`flex items-center justify-center gap-1 rounded border py-1.5 text-[11px] font-medium transition-colors ${
              current === align
                ? 'border-blue-500 bg-blue-600 text-white'
                : 'border-zinc-300 text-zinc-700 hover:bg-zinc-100'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {t(labelKey)}
          </button>
        ))}
      </div>
    </div>
  );
}
