'use client';

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ArrowLeftRight, Lock, Plus, EyeOff } from 'lucide-react';
import { BlockThumbnail } from '@/components/ui-template/template-preview';
import type { UIBlockConfig } from '@/types/api';
import { useTranslation } from '@/lib/i18n/hooks';

const BLOCK_TAG: Record<string, string> = {
  header: 'nav',
  hero: 'section',
  features: 'section',
  courses: 'section',
  testimonials: 'section',
  slideshow: 'section',
  footer: 'div',
  sidebar: 'div'
};

function useBlockLabel() {
  const { t } = useTranslation();
  return (type: string) => {
    const key =
      'sitePreview.block' +
      type
        .split('-')
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join('');
    return t(key) || type;
  };
}

function PinnedRow({
  block,
  isSelected,
  onSelect,
  onReplace
}: {
  block: UIBlockConfig;
  isSelected: boolean;
  onSelect?: () => void;
  onReplace: () => void;
}) {
  const blockLabel = useBlockLabel();
  const isHidden = block.isVisible === false;
  return (
    <div
      className={`rounded-lg border p-1.5 transition-opacity ${
        isSelected
          ? 'border-blue-500/60 bg-blue-500/10'
          : 'border-zinc-700/60 bg-zinc-800/30'
      } ${isHidden ? 'opacity-50' : ''}`}
    >
      <button
        type="button"
        title={blockLabel(block.type)}
        onClick={onSelect}
        className="block w-full"
      >
        <BlockThumbnail block={block} />
      </button>
      <div className="mt-1 flex items-center gap-2">
        <Lock className="h-3 w-3 flex-shrink-0 text-zinc-600" />
        <button
          type="button"
          onClick={onSelect}
          className="flex-1 text-right text-xs text-zinc-300 hover:text-zinc-100"
        >
          {blockLabel(block.type)}
          {isHidden && (
            <EyeOff className="mr-1 inline h-2.5 w-2.5 text-zinc-500" />
          )}
        </button>
        <button
          type="button"
          title="جایگزینی بخش"
          onClick={onReplace}
          className="text-zinc-500 transition-colors hover:text-zinc-200"
        >
          <ArrowLeftRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function SortableRow({
  block,
  isSelected,
  onSelect,
  onReplace
}: {
  block: UIBlockConfig;
  isSelected: boolean;
  onSelect?: () => void;
  onReplace: () => void;
}) {
  const blockLabel = useBlockLabel();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: block.id });
  const isHidden = block.isVisible === false;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`rounded-lg border p-1.5 transition-opacity ${
        isSelected
          ? 'border-blue-500/60 bg-blue-500/10'
          : 'border-transparent bg-zinc-800/60'
      } ${isDragging ? 'opacity-60' : ''} ${isHidden ? 'opacity-50' : ''}`}
    >
      <button
        type="button"
        title={blockLabel(block.type)}
        onClick={onSelect}
        className="block w-full"
      >
        <BlockThumbnail block={block} />
      </button>
      <div className="mt-1 flex items-center gap-2">
        <button
          type="button"
          title="جابه‌جایی"
          className="cursor-grab text-zinc-500 transition-colors hover:text-zinc-200 active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onSelect}
          className="flex-1 text-right text-xs text-zinc-300 hover:text-zinc-100"
        >
          {blockLabel(block.type)}
          {isHidden && (
            <EyeOff className="mr-1 inline h-2.5 w-2.5 text-zinc-500" />
          )}
        </button>
        <span className="rounded bg-zinc-700 px-1.5 py-0.5 font-mono text-[9px] text-zinc-400">
          {BLOCK_TAG[block.type] ?? 'div'}
        </span>
        <button
          type="button"
          title="جایگزینی بخش"
          onClick={onReplace}
          className="text-zinc-500 transition-colors hover:text-zinc-200"
        >
          <ArrowLeftRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export interface SidebarSectionsTabProps {
  blocks: UIBlockConfig[];
  onBlocksChange: (blocks: UIBlockConfig[]) => void;
  onOpenPicker: (target?: { blockId: string; type: string }) => void;
  selectedBlockId?: string | null;
  onSelectBlock?: (id: string) => void;
}

export function SidebarSectionsTab({
  blocks,
  onBlocksChange,
  onOpenPicker,
  selectedBlockId,
  onSelectBlock
}: SidebarSectionsTabProps) {
  const sensors = useSensors(useSensor(PointerSensor));
  const sorted = [...blocks].sort((a, b) => a.order - b.order);
  const header = sorted.find((b) => b.type === 'header') ?? null;
  const footer = sorted.find((b) => b.type === 'footer') ?? null;
  const middle = sorted.filter(
    (b) => b.type !== 'header' && b.type !== 'footer'
  );

  const reorder = (next: UIBlockConfig[]) => {
    const ordered = [
      ...(header ? [header] : []),
      ...next,
      ...(footer ? [footer] : [])
    ].map((block, index) => ({ ...block, order: index + 1 }));
    onBlocksChange(ordered);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = middle.findIndex((b) => b.id === active.id);
    const to = middle.findIndex((b) => b.id === over.id);
    if (from === -1 || to === -1) return;
    reorder(arrayMove(middle, from, to));
  };

  const replace = (block: UIBlockConfig) => () =>
    onOpenPicker({ blockId: block.id, type: block.type });
  const select = (block: UIBlockConfig) => () => onSelectBlock?.(block.id);

  return (
    <div className="space-y-1 p-3">
      {header && (
        <PinnedRow
          block={header}
          isSelected={selectedBlockId === header.id}
          onSelect={select(header)}
          onReplace={replace(header)}
        />
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={middle.map((b) => b.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-1">
            {middle.map((block) => (
              <SortableRow
                key={block.id}
                block={block}
                isSelected={selectedBlockId === block.id}
                onSelect={select(block)}
                onReplace={replace(block)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {footer && (
        <PinnedRow
          block={footer}
          isSelected={selectedBlockId === footer.id}
          onSelect={select(footer)}
          onReplace={replace(footer)}
        />
      )}
      <button
        type="button"
        onClick={() => onOpenPicker()}
        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-zinc-600 py-2 text-xs text-zinc-400 transition-colors hover:border-blue-500 hover:text-blue-400"
      >
        <Plus className="h-3.5 w-3.5" />
        افزودن بخش
      </button>
    </div>
  );
}
