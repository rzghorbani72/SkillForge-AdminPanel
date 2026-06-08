'use client';

import { TemplatePreset } from '@/types/api';
import { useTranslation } from '@/lib/i18n/hooks';

interface TemplatePreviewProps {
  preset: TemplatePreset;
}

export function TemplatePreview({ preset }: TemplatePreviewProps) {
  return <SimpleBlockPreview preset={preset} />;
}

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
    'course-grid': { bar: 'bg-purple-400', h: 'h-14' },
    testimonials: { bar: 'bg-amber-400', h: 'h-10' },
    marquee: { bar: 'bg-slate-300', h: 'h-3' },
    pricing: { bar: 'bg-teal-400', h: 'h-14' },
    cta: { bar: 'bg-rose-400', h: 'h-10' },
    footer: { bar: 'bg-gray-600', h: 'h-6' }
  };

  const renderBlock = (block: (typeof blocks)[number]) => {
    const s = BLOCK_STYLE[block.type] ?? { bar: 'bg-gray-400', h: 'h-10' };
    return (
      <div key={block.id} className="px-2 py-1">
        <div className={`${s.bar} ${s.h} w-full rounded-sm opacity-80`} />
        <p className="mt-0.5 text-[8px] text-gray-500">
          {blockLabels[block.type] ?? block.type}
        </p>
      </div>
    );
  };

  return (
    <div className="w-full bg-white">
      <div className="border-b border-gray-100 px-2 py-1.5">
        <p className="truncate text-[9px] font-semibold text-gray-800">
          {preset.name}
        </p>
      </div>
      <div className="divide-y divide-gray-50">
        {blocks.length > 0 ? (
          blocks.map(renderBlock)
        ) : (
          <p className="px-2 py-4 text-center text-[8px] text-gray-400">
            بدون بلوک
          </p>
        )}
      </div>
    </div>
  );
}
