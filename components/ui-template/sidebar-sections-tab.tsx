'use client';

import type { UIBlockConfig } from '@/types/api';
import { SectionEditor } from './section-customization-panel';
import { SidebarSectionList } from './sidebar-section-list';
import type { HeroPreviewContext } from './hero-variant-picker';

export interface SidebarSectionsTabProps {
  blocks: UIBlockConfig[];
  onBlocksChange: (blocks: UIBlockConfig[]) => void;
  onOpenPicker: (target?: { blockId: string; type: string }) => void;
  selectedBlockId?: string | null;
  onSelectBlock: (blockId: string) => void;
  onUpdateBlock: (blockId: string, config: Record<string, unknown>) => void;
  onToggleVisibleBlock: (id: string, visible: boolean) => void;
  onDeleteBlock: (id: string) => void;
  onCloseSection: () => void;
  onPickBlockType?: (blockId: string, type: string) => void;
  preview?: HeroPreviewContext | null;
  /** Real academy name, used as the live default for brand fields. */
  academyName?: string;
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
  onSelectBlock,
  onUpdateBlock,
  onToggleVisibleBlock,
  onDeleteBlock,
  onCloseSection,
  onPickBlockType,
  preview,
  academyName
}: SidebarSectionsTabProps) {
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
        onBack={onCloseSection}
        onPickBlockType={onPickBlockType}
        preview={preview}
        academyName={academyName}
      />
    );
  }

  return (
    <SidebarSectionList
      header={header}
      middle={middle}
      footer={footer}
      selectedBlockId={selectedBlockId}
      onSelect={onSelectBlock}
      onReorderMiddle={reorder}
      onToggleVisible={onToggleVisibleBlock}
      onDelete={onDeleteBlock}
      onOpenPicker={onOpenPicker}
    />
  );
}
