'use client';

import { Card, CardContent } from '@/components/ui/card';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatCardProps } from './shared';

export function StatCard({ label, value, sub, delta, accent, negative }: StatCardProps) {
  return (
    <Card
      className={cn(
        'transition-shadow hover:shadow-sm',
        accent && 'border-transparent bg-primary/5',
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <span
            className={cn(
              'text-xs font-medium uppercase tracking-wider',
              accent ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            {label}
          </span>
          {delta != null && delta !== 0 && (
            <span
              className={cn(
                'flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                delta >= 0
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
              )}
            >
              {delta >= 0 ? (
                <TrendingUp className="h-2.5 w-2.5" />
              ) : (
                <TrendingDown className="h-2.5 w-2.5" />
              )}
              {Math.abs(delta).toFixed(1)}%
            </span>
          )}
        </div>
        <p
          className={cn(
            'mt-2 text-2xl font-bold tabular-nums tracking-tight',
            negative && 'text-destructive',
          )}
        >
          {value}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  );
}
