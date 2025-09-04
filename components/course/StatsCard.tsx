import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

const StatsCard = ({ total }: { total: number }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
        <BookOpen className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{total}</div>
        <p className="text-xs text-muted-foreground">Active courses</p>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
