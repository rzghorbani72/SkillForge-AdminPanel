'use client';

import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { NumberInput } from '@/components/ui/number-input';
import { ClassSellingFields } from '@/components/class/class-selling-fields';
import { GroupSlotEditor } from '@/app/(protected)/tutoring/groups/_components/group-slot-editor';
import { defaultTimezone } from '@/lib/class-slot-time';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import type { TutoringGroupSlot } from '@/types/learning-operations';
import { previewSessionDates } from '@/lib/session-plan-preview';
import { clampClassCapacity, MAX_CLASS_CAPACITY } from '@/lib/live-room';

const DEFAULT_SLOT: TutoringGroupSlot = {
  weekday: 6,
  start_minute: 9 * 60,
  duration_minutes: 90,
};

export interface ScheduleBuilderPrefill {
  slots?: TutoringGroupSlot[];
  capacity?: number;
  minStudents?: number;
}

interface ScheduleBuilderProps {
  offerId: string;
  courseTitle: string;
  /** The course's per-seat offer price, shown when the class sets none. */
  defaultSeatPrice?: number;
  prefill?: ScheduleBuilderPrefill;
  onCreated?: (groupId: string) => void;
}

/**
 * Turns "Mondays 10:00 and Tuesdays 15:00, 10 sessions" into a real class. The
 * preview below the form is the same calculation the backend runs, so the dates
 * a teacher agrees to here are exactly the dates their students will get.
 */
export default function ScheduleBuilder({
  offerId,
  courseTitle,
  defaultSeatPrice,
  prefill,
  onCreated,
}: ScheduleBuilderProps) {
  const { t } = useTranslation();
  const formatDate = useDateFormat();
  const formatNumber = useNumberFormat();
  const [slots, setSlots] = useState<TutoringGroupSlot[]>(
    prefill?.slots?.length ? prefill.slots : [DEFAULT_SLOT],
  );
  const [sessionCount, setSessionCount] = useState('10');
  const [capacity, setCapacity] = useState(String(prefill?.capacity ?? 8));
  const [minStudents, setMinStudents] = useState(String(prefill?.minStudents ?? 2));
  const [seatPrice, setSeatPrice] = useState('');
  const [wholeClassBooking, setWholeClassBooking] = useState(true);
  const [startsOn, setStartsOn] = useState('');
  const [joinDeadline, setJoinDeadline] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const timezone = defaultTimezone();
  const sessionCountValue = Number(sessionCount) || 0;
  const preview = useMemo(() => {
    if (!startsOn || sessionCountValue < 1) return [];
    const from = new Date(startsOn);
    if (Number.isNaN(from.getTime())) return [];
    return previewSessionDates(slots, sessionCountValue, from, timezone);
  }, [slots, sessionCountValue, startsOn, timezone]);

  const create = async () => {
    if (!startsOn) {
      toast.error(t('courses.live.startDateRequired'));
      return;
    }
    if (sessionCountValue < 1) {
      toast.error(t('courses.live.sessionCountRequired'));
      return;
    }
    setIsSaving(true);
    try {
      const group = await apiClient.createTutoringGroup({
        offer_id: offerId,
        title: courseTitle,
        timezone,
        capacity: Number(capacity) || 1,
        min_students: Number(minStudents) || 1,
        seat_price: seatPrice === '' ? undefined : Number(seatPrice),
        whole_class_booking: wholeClassBooking,
        session_count: sessionCountValue,
        starts_on_requested: new Date(startsOn).toISOString(),
        join_deadline: joinDeadline ? new Date(joinDeadline).toISOString() : undefined,
        slots,
      });
      toast.success(t('courses.live.classCreated'));
      onCreated?.(group.id);
    } catch (err) {
      ErrorHandler.handleApiError(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>{t('courses.live.weeklyTimes')}</Label>
        <GroupSlotEditor slots={slots} onChange={setSlots} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="session-count">{t('courses.live.sessionCount')} *</Label>
          <NumberInput
            id="session-count"
            value={sessionCount}
            min={1}
            max={200}
            onChange={setSessionCount}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="starts-on">{t('courses.live.startDate')} *</Label>
          <DatePicker id="starts-on" value={startsOn} onChange={setStartsOn} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="join-deadline">{t('courses.live.joinDeadline')}</Label>
          <DatePicker id="join-deadline" value={joinDeadline} onChange={setJoinDeadline} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="min-students">{t('courses.live.minStudents')}</Label>
            <NumberInput id="min-students" value={minStudents} min={1} onChange={setMinStudents} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="capacity">{t('courses.live.maxStudents')}</Label>
            <NumberInput
              id="capacity"
              value={capacity}
              min={1}
              onChange={(raw) => setCapacity(clampClassCapacity(raw))}
            />
            <p className="text-xs text-muted-foreground">
              {t('tutoring.groups.capacityLimitHint', { count: MAX_CLASS_CAPACITY })}
            </p>
          </div>
        </div>
        <ClassSellingFields
          idPrefix="new-class"
          capacity={Number(capacity) || 1}
          seatPrice={seatPrice}
          offerPrice={defaultSeatPrice}
          wholeClassBooking={wholeClassBooking}
          onSeatPriceChange={setSeatPrice}
          onWholeClassBookingChange={setWholeClassBooking}
        />
      </div>

      {preview.length > 0 && (
        <div className="rounded-xl border bg-muted/30 p-3">
          <p className="mb-2 text-sm font-medium">{t('courses.live.previewTitle')}</p>
          <ol className="grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
            {preview.map((date, index) => (
              <li key={date.toISOString()} className="flex gap-2">
                <span className="shrink-0 tabular-nums">{formatNumber(index + 1)}.</span>
                <span>
                  {formatDate(date, {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      <Button type="button" className="w-full sm:w-auto" onClick={create} disabled={isSaving}>
        {isSaving ? t('common.saving') : t('courses.live.createClass')}
      </Button>
    </div>
  );
}
