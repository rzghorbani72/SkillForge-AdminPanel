'use client';

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HubCardTone } from '@/components/settings/hub-tones';

const HUB_GRID_CLASS = 'grid gap-3 sm:grid-cols-2 xl:grid-cols-3';

export function HubCardGrid({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn(HUB_GRID_CLASS, className)}>{children}</div>;
}

type TintedPanelProps = {
  tone: HubCardTone;
  icon: LucideIcon;
  title: string;
  description: string;
  children?: ReactNode;
  className?: string;
};

/** Flat summary panel for hub overviews (not a navigation target). */
export function TintedPanel({
  tone,
  icon: Icon,
  title,
  description,
  children,
  className,
}: TintedPanelProps) {
  return (
    <div
      className={cn(
        'flex h-full flex-col rounded-2xl border border-border/80 bg-card p-4',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
            tone.tile,
          )}
        >
          <Icon className="h-[18px] w-[18px]" aria-hidden />
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <h3 className="text-[15px] font-semibold leading-snug tracking-tight text-foreground">
            {title}
          </h3>
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      {children ? (
        <div className="mt-3 space-y-2 border-t border-border/60 pt-3 text-sm text-muted-foreground">
          {children}
        </div>
      ) : null}
    </div>
  );
}
