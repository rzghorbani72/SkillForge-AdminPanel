'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarClock, CalendarPlus, Inbox, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DataPanel } from '@/components/shared/data-list';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { formatRequestWindows } from '@/lib/class-request-windows';
import { useTranslation } from '@/lib/i18n/hooks';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import type { ClassRequest } from '@/types/learning-operations';
import { REQUEST_PARAM, scheduleStepHref } from '@/components/course/wizard/live/class-url-intent';

interface ClassRequestsCardProps {
  courseId: string;
}

/**
 * Students who asked for a class at their own times. The teacher answers by
 * opening a class on the live page, prefilled from the request; the student is
 * then texted.
 */
export function ClassRequestsCard({ courseId }: ClassRequestsCardProps) {
  const { t } = useTranslation();
  const formatDate = useDateFormat();
  const formatNumber = useNumberFormat();
  const [requests, setRequests] = useState<ClassRequest[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setRequests(
        await apiClient.getClassRequests({
          course_id: courseId,
          status: 'PENDING',
        }),
      );
    } catch (err) {
      ErrorHandler.handleApiError(err);
    }
  }, [courseId]);

  useEffect(() => {
    void load();
  }, [load]);

  const decline = async (request: ClassRequest) => {
    setBusyId(request.id);
    try {
      await apiClient.declineClassRequest(request.id);
      await load();
    } catch (err) {
      ErrorHandler.handleApiError(err);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <DataPanel
      title={t('courses.live.requestsTitle')}
      subtitle={t('courses.live.requestsCount', {
        count: formatNumber(requests.length),
      })}
    >
      {requests.length === 0 ? (
        <p className="border-t px-5 py-6 text-sm text-muted-foreground">
          {t('courseDetail.requestsNoClassRequests')}
        </p>
      ) : null}
      <ul className="divide-y">
        {requests.map((request) => (
          <li key={request.id} className="flex flex-wrap items-start justify-between gap-3 p-4">
            <div className="min-w-0 space-y-1 text-sm">
              <p className="font-medium">
                {request.Student?.display_name ?? '—'}
                <span className="ms-2 text-xs text-muted-foreground">
                  {request.engagement_id
                    ? t('courses.live.requestPrivatePaid')
                    : t('courses.live.requestSeats', {
                        count: formatNumber(request.seats),
                      })}
                </span>
              </p>
              <p className="text-muted-foreground">{formatRequestWindows(request.windows, t)}</p>
              {request.note ? (
                <p className="text-xs text-muted-foreground">{request.note}</p>
              ) : null}
              <p className="text-xs text-muted-foreground">{formatDate(request.created_at)}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              {request.engagement_id ? (
                <Button type="button" size="sm" asChild>
                  <Link href={`/tutoring/engagements/${request.engagement_id}`}>
                    <CalendarClock className="me-1.5 h-4 w-4" />
                    {t('courses.live.scheduleForRequest')}
                  </Link>
                </Button>
              ) : (
                <Button type="button" size="sm" asChild>
                  <Link href={scheduleStepHref(courseId, `${REQUEST_PARAM}=${request.id}`)}>
                    <CalendarPlus className="me-1.5 h-4 w-4" />
                    {t('courses.live.openClassForRequest')}
                  </Link>
                </Button>
              )}
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={busyId === request.id}
                onClick={() => void decline(request)}
              >
                <X className="me-1.5 h-4 w-4" />
                {t('courses.live.declineRequest')}
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <p className="flex items-center gap-2 border-t px-4 py-3 text-xs text-muted-foreground">
        <Inbox className="h-3.5 w-3.5" />
        {t('courses.live.requestsHint')}
      </p>
    </DataPanel>
  );
}
