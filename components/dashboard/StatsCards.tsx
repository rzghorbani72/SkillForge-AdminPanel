'use client';

import { Card, CardContent } from '@/components/ui/card';
import { DashboardStatsCard } from './useDashboard';
import { cn } from '@/lib/utils';
import { ArrowUpRight, TrendingUp, TrendingDown } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';

const SPARKLINES = [
  [30, 38, 34, 44, 42, 55, 50, 62, 60, 75],
  [25, 30, 27, 38, 35, 46, 42, 54, 52, 64],
  [45, 40, 52, 58, 50, 68, 62, 78, 74, 92],
  [72, 68, 74, 62, 70, 60, 64, 56, 60, 54]
];

const STYLES = [
  { icon: 'bg-primary/10 text-primary', line: 'hsl(var(--chart-1))' },
  {
    icon: 'bg-emerald-500/10 text-emerald-600',
    line: 'hsl(var(--chart-2))'
  },
  { icon: 'bg-amber-500/10 text-amber-600', line: 'hsl(var(--chart-3))' },
  { icon: 'bg-sky-500/10 text-sky-600', line: 'hsl(var(--chart-4))' }
];

export default function StatsCards({ cards }: { cards: DashboardStatsCard[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, i) => {
        const style = STYLES[i % STYLES.length];
        const isIncrease = card.changeType === 'increase';
        const sparkData = SPARKLINES[i % SPARKLINES.length].map((v) => ({ v }));
        const gradientId = `spark-${i}`;

        return (
          <Card key={i} className="stat-card group">
            <span
              className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background: `linear-gradient(90deg, transparent, ${style.line}, transparent)`
              }}
            />
            <CardContent className="p-0">
              <div className="flex items-start justify-between gap-3">
                <div className={cn('shrink-0 rounded-2xl p-2.5', style.icon)}>
                  <card.icon className="h-5 w-5" />
                </div>
                <button
                  type="button"
                  aria-hidden
                  tabIndex={-1}
                  className="card-corner-btn"
                >
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <p className="mt-4 text-[13px] font-medium text-muted-foreground">
                {card.title}
              </p>

              <div className="mt-1 flex flex-wrap items-baseline gap-2">
                <p className="text-[28px] font-bold tabular-nums leading-none tracking-tight">
                  {card.value}
                </p>
                <span
                  className={cn(
                    'inline-flex items-center gap-0.5 text-xs font-semibold tabular-nums',
                    isIncrease ? 'text-emerald-600' : 'text-rose-600'
                  )}
                >
                  {isIncrease ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {card.change}
                </span>
              </div>

              <p className="mt-2 truncate text-xs text-muted-foreground">
                {card.description}
              </p>

              <div className="-mx-5 -mb-5 mt-4 h-14">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={sparkData}
                    margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id={gradientId}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor={style.line}
                          stopOpacity={0.28}
                        />
                        <stop
                          offset="100%"
                          stopColor={style.line}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="v"
                      stroke={style.line}
                      strokeWidth={2}
                      fill={`url(#${gradientId})`}
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
