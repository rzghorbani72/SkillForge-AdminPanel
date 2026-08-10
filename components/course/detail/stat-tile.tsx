'use client';

import type { ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type StatTileColor = 'primary' | 'emerald' | 'blue' | 'violet' | 'amber';

const COLOR_CLASSES: Record<StatTileColor, string> = {
  primary: 'bg-primary/10 text-primary',
  emerald: 'bg-emerald-500/10 text-emerald-600',
  blue: 'bg-blue-500/10 text-blue-600',
  violet: 'bg-violet-500/10 text-violet-600',
  amber: 'bg-amber-500/10 text-amber-600'
};

type StatTileProps = {
  icon: ReactNode;
  label: string;
  /** `null` renders the loading state. */
  value: string | null;
  sub?: string;
  color?: StatTileColor;
};

export function StatTile({
  icon,
  label,
  value,
  sub,
  color = 'primary'
}: StatTileProps) {
  return (
    <div className="rounded-xl border bg-card p-3.5">
      <div className="flex items-center gap-2.5">
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
            COLOR_CLASSES[color]
          )}
        >
          {icon}
        </div>
        <p className="min-w-0 text-xs leading-snug text-muted-foreground">
          {label}
        </p>
      </div>
      {value === null ? (
        <Skeleton className="mt-2.5 h-6 w-24" />
      ) : (
        <p className="mt-2.5 truncate text-lg font-bold leading-tight">
          {value}
        </p>
      )}
      {sub && (
        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
          {sub}
        </p>
      )}
    </div>
  );
}
