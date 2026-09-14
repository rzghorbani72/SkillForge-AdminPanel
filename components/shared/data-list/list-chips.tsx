'use client';

import { cn } from '@/lib/utils';

interface ListChipsProps {
  labels: readonly string[];
  max?: number;
  className?: string;
  /** Rendered inside the "+N" chip's title so the hidden values stay reachable. */
  overflowTitle?: string;
}

export function ListChips({ labels, max = 3, className, overflowTitle }: ListChipsProps) {
  const visible = labels.slice(0, max);
  const hidden = labels.length - visible.length;

  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {visible.map((label) => (
        <span
          key={label}
          className="rounded-md bg-muted px-2 py-0.5 text-[11.5px] font-medium text-muted-foreground"
        >
          {label}
        </span>
      ))}
      {hidden > 0 && (
        <span
          title={overflowTitle ?? labels.slice(max).join('، ')}
          className="rounded-md bg-primary/10 px-2 py-0.5 text-[11.5px] font-medium text-primary"
        >
          +{hidden}
        </span>
      )}
    </div>
  );
}
