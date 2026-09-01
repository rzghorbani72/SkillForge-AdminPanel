'use client';

import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';

interface SectionItemControlsProps {
  index: number;
  count: number;
  onMove: (index: number, dir: -1 | 1) => void;
  onRemove: (index: number) => void;
}

/** Move up / move down / remove row, shared by the slides and videos editors. */
export function SectionItemControls({
  index,
  count,
  onMove,
  onRemove
}: SectionItemControlsProps) {
  const { t } = useTranslation();
  const btn =
    'rounded border border-zinc-300 p-1 text-zinc-600 transition-colors hover:bg-zinc-100 disabled:opacity-40';

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        className={btn}
        title={t('sitePreview.itemMoveUp')}
        aria-label={t('sitePreview.itemMoveUp')}
        disabled={index === 0}
        onClick={() => onMove(index, -1)}
      >
        <ArrowUp className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        className={btn}
        title={t('sitePreview.itemMoveDown')}
        aria-label={t('sitePreview.itemMoveDown')}
        disabled={index === count - 1}
        onClick={() => onMove(index, 1)}
      >
        <ArrowDown className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        className="rounded border border-red-300 p-1 text-red-500 transition-colors hover:bg-red-50"
        title={t('sitePreview.itemRemove')}
        aria-label={t('sitePreview.itemRemove')}
        onClick={() => onRemove(index)}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/** Reorders a list without mutating it. Returns the same list when out of range. */
export function moveItem<T>(items: T[], index: number, dir: -1 | 1): T[] {
  const target = index + dir;
  if (target < 0 || target >= items.length) return items;
  const next = items.slice();
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}
