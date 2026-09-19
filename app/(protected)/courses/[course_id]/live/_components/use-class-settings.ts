'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';

import { useClassDetail } from '@/hooks/use-class-detail';
import { useTranslation } from '@/lib/i18n/hooks';
import type {
  TutoringGroup,
  TutoringGroupSlot,
  TutoringGroupVisibility,
} from '@/types/learning-operations';

const EDITABLE_SCHEDULE_STATUSES = ['DRAFT', 'WAITING'];

export type ClassSettingsDraft = {
  title: string;
  description: string;
  capacity: string;
  minStudents: string;
  seatPrice: string;
  wholeClassBooking: boolean;
  sessionCount: string;
  visibility: TutoringGroupVisibility;
  startsOn: string;
  joinDeadline: string;
};

const dateOnly = (iso: string | null | undefined) => (iso ? iso.slice(0, 10) : '');
const isoOf = (date: string) => (date ? new Date(date).toISOString() : undefined);

function draftFrom(group: TutoringGroup): ClassSettingsDraft {
  return {
    title: group.title,
    description: group.description ?? '',
    capacity: String(group.capacity),
    minStudents: String(group.min_students),
    seatPrice: group.seat_price != null ? String(group.seat_price) : '',
    wholeClassBooking: group.whole_class_booking ?? true,
    sessionCount: String(group.session_count ?? ''),
    visibility: group.visibility,
    startsOn: dateOnly(group.starts_on_requested),
    joinDeadline: dateOnly(group.join_deadline),
  };
}

type ClassActions = Pick<ReturnType<typeof useClassDetail>, 'update' | 'replaceSlots' | 'publish'>;

async function persistClassSettings(
  draft: ClassSettingsDraft,
  slots: TutoringGroupSlot[],
  canEditSchedule: boolean,
  actions: ClassActions,
  onChanged: () => void,
): Promise<boolean> {
  const settingsOk = await actions.update({
    title: draft.title.trim(),
    description: draft.description.trim() || undefined,
    capacity: Number(draft.capacity) || undefined,
    min_students: Number(draft.minStudents) || undefined,
    seat_price: draft.seatPrice === '' ? undefined : Number(draft.seatPrice),
    whole_class_booking: draft.wholeClassBooking,
    session_count: Number(draft.sessionCount) || undefined,
    visibility: draft.visibility,
    starts_on_requested: canEditSchedule ? isoOf(draft.startsOn) : undefined,
    join_deadline: isoOf(draft.joinDeadline),
  });
  if (!settingsOk) return false;
  if (canEditSchedule && !(await actions.replaceSlots(slots))) return false;
  onChanged();
  return true;
}

export function useClassSettings(
  group: TutoringGroup,
  actions: ClassActions,
  onChanged: () => void,
) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(() => draftFrom(group));
  const [slots, setSlots] = useState<TutoringGroupSlot[]>(group.Slots ?? []);
  const [saving, setSaving] = useState(false);
  const canEditSchedule = EDITABLE_SCHEDULE_STATUSES.includes(group.status);

  const patch = (partial: Partial<ClassSettingsDraft>) =>
    setDraft((current) => ({ ...current, ...partial }));

  const saveAll = async (): Promise<boolean> => {
    setSaving(true);
    try {
      return await persistClassSettings(draft, slots, canEditSchedule, actions, onChanged);
    } finally {
      setSaving(false);
    }
  };

  const doSave = async () => {
    if (await saveAll()) toast.success(t('courseDetail.settingsSaved'));
  };

  const doPublish = async () => {
    if (!(await saveAll())) return;
    if (await actions.publish()) {
      toast.success(t('courses.live.classPublished'));
      onChanged();
    }
  };

  return { draft, patch, slots, setSlots, canEditSchedule, saving, doSave, doPublish };
}
