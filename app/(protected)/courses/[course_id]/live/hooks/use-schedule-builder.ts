'use client';

import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import { apiClient } from '@/lib/api';
import { defaultTimezone } from '@/lib/class-slot-time';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { previewSessionDates } from '@/lib/session-plan-preview';
import type { Course } from '@/types/api';
import type { TutoringGroupSlot, TutoringOffer } from '@/types/learning-operations';
import { useCreateTutoringOffer, type NewOfferTarget } from './use-create-tutoring-offer';
import { tryPublishClass } from './publish-draft-classes';

const DEFAULT_SLOT: TutoringGroupSlot = {
  weekday: 6,
  start_minute: 9 * 60,
  duration_minutes: 90,
};

/** The course's GROUP price, or what is needed to create it with the first class. */
export type ClassOfferSource = { offerId: string } | { newOffer: NewOfferTarget };

export function classOfferSource(
  courseId: string,
  course: Course,
  offers: readonly TutoringOffer[],
): ClassOfferSource {
  const groupOffer = offers.find((offer) => offer.kind === 'GROUP');
  if (groupOffer) return { offerId: groupOffer.id };
  return {
    newOffer: { courseId, courseTitle: course.title, tutorProfileId: String(course.author_id) },
  };
}

/** Remounts the pricing card when prices change elsewhere, so it never shows stale input. */
export const offersKey = (offers: readonly TutoringOffer[]) =>
  offers.map((offer) => `${offer.id}:${offer.price}`).join('|');

export interface ScheduleBuilderPrefill {
  slots?: TutoringGroupSlot[];
  capacity?: number;
  minStudents?: number;
}

export interface ScheduleBuilderArgs {
  offer: ClassOfferSource;
  courseTitle: string;
  coursePublished: boolean;
  prefill?: ScheduleBuilderPrefill;
  onOfferCreated?: () => void;
  onCreated?: (groupId: string) => void;
}

function useClassFields(prefill?: ScheduleBuilderPrefill) {
  const [slots, setSlots] = useState<TutoringGroupSlot[]>(
    prefill?.slots?.length ? prefill.slots : [DEFAULT_SLOT],
  );
  const [sessionCount, setSessionCount] = useState('10');
  const [startsOn, setStartsOn] = useState('');
  const [groupPrice, setGroupPrice] = useState('');
  const [capacity, setCapacity] = useState(String(prefill?.capacity ?? 8));
  const [minStudents, setMinStudents] = useState(String(prefill?.minStudents ?? 2));
  const [seatPrice, setSeatPrice] = useState('');
  const [wholeClassBooking, setWholeClassBooking] = useState(true);
  const [joinDeadline, setJoinDeadline] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [privateStudents, setPrivateStudents] = useState('1');

  return {
    fields: {
      slots,
      sessionCount,
      startsOn,
      groupPrice,
      capacity,
      minStudents,
      seatPrice,
      wholeClassBooking,
      joinDeadline,
      isPrivate,
      privateStudents,
    },
    set: {
      slots: setSlots,
      sessionCount: setSessionCount,
      startsOn: setStartsOn,
      groupPrice: setGroupPrice,
      capacity: setCapacity,
      minStudents: setMinStudents,
      seatPrice: setSeatPrice,
      wholeClassBooking: setWholeClassBooking,
      joinDeadline: setJoinDeadline,
      isPrivate: setIsPrivate,
      privateStudents: setPrivateStudents,
    },
  };
}

type ClassFields = ReturnType<typeof useClassFields>['fields'];

/** A private class starts only when every invited student has joined, so min = max. */
export function classSeats(fields: ClassFields) {
  if (fields.isPrivate) {
    const students = Number(fields.privateStudents) || 1;
    return { capacity: students, minStudents: students };
  }
  return {
    capacity: Number(fields.capacity) || 1,
    minStudents: Number(fields.minStudents) || 1,
  };
}

/**
 * Creates the class, and its price first when the course has none. On a
 * published course the class is published right away, because publishing is
 * what writes its session dates.
 */
export function useScheduleBuilder({
  offer,
  courseTitle,
  coursePublished,
  prefill,
  onOfferCreated,
  onCreated,
}: ScheduleBuilderArgs) {
  const { t } = useTranslation();
  const createOffer = useCreateTutoringOffer();
  const { fields, set } = useClassFields(prefill);
  // Kept so a retry after a failed class save never creates a second price.
  const [createdOfferId, setCreatedOfferId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const timezone = defaultTimezone();
  const offerId = 'offerId' in offer ? offer.offerId : createdOfferId;
  const needsPrice = offerId === null;
  const sessionCountValue = Number(fields.sessionCount) || 0;

  const preview = useMemo(() => {
    if (!fields.startsOn || sessionCountValue < 1) return [];
    const from = new Date(fields.startsOn);
    if (Number.isNaN(from.getTime())) return [];
    return previewSessionDates(fields.slots, sessionCountValue, from, timezone);
  }, [fields.slots, fields.startsOn, sessionCountValue, timezone]);

  const resolveOfferId = async (): Promise<string> => {
    if (offerId !== null) return offerId;
    if ('offerId' in offer) return offer.offerId;
    const created = await createOffer(offer.newOffer, 'GROUP', Number(fields.groupPrice));
    setCreatedOfferId(created.id);
    onOfferCreated?.();
    return created.id;
  };

  const create = async () => {
    if (needsPrice && fields.groupPrice === '') {
      toast.error(t('courses.live.groupPriceRequired'));
      return;
    }
    if (fields.slots.length === 0) {
      toast.error(t('tutoring.groups.pickDaysHint'));
      return;
    }
    if (!fields.startsOn) {
      toast.error(t('courses.live.startDateRequired'));
      return;
    }
    if (sessionCountValue < 1) {
      toast.error(t('courses.live.sessionCountRequired'));
      return;
    }
    setIsSaving(true);
    try {
      const seats = classSeats(fields);
      const group = await apiClient.createTutoringGroup({
        offer_id: await resolveOfferId(),
        title: courseTitle,
        timezone,
        capacity: seats.capacity,
        min_students: seats.minStudents,
        visibility: fields.isPrivate ? 'PRIVATE' : 'PUBLIC',
        seat_price: fields.seatPrice === '' ? undefined : Number(fields.seatPrice),
        whole_class_booking: fields.wholeClassBooking,
        session_count: sessionCountValue,
        starts_on_requested: new Date(fields.startsOn).toISOString(),
        join_deadline: fields.joinDeadline
          ? new Date(fields.joinDeadline).toISOString()
          : undefined,
        slots: fields.slots,
      });
      const published = coursePublished && (await tryPublishClass(group.id));
      toast.success(t(published ? 'courses.live.classPublished' : 'courses.live.classCreated'));
      onCreated?.(group.id);
    } catch (err) {
      ErrorHandler.handleApiError(err);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    fields,
    set,
    needsPrice,
    preview,
    isSaving,
    create,
  };
}
