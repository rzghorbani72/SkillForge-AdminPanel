'use client';

import { TemplatePreset, UIBlockConfig } from '@/types/api';
import { useTranslation } from '@/lib/i18n/hooks';

interface TemplatePreviewProps {
  preset: TemplatePreset;
}

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
  categories: { bar: 'bg-green-400', h: 'h-4' },
  projects: { bar: 'bg-lime-400', h: 'h-16' },
  slideshow: { bar: 'bg-indigo-400', h: 'h-16' },
  footer: { bar: 'bg-gray-600', h: 'h-6' }
};

// Single renderer for a block's visual output — gallery preview cards and the
// sidebar section list both use it, so thumbnails reflect the real config
// (background image/color, heading text) instead of a label or icon.
export function BlockThumbnail({ block }: { block: UIBlockConfig }) {
  const s = BLOCK_STYLE[block.type] ?? { bar: 'bg-gray-400', h: 'h-10' };
  const cfg = block.config ?? {};
  const bgImage =
    typeof cfg.bgImage === 'string' && cfg.bgImage
      ? cfg.bgImage
      : typeof cfg.backgroundImage === 'string' && cfg.backgroundImage
        ? cfg.backgroundImage
        : null;
  const bgColor =
    cfg.bgType === 'solid' && typeof cfg.bgColor === 'string'
      ? cfg.bgColor
      : null;
  const title =
    typeof cfg.title === 'string' && cfg.title
      ? cfg.title
      : typeof cfg.heading === 'string' && cfg.heading
        ? cfg.heading
        : null;

  return (
    <div className={`relative w-full overflow-hidden rounded-sm ${s.h}`}>
      {bgImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={bgImage} alt="" className="h-full w-full object-cover" />
      ) : (
        <div
          className={`h-full w-full opacity-80 ${bgColor ? '' : s.bar}`}
          style={bgColor ? { background: bgColor } : undefined}
        />
      )}
      {title && (
        <span className="absolute inset-0 flex items-center justify-center overflow-hidden px-1 text-center text-[8px] font-medium leading-tight text-white drop-shadow">
          {title}
        </span>
      )}
    </div>
  );
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

  return (
    <div className="w-full bg-white">
      <div className="border-b border-gray-100 px-2 py-1.5">
        <p className="truncate text-[9px] font-semibold text-gray-800">
          {preset.name}
        </p>
      </div>
      <div className="divide-y divide-gray-50">
        {blocks.length > 0 ? (
          blocks.map((block) => (
            <div key={block.id} className="px-2 py-1">
              <BlockThumbnail block={block} />
              <p className="mt-0.5 text-[8px] text-gray-500">
                {blockLabels[block.type] ?? block.type}
              </p>
            </div>
          ))
        ) : (
          <p className="px-2 py-4 text-center text-[8px] text-gray-400">
            بدون بلوک
          </p>
        )}
      </div>
    </div>
  );
}
