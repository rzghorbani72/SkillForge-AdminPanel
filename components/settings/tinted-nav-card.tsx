'use client';

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ChevronRight } from 'lucide-react';
import Link from '@/components/ui/link';
import { cn } from '@/lib/utils';
import type { HubCardTone } from '@/components/settings/hub-tones';

export type { HubCardTone } from '@/components/settings/hub-tones';
export { HUB_TONES } from '@/components/settings/hub-tones';
export { HubCardGrid, TintedPanel } from '@/components/settings/hub-surface';

type TintedNavCardProps = {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  tone: HubCardTone;
  actionLabel: string;
  badge?: ReactNode;
  children?: ReactNode;
};

export function TintedNavCard({
  href,
  icon: Icon,
  title,
  description,
  tone,
  actionLabel,
  badge,
  children,
}: TintedNavCardProps) {
  return (
    <Link
      href={href}
      aria-label={`${title}. ${actionLabel}`}
      className="group block h-full focus-visible:outline-none"
    >
      <div
        className={cn(
          'flex h-full flex-col rounded-2xl border border-border/80 bg-card p-4',
          'transition-colors duration-150',
          'group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2',
          tone.hover,
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

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-[15px] font-semibold leading-snug tracking-tight text-foreground">
                {title}
              </h3>
              <div className="flex shrink-0 items-center gap-1.5 pt-0.5">
                {badge}
                <ChevronRight
                  className="h-4 w-4 text-muted-foreground/40 transition-colors group-hover:text-foreground/60 rtl:rotate-180"
                  aria-hidden
                />
              </div>
            </div>
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
        </div>

        {children ? (
          <div className="mt-3 border-t border-border/60 pt-3 text-sm text-muted-foreground">
            {children}
          </div>
        ) : null}
      </div>
    </Link>
  );
}
