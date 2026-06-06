'use client';

import {
  ChevronUp,
  ChevronDown,
  GripVertical,
  Plus,
  Trash2
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { UIBlockConfig } from '@/types/api';
import { useTranslation } from '@/lib/i18n/hooks';

interface BlocksListProps {
  blocks: UIBlockConfig[];
  activeBlockId: string | null;
  onSelectBlock: (blockId: string) => void;
  onToggleVisibility: (blockId: string, visible: boolean) => void;
  onMoveUp: (blockId: string) => void;
  onMoveDown: (blockId: string) => void;
  onAddSection: () => void;
  onRemoveBlock: (blockId: string) => void;
}

const BLOCK_ACCENT: Record<string, string> = {
  header: 'bg-slate-100 text-slate-700',
  hero: 'bg-rose-100 text-rose-700',
  features: 'bg-purple-100 text-purple-700',
  courses: 'bg-indigo-100 text-indigo-700',
  testimonials: 'bg-amber-100 text-amber-700',
  slideshow: 'bg-cyan-100 text-cyan-700',
  footer: 'bg-slate-200 text-slate-700'
};

export function BlocksList({
  blocks,
  activeBlockId,
  onSelectBlock,
  onToggleVisibility,
  onMoveUp,
  onMoveDown,
  onAddSection,
  onRemoveBlock
}: BlocksListProps) {
  const { t } = useTranslation();

  const sorted = [...blocks].sort((a, b) => a.order - b.order);

  const getLabel = (type: string) => {
    const map: Record<string, string> = {
      header: t('settings.header'),
      hero: t('settings.heroSection'),
      features: t('settings.featuresSection'),
      courses: t('settings.coursesSection'),
      testimonials: t('settings.testimonials'),
      slideshow: 'اسلایدشو / بنر',
      footer: t('settings.footer')
    };
    return map[type] ?? type;
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <p className="text-sm font-semibold">{t('settings.pageBlocks')}</p>
        <span className="text-xs text-muted-foreground">
          {t('settings.currentlyActive')}:{' '}
          {blocks.filter((b) => b.isVisible).length}
        </span>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto p-2">
        {sorted.map((block, idx) => {
          const isActive = block.id === activeBlockId;
          const accentClass =
            BLOCK_ACCENT[block.type] ?? 'bg-gray-100 text-gray-700';

          return (
            <div
              key={block.id}
              className={`group flex cursor-pointer items-center gap-2 rounded-lg border px-2 py-2.5 transition-all ${
                isActive
                  ? 'border-primary bg-primary/5'
                  : 'border-transparent hover:border-border hover:bg-accent/40'
              }`}
              onClick={() => onSelectBlock(block.id)}
            >
              <GripVertical className="h-4 w-4 flex-shrink-0 text-muted-foreground/40" />

              <span
                className={`flex-shrink-0 rounded px-1.5 py-0.5 text-xs font-medium ${accentClass}`}
              >
                {idx + 1}
              </span>

              <span className="flex-1 truncate text-sm font-medium">
                {getLabel(block.type)}
              </span>

              <div className="flex flex-shrink-0 items-center gap-1">
                <button
                  type="button"
                  title={t('settings.moveUp')}
                  disabled={idx === 0}
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveUp(block.id);
                  }}
                  className="rounded p-0.5 hover:bg-accent disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  title={t('settings.moveDown')}
                  disabled={idx === sorted.length - 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveDown(block.id);
                  }}
                  className="rounded p-0.5 hover:bg-accent disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                <Switch
                  checked={block.isVisible}
                  onCheckedChange={(checked) => {
                    onToggleVisibility(block.id, checked);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="scale-75"
                />
                <button
                  type="button"
                  title={t('settings.removeBlock')}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveBlock(block.id);
                  }}
                  className="rounded p-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {sorted.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-sm text-muted-foreground">
            <Plus className="h-8 w-8 opacity-30" />
            <p>{t('settings.noBlocksMessage')}</p>
          </div>
        )}
      </div>

      <Separator />
      <div className="space-y-2 px-4 py-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          onClick={onAddSection}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          {t('settings.addSectionFromLibrary')}
        </Button>
        <p className="text-xs text-muted-foreground">
          {t('settings.pageBlocksDescription')}
        </p>
      </div>
    </div>
  );
}
