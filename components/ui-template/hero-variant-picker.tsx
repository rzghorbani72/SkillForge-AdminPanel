'use client';

import { Check } from 'lucide-react';
import { SectionPreviewFrame } from './section-preview-frame';
import { TEMPLATE_KEYS, getTemplateLabel } from '@/constants/template-names';

// Exactly the platform gallery templates — nothing else belongs in the
// sidebar banners list. Legacy HeroBlock styles still render if an old draft
// has them, but managers can only pick from this catalog.
const HERO_VARIANTS: { value: string; label: string }[] = TEMPLATE_KEYS.map(
  (key) => ({ value: key, label: getTemplateLabel(key) })
);

export interface HeroPreviewContext {
  baseUrl: string;
  templateKey: string;
  token: string;
}

interface HeroVariantPickerProps {
  heroBlockId: string;
  value: string;
  onChange: (style: string) => void;
  preview: HeroPreviewContext;
}

// Live design picker: real hero renders (academy theme + content, each
// forced into one platform template). Clicking a card applies that design.
export function HeroVariantPicker({
  heroBlockId,
  value,
  onChange,
  preview
}: HeroVariantPickerProps) {
  const current = value;

  return (
    <div className="space-y-2">
      <span className="text-xs font-medium text-zinc-700">طراحی بنر</span>
      <div className="grid grid-cols-2 gap-2">
        {HERO_VARIANTS.map((variant) => {
          const isSelected = current === variant.value;
          return (
            <button
              key={variant.value}
              type="button"
              onClick={() => onChange(variant.value)}
              title={variant.label}
              className={`group relative overflow-hidden rounded-lg border text-right transition-colors ${
                isSelected
                  ? 'border-blue-500 ring-2 ring-blue-500/40'
                  : 'border-zinc-200 hover:border-zinc-400'
              }`}
            >
              <div className="relative aspect-[16/10] w-full bg-zinc-100">
                <SectionPreviewFrame
                  baseUrl={preview.baseUrl}
                  templateKey={preview.templateKey}
                  token={preview.token}
                  blockId={heroBlockId}
                  params={{ heroStyle: variant.value }}
                  className="h-full w-full"
                />
                {isSelected && (
                  <span className="absolute end-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white">
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </div>
              <span className="block truncate px-2 py-1 text-[11px] font-medium text-zinc-700">
                {variant.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
