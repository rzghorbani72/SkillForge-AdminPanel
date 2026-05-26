'use client';

import React from 'react';
import { TemplatePreset } from '@/types/api';
import {
  KajabiThumbnail,
  PodiaThumbnail,
  StanThumbnail,
  CircleThumbnail,
  ModernThumbnail,
  ClassicThumbnail,
  MinimalThumbnail,
  AcademyThumbnail,
  StudentFocusedThumbnail,
  CoursesFirstThumbnail,
  CompactThumbnail
} from './template-thumbnails';

interface TemplatePreviewProps {
  preset: TemplatePreset;
}

const THUMBNAILS: Record<string, () => React.ReactElement> = {
  kajabi: KajabiThumbnail,
  podia: PodiaThumbnail,
  stan: StanThumbnail,
  circle: CircleThumbnail,
  modern: ModernThumbnail,
  classic: ClassicThumbnail,
  minimal: MinimalThumbnail,
  academy: AcademyThumbnail,
  'student-focused': StudentFocusedThumbnail,
  'courses-first': CoursesFirstThumbnail,
  compact: CompactThumbnail
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
  const blocks = preset.blocks.filter((b) => b.isVisible);

  const BLOCK_STYLE: Record<string, { bar: string; h: string }> = {
    header: { bar: 'bg-gray-700', h: 'h-6' },
    hero: { bar: 'bg-indigo-400', h: 'h-16' },
    features: { bar: 'bg-emerald-400', h: 'h-12' },
    courses: { bar: 'bg-purple-400', h: 'h-14' },
    testimonials: { bar: 'bg-amber-400', h: 'h-10' },
    footer: { bar: 'bg-gray-600', h: 'h-6' },
    sidebar: { bar: 'bg-orange-400', h: 'h-full' }
  };

  const hasSidebar = blocks.some((b) => b.type === 'sidebar');
  const sidebarBlock = blocks.find((b) => b.type === 'sidebar');
  const rest = blocks.filter((b) => b.type !== 'sidebar');

  const renderBlock = (block: (typeof blocks)[number]) => {
    const s = BLOCK_STYLE[block.type] ?? { bar: 'bg-gray-400', h: 'h-10' };
    return (
      <div
        key={block.id}
        className={`${s.h} flex items-center justify-center border-b border-white/20 ${s.bar}`}
      >
        <span className="text-[8px] font-semibold uppercase tracking-wider text-white/80">
          {block.type}
        </span>
      </div>
    );
  };

  if (hasSidebar && sidebarBlock) {
    const ss = BLOCK_STYLE['sidebar'];
    return (
      <div className="w-full overflow-hidden rounded-lg border border-border">
        <div className="flex">
          <div
            className={`w-1/4 ${ss.bar} flex items-center justify-center p-2`}
          >
            <span className="text-[7px] font-semibold uppercase text-white/70 [writing-mode:vertical-rl]">
              Sidebar
            </span>
          </div>
          <div className="flex flex-1 flex-col">{rest.map(renderBlock)}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-lg border border-border">
      {blocks.map(renderBlock)}
    </div>
  );
}
