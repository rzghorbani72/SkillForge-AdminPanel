'use client';

import { TemplatePreset } from '@/types/api';
import { Card } from '@/components/ui/card';

interface TemplatePreviewProps {
  preset: TemplatePreset;
  scale?: number;
}

export function TemplatePreview({ preset, scale = 1 }: TemplatePreviewProps) {
  const blocks = preset.blocks.filter((b) => b.isVisible);

  const getBlockColor = (type: string) => {
    const colors: Record<string, string> = {
      header:
        'bg-gradient-to-r from-slate-400 to-slate-500 dark:from-slate-600 dark:to-slate-700',
      hero: 'bg-gradient-to-r from-blue-400 to-blue-500 dark:from-blue-600 dark:to-blue-700',
      features:
        'bg-gradient-to-r from-emerald-400 to-emerald-500 dark:from-emerald-600 dark:to-emerald-700',
      courses:
        'bg-gradient-to-r from-purple-400 to-purple-500 dark:from-purple-600 dark:to-purple-700',
      testimonials:
        'bg-gradient-to-r from-amber-400 to-amber-500 dark:from-amber-600 dark:to-amber-700',
      footer:
        'bg-gradient-to-r from-slate-500 to-slate-600 dark:from-slate-700 dark:to-slate-800',
      sidebar:
        'bg-gradient-to-r from-amber-400 to-amber-500 dark:from-amber-600 dark:to-amber-700'
    };
    return (
      colors[type] ||
      'bg-gradient-to-r from-gray-400 to-gray-500 dark:from-gray-600 dark:to-gray-700'
    );
  };

  const getBlockLabel = (type: string) => {
    const labels: Record<string, string> = {
      header: 'Header',
      hero: 'Hero',
      features: 'Features',
      courses: 'Courses',
      testimonials: 'Testimonials',
      footer: 'Footer',
      sidebar: 'Sidebar'
    };
    return labels[type] || type;
  };

  const hasSidebar = blocks.some((b) => b.type === 'sidebar');
  const sidebarBlock = blocks.find((b) => b.type === 'sidebar');
  const otherBlocks = blocks.filter((b) => b.type !== 'sidebar');

  if (hasSidebar && sidebarBlock) {
    const sidebarPosition = sidebarBlock.config?.position || 'left';
    const isLeftSidebar = sidebarPosition === 'left';

    return (
      <div
        className="w-full overflow-hidden rounded-lg border-2 border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900"
        style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
      >
        <div
          className={`flex ${isLeftSidebar ? 'flex-row' : 'flex-row-reverse'}`}
        >
          {/* Sidebar */}
          <div className="w-1/4 border-r border-slate-200 dark:border-slate-700">
            <div
              className={`h-full ${getBlockColor('sidebar')} p-2 text-center text-xs font-medium text-slate-700 dark:text-slate-200`}
            >
              {getBlockLabel('sidebar')}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex flex-1 flex-col">
            {otherBlocks.map((block) => {
              const isHero = block.type === 'hero';
              const isCourses = block.type === 'courses';
              const isFeatures = block.type === 'features';

              let height = 'h-12';
              if (isHero) height = 'h-20';
              else if (isCourses) height = 'h-16';
              else if (isFeatures) height = 'h-14';

              // Features might be in grid
              if (isFeatures && block.config?.gridColumns) {
                const cols = block.config.gridColumns;
                return (
                  <div
                    key={block.id}
                    className={`${height} border-b border-slate-200 dark:border-slate-700`}
                  >
                    <div
                      className={`${getBlockColor(block.type)} flex h-full items-center justify-center gap-1 p-2 text-center text-xs font-semibold text-white shadow-sm`}
                    >
                      <span>{getBlockLabel(block.type)}</span>
                      <span className="text-[10px] opacity-70">
                        ({cols} cols)
                      </span>
                    </div>
                  </div>
                );
              }

              // Courses might be in grid
              if (isCourses && block.config?.gridColumns) {
                const cols = block.config.gridColumns;
                return (
                  <div
                    key={block.id}
                    className={`${height} border-b border-slate-200 dark:border-slate-700`}
                  >
                    <div
                      className={`${getBlockColor(block.type)} flex h-full items-center justify-center gap-1 p-2 text-center text-xs font-semibold text-white shadow-sm`}
                    >
                      <span>{getBlockLabel(block.type)}</span>
                      <span className="text-[10px] opacity-70">
                        ({cols}x{Math.ceil((block.config?.limit || 6) / cols)})
                      </span>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={block.id}
                  className={`${height} border-b border-slate-200 dark:border-slate-700`}
                >
                  <div
                    className={`${getBlockColor(block.type)} flex h-full items-center justify-center p-2 text-center text-xs font-semibold text-white shadow-sm`}
                  >
                    {getBlockLabel(block.type)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Standard layout without sidebar
  return (
    <div
      className="w-full overflow-hidden rounded-lg border-2 border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900"
      style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
    >
      {blocks.map((block, index) => {
        const isHeader = block.type === 'header';
        const isHero = block.type === 'hero';
        const isCourses = block.type === 'courses';
        const isFeatures = block.type === 'features';
        const isFooter = block.type === 'footer';
        const isTestimonials = block.type === 'testimonials';

        let height = 'h-10';
        if (isHeader) height = 'h-8';
        else if (isHero) {
          const heroHeight = block.config?.height || 'medium';
          height =
            heroHeight === 'large'
              ? 'h-24'
              : heroHeight === 'small'
                ? 'h-12'
                : 'h-16';
        } else if (isCourses) height = 'h-20';
        else if (isFeatures) height = 'h-16';
        else if (isTestimonials) height = 'h-14';
        else if (isFooter) height = 'h-10';

        // Features grid preview
        if (isFeatures && block.config?.gridColumns) {
          const cols = block.config.gridColumns;
          return (
            <div
              key={block.id}
              className={`${height} relative border-b dark:border-slate-700`}
            >
              <div
                className={`${getBlockColor(block.type)} flex h-full items-center justify-center gap-1 p-2 text-center text-xs font-semibold text-white shadow-sm`}
              >
                <span>{getBlockLabel(block.type)}</span>
                <span className="text-[10px] opacity-70">({cols} cols)</span>
              </div>
              {/* Grid visual indicator */}
              <div className="absolute bottom-1 left-1/2 flex -translate-x-1/2 transform gap-0.5">
                {Array.from({ length: cols }).map((_, i) => (
                  <div
                    key={i}
                    className="h-1 w-1 rounded bg-slate-600 dark:bg-slate-400"
                  />
                ))}
              </div>
            </div>
          );
        }

        // Courses grid preview
        if (isCourses && block.config?.gridColumns) {
          const cols = block.config.gridColumns;
          const rows = Math.ceil((block.config?.limit || 6) / cols);
          return (
            <div
              key={block.id}
              className={`${height} relative border-b dark:border-slate-700`}
            >
              <div
                className={`${getBlockColor(block.type)} flex h-full items-center justify-center gap-1 p-2 text-center text-xs font-semibold text-white shadow-sm`}
              >
                <span>{getBlockLabel(block.type)}</span>
                <span className="text-[10px] opacity-70">
                  ({cols}x{rows})
                </span>
              </div>
              {/* Grid visual indicator */}
              <div className="absolute bottom-1 left-1/2 flex max-w-[80%] -translate-x-1/2 transform flex-wrap justify-center gap-0.5">
                {Array.from({ length: Math.min(cols * 2, 6) }).map((_, i) => (
                  <div
                    key={i}
                    className="h-1 w-1 rounded bg-slate-600 dark:bg-slate-400"
                  />
                ))}
              </div>
            </div>
          );
        }

        return (
          <div
            key={block.id}
            className={`${height} border-b dark:border-slate-700`}
          >
            <div
              className={`${getBlockColor(block.type)} flex h-full items-center justify-center p-2 text-center text-xs font-semibold text-white shadow-sm`}
            >
              {getBlockLabel(block.type)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
