'use client';

import { Plus } from 'lucide-react';
import type { UIBlockConfig } from '@/types/api';
import { useSwappableSectionTypes } from '@/lib/ui-template/use-swappable-types';
import { SectionEditor } from './section-customization-panel';
import type { HeroPreviewContext } from './hero-variant-picker';

export interface SidebarSectionsTabProps {
  blocks: UIBlockConfig[];
  onBlocksChange: (blocks: UIBlockConfig[]) => void;
  onOpenPicker: (target?: { blockId: string; type: string }) => void;
  selectedBlockId?: string | null;
  onUpdateBlock: (blockId: string, config: Record<string, unknown>) => void;
  onToggleVisibleBlock: (id: string, visible: boolean) => void;
  onDeleteBlock: (id: string) => void;
  onCloseSection: () => void;
  preview?: HeroPreviewContext | null;
}

function moveItem<T>(arr: T[], from: number, to: number): T[] {
  const next = arr.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function SidebarSectionsTab({
  blocks,
  onBlocksChange,
  onOpenPicker,
  selectedBlockId,
  onUpdateBlock,
  onToggleVisibleBlock,
  onDeleteBlock,
  onCloseSection,
  preview
}: SidebarSectionsTabProps) {
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

  const selected = selectedBlockId
    ? (sorted.find((b) => b.id === selectedBlockId) ?? null)
    : null;
  const midIndex = selected
    ? middle.findIndex((b) => b.id === selected.id)
    : -1;

  const handleMove = (dir: 'up' | 'down') => {
    if (midIndex === -1) return;
    const target = midIndex + (dir === 'up' ? -1 : 1);
    if (target < 0 || target >= middle.length) return;
    reorder(moveItem(middle, midIndex, target));
  };

  if (selected) {
    return (
      <SectionEditor
        block={selected}
        canMoveUp={midIndex > 0}
        canMoveDown={midIndex !== -1 && midIndex < middle.length - 1}
        canDelete={midIndex !== -1}
        onUpdate={onUpdateBlock}
        onMove={(_id, dir) => handleMove(dir)}
        onDelete={onDeleteBlock}
        onToggleVisible={onToggleVisibleBlock}
        onReplace={
          canSwap(selected.type)
            ? () => onOpenPicker({ blockId: selected.id, type: selected.type })
            : undefined
        }
        onBack={onCloseSection}
        preview={preview}
      />
    );
  }

  return (
    <div className="p-3">
      <button
        type="button"
        onClick={() => onOpenPicker()}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-zinc-300 py-2 text-xs text-zinc-600 transition-colors hover:border-blue-500 hover:text-blue-400"
      >
        <Plus className="h-3.5 w-3.5" />
        افزودن بخش
      </button>
    </div>
  );
}
