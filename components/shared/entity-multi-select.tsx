'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SelectableEntity = {
  id: string;
  title: string;
};

type EntityMultiSelectLabels = {
  placeholder: string;
  /** Shown once something is picked; the count is appended automatically. */
  selected: string;
  search: string;
  empty: string;
  remove: string;
};

type EntityMultiSelectProps = {
  items: SelectableEntity[];
  selected: string[];
  onChange: (ids: string[]) => void;
  labels: EntityMultiSelectLabels;
  /** Optional trailing cell per row — e.g. a course price. */
  renderMeta?: (item: SelectableEntity) => ReactNode;
  disabled?: boolean;
  /** Already-saved ids: shown checked; clicking one calls `onRevoke` instead of selecting. */
  granted?: string[];
  onRevoke?: (id: string) => void;
  /** Allow only one pick: choosing another replaces it. */
  single?: boolean;
};

/**
 * Searchable multi-select over titled records. Extracted from the bundles page
 * so course/lesson pickers everywhere behave the same — and so nothing has to
 * fall back to asking a manager to type a raw id.
 */
export function EntityMultiSelect({
  items,
  selected,
  onChange,
  labels,
  renderMeta,
  disabled = false,
  granted = [],
  onRevoke,
  single = false,
}: EntityMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: MouseEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', closeOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  const filtered = query
    ? items.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()))
    : items;
  const selectedItems = items.filter((item) => selected.includes(item.id));

  function toggle(id: string) {
    if (granted.includes(id)) {
      onRevoke?.(id);
      return;
    }
    if (selected.includes(id)) onChange(selected.filter((x) => x !== id));
    else onChange(single ? [id] : [...selected, id]);
    if (single) setOpen(false);
  }

  return (
    <div ref={rootRef} className="space-y-2">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-sm transition-colors hover:bg-muted/40 disabled:opacity-50',
          open && 'ring-2 ring-primary',
        )}
      >
        <span className="text-muted-foreground">
          {selected.length === 0
            ? labels.placeholder
            : `${labels.selected} (${selected.length.toLocaleString('fa-IR')})`}
        </span>
        <ChevronDown
          className={cn('h-4 w-4 text-muted-foreground transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="rounded-md border bg-popover shadow-md">
          <div className="flex items-center gap-2 border-b px-3 py-2">
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={labels.search}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-4 text-center text-sm text-muted-foreground">{labels.empty}</p>
            ) : (
              filtered.map((item) => {
                const isChecked = selected.includes(item.id) || granted.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => toggle(item.id)}
                    className="flex w-full items-center gap-3 px-3 py-2 text-start text-sm transition-colors hover:bg-accent"
                  >
                    <span
                      className={cn(
                        'flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                        isChecked
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-input',
                      )}
                    >
                      {isChecked && <Check className="h-3 w-3" />}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{item.title}</span>
                    {renderMeta && (
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {renderMeta(item)}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-1.5 rounded-md border bg-muted/30 p-2">
          {selectedItems.map((item) => (
            <span
              key={item.id}
              className="flex items-center gap-1 rounded-full border bg-background px-2.5 py-1 text-xs font-medium shadow-sm"
            >
              {item.title}
              <button
                type="button"
                aria-label={labels.remove}
                onClick={() => toggle(item.id)}
                className="ms-0.5 text-muted-foreground hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
