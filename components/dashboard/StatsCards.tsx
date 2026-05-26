'use client';

import { Card, CardContent } from '@/components/ui/card';
import { DashboardStatsCard } from './useDashboard';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const SPARKLINES = [
  [30, 38, 34, 44, 42, 55, 50, 62, 60, 75],
  [25, 30, 27, 38, 35, 46, 42, 54, 52, 64],
  [45, 40, 52, 58, 50, 68, 62, 78, 74, 92],
  [72, 68, 74, 62, 70, 60, 64, 56, 60, 54]
];

const STYLES = [
  {
    icon: 'bg-primary/10 text-primary',
    line: 'hsl(var(--chart-1))'
  },
  {
    icon: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    line: 'hsl(var(--chart-2))'
  },
  {
    icon: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    line: 'hsl(var(--chart-3))'
  },
  {
    icon: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
    line: 'hsl(var(--chart-4))'
  }
];

export default function StatsCards({ cards }: { cards: DashboardStatsCard[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, i) => {
        const style = STYLES[i % STYLES.length];
        const isIncrease = card.changeType === 'increase';
        const sparkData = SPARKLINES[i % SPARKLINES.length].map((v) => ({ v }));

        return (
          <Card key={i} className="stat-card">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </p>
                  <p className="mt-1 text-2xl font-bold tracking-tight">
                    {card.value}
                  </p>
                </div>
                <div className={cn('shrink-0 rounded-xl p-2.5', style.icon)}>
                  <card.icon className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                    isIncrease
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                  )}
                >
                  {isIncrease ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {card.change}
                </span>
                <p className="truncate text-xs text-muted-foreground">
                  {card.description}
                </p>
              </div>

              <div className="-mx-1 mt-3 h-10">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sparkData}>
                    <Line
                      type="monotone"
                      dataKey="v"
                      stroke={style.line}
                      strokeWidth={1.5}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
