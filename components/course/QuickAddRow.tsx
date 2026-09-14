'use client';

import { Plus } from 'lucide-react';
import { useState, type KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';

interface QuickAddRowProps {
  placeholder: string;
  onAdd: (title: string) => void;
  /** Reason this is blocked. Present means blocked, and it replaces the placeholder. */
  blockedReason?: string;
  className?: string;
}

/**
 * Name first, row second: type a title and press Enter to add, then keep
 * typing. Adding a blank row and naming it later is what leaves untitled
 * records behind — and untitled records are dropped on save.
 */
export function QuickAddRow({ placeholder, onAdd, blockedReason, className }: QuickAddRowProps) {
  const [value, setValue] = useState('');
  const blocked = Boolean(blockedReason);

  function commit() {
    const title = value.trim();
    if (!title || blocked) return;
    onAdd(title);
    setValue('');
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault();
      commit();
    }
    if (event.key === 'Escape') setValue('');
  }

  return (
    <div
      className={cn(
        'flex max-w-xl items-center gap-2 rounded-md border border-dashed px-3 py-2',
        'transition-colors',
        blocked
          ? 'cursor-not-allowed opacity-60'
          : 'focus-within:border-primary/50 focus-within:bg-muted/30',
        className,
      )}
    >
      <Plus className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <input
        value={value}
        disabled={blocked}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commit}
        placeholder={blockedReason ?? placeholder}
        title={blockedReason}
        className="h-6 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
      />
    </div>
  );
}
