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
import {
  GripVertical,
  ArrowLeftRight,
  Lock,
  Plus,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  type LucideIcon
} from 'lucide-react';
import { BlockThumbnail } from '@/components/ui-template/template-preview';
import type { UIBlockConfig } from '@/types/api';
import { useTranslation } from '@/lib/i18n/hooks';
import { useSwappableSectionTypes } from '@/lib/ui-template/use-swappable-types';

// Per-section quick actions, surfaced on the row like Wix's section toolbar so
// hide / duplicate / swap / delete are one click instead of buried in a panel.
interface RowActionHandlers {
  onReplace: () => void;
  onDuplicate: (id: string) => void;
  onToggleVisible: (id: string, visible: boolean) => void;
  onDelete: (id: string) => void;
}

function IconButton({
  icon: Icon,
  title,
  onClick,
  danger
}: {
  icon: LucideIcon;
  title: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className={`rounded p-1 text-zinc-500 transition-colors ${
        danger
          ? 'hover:bg-red-500/10 hover:text-red-400'
          : 'hover:text-zinc-200'
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}

function RowActions({
  block,
  canSwap,
  onReplace,
  onDuplicate,
  onToggleVisible,
  onDelete
}: { block: UIBlockConfig; canSwap: boolean } & RowActionHandlers) {
  const isVisible = block.isVisible !== false;
  return (
    <div className="flex items-center gap-0.5">
      <IconButton
        icon={isVisible ? Eye : EyeOff}
        title={isVisible ? 'پنهان کردن' : 'نمایش'}
        onClick={() => onToggleVisible(block.id, !isVisible)}
      />
      <IconButton
        icon={Copy}
        title="تکثیر"
        onClick={() => onDuplicate(block.id)}
      />
      {canSwap && (
        <IconButton
          icon={ArrowLeftRight}
          title="تغییر طراحی بخش"
          onClick={onReplace}
        />
      )}
      <IconButton
        icon={Trash2}
        title="حذف"
        danger
        onClick={() => onDelete(block.id)}
      />
    </div>
  );
}

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
  canSwap,
  onSelect,
  onReplace
}: {
  block: UIBlockConfig;
  isSelected: boolean;
  canSwap: boolean;
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
        {canSwap && (
          <button
            type="button"
            title="تغییر طراحی بخش"
            onClick={onReplace}
            className="text-zinc-500 transition-colors hover:text-zinc-200"
          >
            <ArrowLeftRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

function SortableRow({
  block,
  isSelected,
  canSwap,
  onSelect,
  onReplace,
  onDuplicate,
  onToggleVisible,
  onDelete
}: {
  block: UIBlockConfig;
  isSelected: boolean;
  canSwap: boolean;
  onSelect?: () => void;
} & RowActionHandlers) {
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
          className="flex-1 truncate text-right text-xs text-zinc-300 hover:text-zinc-100"
        >
          {blockLabel(block.type)}
          {isHidden && (
            <EyeOff className="mr-1 inline h-2.5 w-2.5 text-zinc-500" />
          )}
        </button>
        <RowActions
          block={block}
          canSwap={canSwap}
          onReplace={onReplace}
          onDuplicate={onDuplicate}
          onToggleVisible={onToggleVisible}
          onDelete={onDelete}
        />
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
  onDuplicateBlock: (id: string) => void;
  onToggleVisibleBlock: (id: string, visible: boolean) => void;
  onDeleteBlock: (id: string) => void;
}

export function SidebarSectionsTab({
  blocks,
  onBlocksChange,
  onOpenPicker,
  selectedBlockId,
  onSelectBlock,
  onDuplicateBlock,
  onToggleVisibleBlock,
  onDeleteBlock
}: SidebarSectionsTabProps) {
  const sensors = useSensors(useSensor(PointerSensor));
  const swappableTypes = useSwappableSectionTypes(blocks.length > 0);
  // Until the catalog loads (null), don't hide a valid swap; afterwards show it
  // only for types that actually have alternative designs.
  const canSwap = (type: string) =>
    swappableTypes === null || swappableTypes.has(type);
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
          canSwap={canSwap(header.type)}
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
                canSwap={canSwap(block.type)}
                onSelect={select(block)}
                onReplace={replace(block)}
                onDuplicate={onDuplicateBlock}
                onToggleVisible={onToggleVisibleBlock}
                onDelete={onDeleteBlock}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {footer && (
        <PinnedRow
          block={footer}
          isSelected={selectedBlockId === footer.id}
          canSwap={canSwap(footer.type)}
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
