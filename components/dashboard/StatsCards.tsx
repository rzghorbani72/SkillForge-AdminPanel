import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardStatsCard } from './useDashboard';

const StatsCards = ({ cards }: { cards: DashboardStatsCard[] }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span
                className={`flex items-center ${card.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}
              >
                {card.changeType === 'increase' ? '↗' : '↘'}{' '}
                {card.description}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsCards;
