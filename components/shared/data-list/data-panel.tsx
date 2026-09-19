'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DataPanelProps {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  filters?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function DataPanel({
  title,
  subtitle,
  actions,
  filters,
  footer,
  children,
  className,
}: DataPanelProps) {
  return (
    <section
      className={cn('overflow-hidden rounded-2xl border border-border/70 bg-card', className)}
    >
      <header className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold leading-tight">{title}</h2>
          {subtitle ? (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </header>

      {filters ? (
        <div className="flex flex-wrap items-center gap-2 border-t border-border/60 bg-muted/40 px-5 py-3">
          {filters}
        </div>
      ) : null}

      <div className="border-t border-border/60">{children}</div>

      {footer ? (
        <div className="flex flex-col gap-3 border-t border-border/60 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          {footer}
        </div>
      ) : null}
    </section>
  );
}
