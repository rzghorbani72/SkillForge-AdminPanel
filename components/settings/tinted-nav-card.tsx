'use client';

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ArrowLeft } from 'lucide-react';
import Link from '@/components/ui/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type HubCardTone = {
  tile: string;
  card: string;
  link: string;
};

export const HUB_TONES = {
  violet: {
    tile: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    card: 'border-s-violet-500/70 hover:border-violet-500/40 hover:bg-violet-500/[0.04] hover:shadow-violet-500/10',
    link: 'text-violet-700 dark:text-violet-400'
  },
  indigo: {
    tile: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    card: 'border-s-indigo-500/70 hover:border-indigo-500/40 hover:bg-indigo-500/[0.04] hover:shadow-indigo-500/10',
    link: 'text-indigo-700 dark:text-indigo-400'
  },
  sky: {
    tile: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
    card: 'border-s-sky-500/70 hover:border-sky-500/40 hover:bg-sky-500/[0.04] hover:shadow-sky-500/10',
    link: 'text-sky-700 dark:text-sky-400'
  },
  amber: {
    tile: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    card: 'border-s-amber-500/70 hover:border-amber-500/40 hover:bg-amber-500/[0.04] hover:shadow-amber-500/10',
    link: 'text-amber-700 dark:text-amber-400'
  },
  emerald: {
    tile: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    card: 'border-s-emerald-500/70 hover:border-emerald-500/40 hover:bg-emerald-500/[0.04] hover:shadow-emerald-500/10',
    link: 'text-emerald-700 dark:text-emerald-400'
  },
  teal: {
    tile: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
    card: 'border-s-teal-500/70 hover:border-teal-500/40 hover:bg-teal-500/[0.04] hover:shadow-teal-500/10',
    link: 'text-teal-700 dark:text-teal-400'
  },
  rose: {
    tile: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    card: 'border-s-rose-500/70 hover:border-rose-500/40 hover:bg-rose-500/[0.04] hover:shadow-rose-500/10',
    link: 'text-rose-700 dark:text-rose-400'
  }
} as const satisfies Record<string, HubCardTone>;

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
  children
}: TintedNavCardProps) {
  return (
    <Link href={href} className="group block h-full">
      <Card
        className={cn(
          'h-full overflow-hidden border-s-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
          tone.card
        )}
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <span
              className={cn(
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                tone.tile
              )}
            >
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            {badge}
          </div>
          <CardTitle className="pt-3 text-lg font-semibold">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {children}
          <span
            className={cn(
              'inline-flex items-center gap-1 text-sm font-medium',
              tone.link
            )}
          >
            {actionLabel}
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5" />
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
