'use client';

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
import { useTranslation } from '@/lib/i18n/hooks';
import { Video } from 'lucide-react';
import LiveSessionRecurrence from './LiveSessionRecurrence';
import { defaultTimezone, useLiveSessionForm } from './use-live-session-form';

type Props = {
  lessonId: string;
  initial?: LiveSession | null;
  onSaved?: () => void;
};

const LiveSessionEditor = ({ lessonId, initial, onSaved }: Props) => {
  const { t } = useTranslation();
  const form = useLiveSessionForm({ lessonId, initial, onSaved });

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Video className="h-4 w-4" />
          {t('courses.liveSession.title')}
        </CardTitle>
        <CardDescription>
          {t('courses.liveSession.description', {
            timezone: defaultTimezone()
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="live-meeting-url">
            {t('courses.liveSession.urlLabel')}{' '}
            <span className="text-destructive">*</span>
          </Label>
          <Input
            id="live-meeting-url"
            dir="ltr"
            value={form.meetingUrl}
            onChange={(e) => form.setMeetingUrl(e.target.value)}
            placeholder="https://meet.google.com/..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="live-label">
            {t('courses.liveSession.labelLabel')}
          </Label>
          <Input
            id="live-label"
            value={form.label}
            onChange={(e) => form.setLabel(e.target.value)}
            placeholder={t('courses.liveSession.labelPlaceholder')}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="live-starts">
              {t('courses.liveSession.startsLabel')}{' '}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="live-starts"
              type="datetime-local"
              dir="ltr"
              value={form.startsAt}
              onChange={(e) => form.setStartsAt(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="live-duration">
              {t('courses.liveSession.durationLabel')}{' '}
              <span className="text-destructive">*</span>
            </Label>
            <NumberInput
              id="live-duration"
              value={form.durationMinutes}
              onChange={(raw) => form.setDurationMinutes(raw)}
            />
          </div>
        </div>
        <LiveSessionRecurrence
          repeats={form.repeats}
          days={form.repeatDays}
          until={form.repeatUntil}
          onRepeatsChange={form.enableRepeats}
          onDaysChange={form.setRepeatDays}
          onUntilChange={form.setRepeatUntil}
        />
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={form.save} disabled={form.saving}>
            {form.saving ? t('common.saving') : t('courses.liveSession.save')}
          </Button>
          {initial?.id ? (
            <Button
              type="button"
              variant="outline"
              onClick={form.remove}
              disabled={form.removing}
            >
              {form.removing
                ? t('courses.liveSession.removing')
                : t('courses.liveSession.remove')}
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveSessionEditor;
