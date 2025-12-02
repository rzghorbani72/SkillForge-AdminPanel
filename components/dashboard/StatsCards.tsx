'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DashboardStatsCard } from './useDashboard';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatsCards = ({ cards }: { cards: DashboardStatsCard[] }) => {
  const gradients = [
    'from-violet-500/10 via-purple-500/5 to-transparent',
    'from-emerald-500/10 via-green-500/5 to-transparent',
    'from-amber-500/10 via-orange-500/5 to-transparent',
    'from-cyan-500/10 via-blue-500/5 to-transparent'
  ];

  const iconColors = [
    'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
  ];

  const borderColors = [
    'border-l-violet-500',
    'border-l-emerald-500',
    'border-l-amber-500',
    'border-l-cyan-500'
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Card
          key={index}
          className={cn(
            'relative overflow-hidden border-l-4 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5',
            borderColors[index % borderColors.length]
          )}
        >
          {/* Gradient background */}
          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-br opacity-50',
              gradients[index % gradients.length]
            )}
          />

          <CardContent className="relative p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </p>
                <p className="text-3xl font-bold tracking-tight">
                  {card.value}
                </p>

                <div className="flex items-center gap-2">
                  {card.changeType === 'increase' ? (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      <TrendingUp className="h-3 w-3" />
                      {card.change}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                      <TrendingDown className="h-3 w-3" />
                      {card.change}
                    </span>
                  )}
                </div>
              </div>

              <div
                className={cn(
                  'rounded-xl p-3',
                  iconColors[index % iconColors.length]
                )}
              >
                <card.icon className="h-6 w-6" />
              </div>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsCards;
