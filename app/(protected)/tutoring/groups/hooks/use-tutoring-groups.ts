'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import type {
  CreateTutoringGroupPayload,
  TutoringGroup,
  TutoringGroupSlot,
} from '@/types/learning-operations';
import { defaultTimezone } from '@/lib/class-slot-time';

export interface GroupFormState {
  offer_id: string;
  title: string;
  description: string;
  capacity: string;
  min_students: string;
  session_count: string;
  seat_price: string;
  whole_class_booking: boolean;
  visibility: 'PUBLIC' | 'PRIVATE';
  join_deadline: string;
  meeting_url: string;
  slots: TutoringGroupSlot[];
}

export const EMPTY_GROUP_FORM: GroupFormState = {
  offer_id: '',
  title: '',
  description: '',
  capacity: '8',
  min_students: '3',
  session_count: '10',
  seat_price: '',
  whole_class_booking: true,
  visibility: 'PUBLIC',
  join_deadline: '',
  meeting_url: '',
  // Saturday 09:00 is the ordinary first guess for a Persian week.
  slots: [{ weekday: 6, start_minute: 9 * 60, duration_minutes: 90 }],
};

export function useTutoringGroups() {
  const [groups, setGroups] = useState<TutoringGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<GroupFormState>(EMPTY_GROUP_FORM);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setGroups(await apiClient.getTutoringGroups());
    } catch (error) {
      ErrorHandler.handleApiError(error);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const create = useCallback(async (): Promise<TutoringGroup | null> => {
    setSaving(true);
    try {
      const payload: CreateTutoringGroupPayload = {
        offer_id: form.offer_id,
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        timezone: defaultTimezone(),
        capacity: Number(form.capacity),
        min_students: Number(form.min_students),
        seat_price: form.seat_price === '' ? undefined : Number(form.seat_price),
        whole_class_booking: form.whole_class_booking,
        visibility: form.visibility,
        session_count: Number(form.session_count) || undefined,
        join_deadline: form.join_deadline ? new Date(form.join_deadline).toISOString() : undefined,
        meeting_url: form.meeting_url.trim() || undefined,
        slots: form.slots,
      };
      const created = await apiClient.createTutoringGroup(payload);
      setForm(EMPTY_GROUP_FORM);
      await load();
      return created;
    } catch (error) {
      ErrorHandler.handleApiError(error);
      return null;
    } finally {
      setSaving(false);
    }
  }, [form, load]);

  const publish = useCallback(
    async (groupId: string) => {
      setSaving(true);
      try {
        await apiClient.publishTutoringGroup(groupId);
        await load();
      } catch (error) {
        ErrorHandler.handleApiError(error);
      } finally {
        setSaving(false);
      }
    },
    [load],
  );

  return { groups, loading, saving, form, setForm, load, create, publish };
}
