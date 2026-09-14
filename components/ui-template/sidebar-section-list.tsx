'use client';

import { useState } from 'react';
import { Eye, EyeOff, GripVertical, Plus, Repeat, Trash2 } from 'lucide-react';
import type { UIBlockConfig } from '@/types/api';
import { useTranslation } from '@/lib/i18n/hooks';
import { useSwappableSectionTypes } from '@/lib/ui-template/use-swappable-types';
import { getSectionSchema, isSectionIncomplete } from './section-schema';

export interface SidebarSectionListProps {
  header: UIBlockConfig | null;
  middle: UIBlockConfig[];
  footer: UIBlockConfig | null;
  selectedBlockId?: string | null;
  onSelect: (blockId: string) => void;
  onReorderMiddle: (next: UIBlockConfig[]) => void;
  onToggleVisible: (blockId: string, visible: boolean) => void;
  onDelete: (blockId: string) => void;
  onOpenPicker: (target?: { blockId: string; type: string }) => void;
}

function moveItem<T>(arr: T[], from: number, to: number): T[] {
  const next = arr.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

interface SectionRowProps {
  block: UIBlockConfig;
  index: number;
  selected: boolean;
  swappable: boolean;
  // Header/footer are structural: they cannot be dragged, hidden or deleted.
  structural: boolean;
  dropBefore: boolean;
  onSelect: () => void;
  onSwap: () => void;
  onToggleVisible: (visible: boolean) => void;
  onDelete: () => void;
  onDragStart: () => void;
  onDragOver: () => void;
  onDrop: () => void;
  onDragEnd: () => void;
}

function SectionRow({
  block,
  index,
  selected,
  swappable,
  structural,
  dropBefore,
  onSelect,
  onSwap,
  onToggleVisible,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: SectionRowProps) {
  const { t } = useTranslation();
  const schema = getSectionSchema(block.type);
  const visible = block.isVisible !== false;
  const incomplete = isSectionIncomplete(block.type, block.config);
  const isPlaceholder = block.type === 'placeholder';

  return (
    <div
      draggable={!structural}
      onDragStart={onDragStart}
      onDragOver={(e) => {
        if (structural) return;
        e.preventDefault();
        onDragOver();
      }}
      onDrop={(e) => {
        if (structural) return;
        e.preventDefault();
        onDrop();
      }}
      onDragEnd={onDragEnd}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      role="button"
      tabIndex={0}
      className={`group flex items-center gap-1.5 rounded-lg border px-2 py-2 transition-colors ${
        dropBefore ? 'border-t-2 border-t-blue-500' : ''
      } ${
        selected
          ? 'border-blue-500 bg-blue-50'
          : isPlaceholder
            ? 'border-dashed border-zinc-300 bg-zinc-50/80 hover:border-blue-400'
            : 'border-transparent hover:border-zinc-200 hover:bg-zinc-50'
      } ${structural ? '' : 'cursor-grab active:cursor-grabbing'}`}
    >
      {structural ? (
        <span className="w-4 flex-shrink-0" />
      ) : (
        <GripVertical className="h-4 w-4 flex-shrink-0 text-zinc-300 group-hover:text-zinc-500" />
      )}

      <span className="w-4 flex-shrink-0 text-center text-[10px] font-medium text-zinc-400">
        {index}
      </span>

      <span
        className={`flex min-w-0 flex-1 items-center gap-1.5 text-right text-xs font-medium ${
          visible ? 'text-zinc-800' : 'text-zinc-400 line-through'
        }`}
      >
        <span className="truncate">{schema.name}</span>
        {isPlaceholder && (
          <span className="flex-shrink-0 text-[9px] font-medium text-blue-600">+</span>
        )}
        {incomplete && (
          <span
            title={t('sitePreview.panelIncomplete')}
            className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500"
          />
        )}
      </span>

      <div className="flex flex-shrink-0 items-center gap-0.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
        {swappable && (
          <button
            type="button"
            title={t('sitePreview.sectionChangeDesign')}
            onClick={(e) => {
              e.stopPropagation();
              onSwap();
            }}
            className="rounded p-1 text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-900"
          >
            <Repeat className="h-3.5 w-3.5" />
          </button>
        )}
        {!structural && (
          <>
            <button
              type="button"
              title={visible ? t('sitePreview.sectionHide') : t('sitePreview.sectionShow')}
              onClick={(e) => {
                e.stopPropagation();
                onToggleVisible(!visible);
              }}
              className="rounded p-1 text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-900"
            >
              {visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            </button>
            <button
              type="button"
              title={t('sitePreview.panelDeleteSection')}
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="rounded p-1 text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// Full page outline: every section in render order, draggable to reorder, with
// per-row design swap / visibility / delete. Header and footer are pinned.
export function SidebarSectionList({
  header,
  middle,
  footer,
  selectedBlockId,
  onSelect,
  onReorderMiddle,
  onToggleVisible,
  onDelete,
  onOpenPicker,
}: SidebarSectionListProps) {
  const { t } = useTranslation();
  const swappableTypes = useSwappableSectionTypes(true);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const isSwappable = (type: string) => swappableTypes?.has(type) ?? false;

  const commitDrop = () => {
    if (dragIndex !== null && overIndex !== null && dragIndex !== overIndex) {
      onReorderMiddle(moveItem(middle, dragIndex, overIndex));
    }
    setDragIndex(null);
    setOverIndex(null);
  };

  const rowProps = (block: UIBlockConfig) => ({
    block,
    selected: block.id === selectedBlockId,
    swappable: isSwappable(block.type),
    onSelect: () => onSelect(block.id),
    onSwap: () => onOpenPicker({ blockId: block.id, type: block.type }),
    onToggleVisible: (visible: boolean) => onToggleVisible(block.id, visible),
    onDelete: () => onDelete(block.id),
  });

  const noop = () => undefined;
  const structuralDrag = {
    dropBefore: false,
    onDragStart: noop,
    onDragOver: noop,
    onDrop: noop,
    onDragEnd: noop,
  };

  return (
    <div className="space-y-1 p-3">
      <p className="px-1 pb-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
        {t('sitePreview.sectionOrder')}
      </p>

      {header && <SectionRow {...rowProps(header)} index={1} structural {...structuralDrag} />}

      {middle.map((block, i) => (
        <SectionRow
          key={block.id}
          {...rowProps(block)}
          index={i + (header ? 2 : 1)}
          structural={false}
          dropBefore={dragIndex !== null && overIndex === i && dragIndex !== i}
          onDragStart={() => setDragIndex(i)}
          onDragOver={() => setOverIndex(i)}
          onDrop={commitDrop}
          onDragEnd={commitDrop}
        />
      ))}

      {footer && (
        <SectionRow
          {...rowProps(footer)}
          index={middle.length + (header ? 2 : 1)}
          structural
          {...structuralDrag}
        />
      )}

      <button
        type="button"
        onClick={() => onOpenPicker()}
        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-zinc-300 py-2 text-xs text-zinc-600 transition-colors hover:border-blue-500 hover:text-blue-600"
      >
        <Plus className="h-3.5 w-3.5" />
        {t('settings.addSectionFromLibrary')}
      </button>
    </div>
  );
}
