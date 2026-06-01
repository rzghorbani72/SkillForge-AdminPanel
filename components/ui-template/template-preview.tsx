'use client';

import React from 'react';
import { TemplatePreset } from '@/types/api';
import { useTranslation } from '@/lib/i18n/hooks';
import {
  KajabiThumbnail,
  PodiaThumbnail,
  StanThumbnail,
  CircleThumbnail,
  RocketThumbnail,
  ModernThumbnail,
  ClassicThumbnail,
  MinimalThumbnail,
  AcademyThumbnail,
  StudentFocusedThumbnail,
  CoursesFirstThumbnail,
  CompactThumbnail,
  FeaturedThumbnail
} from './template-thumbnails';

interface TemplatePreviewProps {
  preset: TemplatePreset;
}

const THUMBNAILS: Record<string, () => React.ReactElement> = {
  kajabi: KajabiThumbnail,
  podia: PodiaThumbnail,
  stan: StanThumbnail,
  circle: CircleThumbnail,
  rocket: RocketThumbnail,
  modern: ModernThumbnail,
  classic: ClassicThumbnail,
  minimal: MinimalThumbnail,
  academy: AcademyThumbnail,
  'student-focused': StudentFocusedThumbnail,
  'courses-first': CoursesFirstThumbnail,
  compact: CompactThumbnail,
  featured: FeaturedThumbnail
};

export function TemplatePreview({ preset }: TemplatePreviewProps) {
  const Thumb = THUMBNAILS[preset.id];
  if (Thumb) {
    return (
      <div className="w-full overflow-hidden">
        <Thumb />
      </div>
    );
  }
  return <SimpleBlockPreview preset={preset} />;
}

// ── Fallback wireframe for any unlisted preset ────────────────────────────────

function SimpleBlockPreview({ preset }: { preset: TemplatePreset }) {
  const { t } = useTranslation();
  const blocks = preset.blocks.filter((b) => b.isVisible);

  const blockLabels: Record<string, string> = {
    header: t('sitePreview.blockHeader'),
    hero: t('sitePreview.blockHero'),
    features: t('sitePreview.blockFeatures'),
    courses: t('sitePreview.blockCourses'),
    testimonials: t('sitePreview.blockTestimonials'),
    footer: t('sitePreview.blockFooter')
  };

  const BLOCK_STYLE: Record<string, { bar: string; h: string }> = {
    header: { bar: 'bg-gray-700', h: 'h-6' },
    hero: { bar: 'bg-indigo-400', h: 'h-16' },
    features: { bar: 'bg-emerald-400', h: 'h-12' },
    courses: { bar: 'bg-purple-400', h: 'h-14' },
    testimonials: { bar: 'bg-amber-400', h: 'h-10' },
    footer: { bar: 'bg-gray-600', h: 'h-6' }
  };

  const renderBlock = (block: (typeof blocks)[number]) => {
    const s = BLOCK_STYLE[block.type] ?? { bar: 'bg-gray-400', h: 'h-10' };
    return (
      <div
        key={block.id}
        className={`${s.h} flex items-center justify-center border-b border-white/20 ${s.bar}`}
      >
        <span className="text-[8px] font-semibold tracking-wider text-white/80">
          {blockLabels[block.type] ?? block.type}
        </span>
      </div>
    );
  };

  return (
    <div
      dir="rtl"
      className="w-full overflow-hidden rounded-lg border border-border"
    >
      {blocks.map(renderBlock)}
    </div>
  );
}
