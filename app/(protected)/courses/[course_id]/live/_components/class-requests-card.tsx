'use client';

import { useCallback, useEffect, useState } from 'react';
import { CalendarPlus, Inbox, X } from 'lucide-react';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import { DataPanel } from '@/components/shared/data-list';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import type {
  ClassRequest,
  ClassRequestWindow,
  TutoringGroupSlot
} from '@/types/learning-operations';
import { CreateClassSheet } from './create-class-sheet';

const WEEKDAY_KEYS = [
  'weekdays.sunday',
  'weekdays.monday',
  'weekdays.tuesday',
  'weekdays.wednesday',
  'weekdays.thursday',
  'weekdays.friday',
  'weekdays.saturday'
];

const minuteLabel = (minute: number) =>
  `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;

/** A requested window becomes a weekly slot starting at its start time. */
const toSlots = (windows: ClassRequestWindow[]): TutoringGroupSlot[] =>
  windows.map((w) => ({
    weekday: w.weekday,
    start_minute: w.start_minute,
    duration_minutes: Math.max(30, Math.min(180, w.end_minute - w.start_minute))
  }));

interface ClassRequestsCardProps {
  courseId: string;
  courseTitle: string;
  offerId: string | null;
  defaultSeatPrice?: number;
  onClassCreated: () => void;
}

/**
 * Students who asked for a class at their own times. The teacher answers by
 * opening a class prefilled from the request; the student is then texted.
 */
export function ClassRequestsCard({
  courseId,
  courseTitle,
  offerId,
  defaultSeatPrice,
  onClassCreated
}: ClassRequestsCardProps) {
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
          status: 'PENDING'
        })
      );
    } catch (err) {
      ErrorHandler.handleApiError(err);
    }
  }, [courseId]);

  useEffect(() => {
    void load();
  }, [load]);

  const accept = async (request: ClassRequest, groupId: string) => {
    setBusyId(request.id);
    try {
      await apiClient.acceptClassRequest(request.id, groupId);
      toast.success(t('courses.live.requestAccepted'));
      await load();
      onClassCreated();
    } catch (err) {
      ErrorHandler.handleApiError(err);
    } finally {
      setBusyId(null);
    }
  };

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

  if (requests.length === 0) return null;

  return (
    <DataPanel
      title={t('courses.live.requestsTitle')}
      subtitle={t('courses.live.requestsCount', {
        count: formatNumber(requests.length)
      })}
    >
      <ul className="divide-y">
        {requests.map((request) => (
          <li
            key={request.id}
            className="flex flex-wrap items-start justify-between gap-3 p-4"
          >
            <div className="min-w-0 space-y-1 text-sm">
              <p className="font-medium">
                {request.Student?.display_name ?? '—'}
                <span className="ms-2 text-xs text-muted-foreground">
                  {t('courses.live.requestSeats', {
                    count: formatNumber(request.seats)
                  })}
                </span>
              </p>
              <p className="text-muted-foreground">
                {request.windows
                  .map(
                    (w) =>
                      `${t(WEEKDAY_KEYS[w.weekday])} ${minuteLabel(w.start_minute)}–${minuteLabel(w.end_minute)}`
                  )
                  .join(' · ')}
              </p>
              {request.note ? (
                <p className="text-xs text-muted-foreground">{request.note}</p>
              ) : null}
              <p className="text-xs text-muted-foreground">
                {formatDate(request.created_at)}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              {offerId ? (
                <CreateClassSheet
                  offerId={offerId}
                  courseTitle={courseTitle}
                  defaultSeatPrice={defaultSeatPrice}
                  prefill={{
                    slots: toSlots(request.windows),
                    capacity: request.seats,
                    minStudents: request.seats
                  }}
                  trigger={
                    <Button
                      type="button"
                      size="sm"
                      disabled={busyId === request.id}
                    >
                      <CalendarPlus className="me-1.5 h-4 w-4" />
                      {t('courses.live.openClassForRequest')}
                    </Button>
                  }
                  onCreated={(groupId) => void accept(request, groupId)}
                />
              ) : null}
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
