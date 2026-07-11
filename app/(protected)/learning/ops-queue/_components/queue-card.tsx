'use client';

import type { ReactNode } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function QueueCard({
  title,
  description,
  icon,
  count,
  empty,
  children
}: {
  title: string;
  description: string;
  icon: ReactNode;
  count: number;
  empty: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2 text-base">
          <span className="flex items-center gap-2">
            {icon}
            {title}
          </span>
          <Badge variant="outline">{count}</Badge>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {count === 0 ? (
          <p className="text-sm text-muted-foreground">{empty}</p>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
