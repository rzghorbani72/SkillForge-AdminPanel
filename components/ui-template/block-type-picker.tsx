'use client';

import {
  ImageIcon,
  LayoutGrid,
  Layers,
  Megaphone,
  Play,
  Sparkles,
  Star,
  Tag,
  Users
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import { ADDABLE_SECTION_TYPES } from '@/lib/ui-template/addable-section-types';

const TYPE_ICONS: Record<string, typeof Sparkles> = {
  hero: Sparkles,
  slideshow: ImageIcon,
  features: Layers,
  courses: LayoutGrid,
  testimonials: Star,
  pricing: Tag,
  cta: Megaphone,
  categories: LayoutGrid,
  projects: Layers,
  marquee: Play,
  'course-grid': LayoutGrid,
  membership: Users
};

interface BlockTypePickerProps {
  onSelect: (type: string) => void;
}

/** Translation key for a block type's display name, e.g. 'hero' -> 'sitePreview.blockHero'. */
export function blockTypeLabelKey(type: string): string {
  return (
    'sitePreview.block' +
    type
      .split('-')
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join('')
  );
}

/** Grid of section types shown when an empty placeholder slot is selected. */
export function BlockTypePicker({ onSelect }: BlockTypePickerProps) {
  const { t } = useTranslation();

  const blockLabel = (type: string) => t(blockTypeLabelKey(type)) || type;

  return (
    <div className="mt-4 space-y-3">
      <p className="text-xs font-medium text-zinc-700">
        {t('sitePreview.chooseBlockType')}
      </p>
      <div className="grid grid-cols-2 gap-2">
        {ADDABLE_SECTION_TYPES.map((type) => {
          const Icon = TYPE_ICONS[type] ?? Layers;
          return (
            <button
              key={type}
              type="button"
              onClick={() => onSelect(type)}
              className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-right text-xs font-medium text-zinc-800 transition-colors hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
            >
              <Icon className="h-4 w-4 shrink-0 text-zinc-500" />
              <span className="truncate">{blockLabel(type)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
