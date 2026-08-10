'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import type { LiveSession } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { toast } from 'react-toastify';
import { tNow } from '@/lib/i18n/t-now';
import { ErrorHandler } from '@/lib/error-handler';
import { Video } from 'lucide-react';

type Props = {
  lessonId: string;
  initial?: LiveSession | null;
  onSaved?: () => void;
};

function toDatetimeLocalValue(iso: string | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocal(value: string): string {
  if (!value) return '';
  return new Date(value).toISOString();
}

const defaultTimezone = () =>
  Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

const LiveSessionEditor = ({ lessonId, initial, onSaved }: Props) => {
  const [meetingUrl, setMeetingUrl] = useState(initial?.meeting_url ?? '');
  const [label, setLabel] = useState(initial?.provider_label ?? '');
  const [startsAt, setStartsAt] = useState(
    toDatetimeLocalValue(initial?.starts_at)
  );
  const [durationMinutes, setDurationMinutes] = useState(
    initial?.duration_minutes != null ? String(initial.duration_minutes) : '60'
  );
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    setMeetingUrl(initial?.meeting_url ?? '');
    setLabel(initial?.provider_label ?? '');
    setStartsAt(toDatetimeLocalValue(initial?.starts_at));
    setDurationMinutes(
      initial?.duration_minutes != null
        ? String(initial.duration_minutes)
        : '60'
    );
  }, [initial]);

  const handleSave = async () => {
    const url = meetingUrl.trim();
    if (!url.startsWith('https://')) {
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

    setSaving(true);
    try {
      await apiClient.upsertLiveSession(lessonId, {
        meeting_url: url,
        playback_url: null,
        starts_at: fromDatetimeLocal(startsAt),
        ends_at: null,
        duration_minutes: duration,
        timezone: defaultTimezone(),
        recurrence_rule: null,
        recurrence_until: null,
        provider_label: label.trim() || null,
        notes: null
      });
      toast.success(tNow('toasts.liveSaved'));
      onSaved?.();
    } catch (e) {
      ErrorHandler.handleApiError(e);
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    if (!initial?.id) {
      return;
    }
    setRemoving(true);
    try {
      await apiClient.deleteLiveSession(lessonId);
      toast.success(tNow('toasts.liveRemoved'));
      setMeetingUrl('');
      setLabel('');
      setStartsAt('');
      setDurationMinutes('60');
      onSaved?.();
    } catch (e) {
      ErrorHandler.handleApiError(e);
    } finally {
      setRemoving(false);
    }
  };

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Video className="h-4 w-4" />
          Meeting link & schedule
        </CardTitle>
        <CardDescription>
          Link opens for enrolled students. Timezone uses your browser (
          {defaultTimezone()}).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="live-meeting-url">Meeting link (https) *</Label>
          <Input
            id="live-meeting-url"
            value={meetingUrl}
            onChange={(e) => setMeetingUrl(e.target.value)}
            placeholder="https://meet.google.com/..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="live-label">Label</Label>
          <Input
            id="live-label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Week 1 kickoff — Google Meet"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="live-starts">Starts *</Label>
            <Input
              id="live-starts"
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="live-duration">Duration (minutes) *</Label>
            <NumberInput
              id="live-duration"
              value={durationMinutes}
              onChange={(raw) => setDurationMinutes(raw)}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save meeting'}
          </Button>
          {initial?.id ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleRemove}
              disabled={removing}
            >
              {removing ? 'Removing…' : 'Clear meeting'}
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveSessionEditor;
