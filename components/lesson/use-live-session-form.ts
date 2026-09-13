'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { apiClient } from '@/lib/api';
import type { LiveSession } from '@/types/api';
import { tNow } from '@/lib/i18n/t-now';
import { ErrorHandler } from '@/lib/error-handler';
import { buildWeeklyRule, parseWeeklyRule } from '@/lib/live-recurrence';

export const defaultTimezone = (): string =>
  Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

export function toDatetimeLocalValue(iso: string | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toDateValue(iso: string | null | undefined): string {
  return toDatetimeLocalValue(iso ?? undefined).slice(0, 10);
}

/** End of the chosen day, so the last class of the term still runs. */
function untilFromDateValue(value: string): string | null {
  if (!value) return null;
  const end = new Date(`${value}T23:59:59`);
  return Number.isNaN(end.getTime()) ? null : end.toISOString();
}

/** The weekday a start time falls on — the default day a repeat runs on. */
function weekdayOf(datetimeLocal: string): number[] {
  const d = new Date(datetimeLocal);
  return Number.isNaN(d.getTime()) ? [] : [d.getDay()];
}

interface UseLiveSessionFormInput {
  readonly lessonId: string;
  readonly initial?: LiveSession | null;
  readonly onSaved?: () => void;
}

export function useLiveSessionForm({
  lessonId,
  initial,
  onSaved
}: UseLiveSessionFormInput) {
  const [meetingUrl, setMeetingUrl] = useState(initial?.meeting_url ?? '');
  const [meetingUrlSource, setMeetingUrlSource] = useState(
    initial?.meeting_url_source ?? null
  );
  const [manualEntry, setManualEntry] = useState(
    Boolean(initial?.meeting_url) &&
      initial?.meeting_url_source !== 'AUTO_JITSI'
  );
  const [label, setLabel] = useState(initial?.provider_label ?? '');
  const [startsAt, setStartsAt] = useState(
    toDatetimeLocalValue(initial?.starts_at)
  );
  const [durationMinutes, setDurationMinutes] = useState(
    initial?.duration_minutes != null ? String(initial.duration_minutes) : '60'
  );
  const [repeats, setRepeats] = useState(Boolean(initial?.recurrence_rule));
  const [repeatDays, setRepeatDays] = useState<number[]>(
    parseWeeklyRule(initial?.recurrence_rule)
  );
  const [repeatUntil, setRepeatUntil] = useState(
    toDateValue(initial?.recurrence_until)
  );
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    setMeetingUrl(initial?.meeting_url ?? '');
    setMeetingUrlSource(initial?.meeting_url_source ?? null);
    setManualEntry(
      Boolean(initial?.meeting_url) &&
        initial?.meeting_url_source !== 'AUTO_JITSI'
    );
    setLabel(initial?.provider_label ?? '');
    setStartsAt(toDatetimeLocalValue(initial?.starts_at));
    setDurationMinutes(
      initial?.duration_minutes != null
        ? String(initial.duration_minutes)
        : '60'
    );
    setRepeats(Boolean(initial?.recurrence_rule));
    setRepeatDays(parseWeeklyRule(initial?.recurrence_rule));
    setRepeatUntil(toDateValue(initial?.recurrence_until));
  }, [initial]);

  const enableRepeats = (next: boolean) => {
    setRepeats(next);
    if (next && repeatDays.length === 0) setRepeatDays(weekdayOf(startsAt));
  };

  const save = async (options?: { regenerate?: boolean }) => {
    const url = meetingUrl.trim();
    if (manualEntry && !url.startsWith('https://')) {
      toast.error(tNow('toasts.liveLinkHttps'));
      return;
    }
    if (!startsAt) {
      toast.error(tNow('toasts.liveStartRequired'));
      return;
    }
    const duration = parseInt(durationMinutes, 10);
    if (!duration || duration < 1) {
      toast.error(tNow('toasts.liveDurationMin'));
      return;
    }

    const days = repeats
      ? repeatDays.length
        ? repeatDays
        : weekdayOf(startsAt)
      : [];
    const until = repeats ? untilFromDateValue(repeatUntil) : null;
    if (until && new Date(until) <= new Date(startsAt)) {
      toast.error(tNow('toasts.liveRepeatUntilAfterStart'));
      return;
    }

    setSaving(true);
    try {
      const result = await apiClient.upsertLiveSession(lessonId, {
        meeting_url: manualEntry ? url : undefined,
        regenerate: options?.regenerate,
        playback_url: null,
        starts_at: new Date(startsAt).toISOString(),
        ends_at: null,
        duration_minutes: duration,
        timezone: defaultTimezone(),
        recurrence_rule: buildWeeklyRule(days),
        recurrence_until: until,
        provider_label: label.trim() || null,
        notes: null
      });
      const saved = (result as { data?: LiveSession })?.data;
      if (saved?.meeting_url) setMeetingUrl(saved.meeting_url);
      if (saved?.meeting_url_source)
        setMeetingUrlSource(saved.meeting_url_source);
      toast.success(tNow('toasts.liveSaved'));
      onSaved?.();
    } catch (e) {
      ErrorHandler.handleApiError(e);
    } finally {
      setSaving(false);
    }
  };

  const regenerate = () => save({ regenerate: true });

  const remove = async () => {
    if (!initial?.id) return;
    setRemoving(true);
    try {
      await apiClient.deleteLiveSession(lessonId);
      toast.success(tNow('toasts.liveRemoved'));
      setMeetingUrl('');
      setMeetingUrlSource(null);
      setManualEntry(false);
      setLabel('');
      setStartsAt('');
      setDurationMinutes('60');
      setRepeats(false);
      setRepeatDays([]);
      setRepeatUntil('');
      onSaved?.();
    } catch (e) {
      ErrorHandler.handleApiError(e);
    } finally {
      setRemoving(false);
    }
  };

  return {
    meetingUrl,
    setMeetingUrl,
    meetingUrlSource,
    manualEntry,
    setManualEntry,
    label,
    setLabel,
    startsAt,
    setStartsAt,
    durationMinutes,
    setDurationMinutes,
    repeats,
    enableRepeats,
    repeatDays,
    setRepeatDays,
    repeatUntil,
    setRepeatUntil,
    saving,
    removing,
    save,
    regenerate,
    remove
  };
}
