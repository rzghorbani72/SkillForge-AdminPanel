'use client';

import { useEffect, useState } from 'react';
import { CalendarClock } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api';
import { formatRequestWindows } from '@/lib/class-request-windows';
import { useTranslation } from '@/lib/i18n/hooks';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import type { ClassRequest } from '@/types/learning-operations';

interface RequestedTimesCardProps {
  engagementId: string;
  /** Bump to re-read after a session is scheduled — the request closes then. */
  refreshKey: number;
}

/** The times a paid private student said they can meet, shown beside the scheduler. */
export function RequestedTimesCard({ engagementId, refreshKey }: RequestedTimesCardProps) {
  const { t } = useTranslation();
  const formatDate = useDateFormat();
  const [request, setRequest] = useState<ClassRequest | null>(null);

  useEffect(() => {
    let active = true;
    apiClient
      .getClassRequests({ engagement_id: engagementId, status: 'PENDING' })
      .then((rows) => {
        if (active) setRequest(rows[0] ?? null);
      })
      .catch(() => {
        if (active) setRequest(null);
      });
    return () => {
      active = false;
    };
  }, [engagementId, refreshKey]);

  if (!request) return null;

  return (
    <Card className="border-primary/40 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarClock className="h-4 w-4 text-primary" />
          {t('tutoring.requestedTimesTitle')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className="font-medium">{formatRequestWindows(request.windows, t)}</p>
        {request.note ? <p className="text-muted-foreground">{request.note}</p> : null}
        <p className="text-xs text-muted-foreground">
          {t('tutoring.requestedTimesHint', {
            date: formatDate(request.created_at),
          })}
        </p>
      </CardContent>
    </Card>
  );
}
