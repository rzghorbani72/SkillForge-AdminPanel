'use client';

import { Check } from 'lucide-react';
import { SectionPreviewFrame } from './section-preview-frame';
import { TEMPLATE_KEYS, getTemplateLabel } from '@/constants/template-names';

// Visible design options for the hero. Each value maps to a `style` the
// edusphere renderer understands; the labels are role-based (what the manager
// sees), never the internal slug. Gallery template names come from the central
// catalog so a rename lands in one place; the legacy styles below are older
// variants kept for academies still published on them.
const HERO_VARIANTS: { value: string; label: string }[] = [
  ...TEMPLATE_KEYS.map((key) => ({ value: key, label: getTemplateLabel(key) })),
  { value: 'default', label: 'کلاسیک' },
  { value: 'expert', label: 'آکادمی تخصصی' },
  { value: 'creator', label: 'سازنده' },
  { value: 'social', label: 'اجتماعی' },
  { value: 'community', label: 'انجمن' },
  { value: 'studio', label: 'استودیو' },
  { value: 'dark-programmer', label: 'تیره' }
];

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

// Zarla-style live design picker: a grid of real hero renders (the academy's
// own theme + content, each forced into a different style). Clicking a card
// applies that design instantly.
export function HeroVariantPicker({
  heroBlockId,
  value,
  onChange,
  preview
}: HeroVariantPickerProps) {
  const current = value || 'default';

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
