'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { useTranslation } from '@/lib/i18n/hooks';
import type { TutoringEngagement } from '@/types/learning-operations';

interface SessionFormState {
  engagement_id: string;
  starts_at: string;
  ends_at: string;
  timezone: string;
  meeting_url: string;
  notes: string;
}

interface ScheduleSessionCardProps {
  form: SessionFormState;
  onChange: (next: SessionFormState) => void;
  activeEngagements: TutoringEngagement[];
  saving: boolean;
  onSubmit: () => void;
}

export function ScheduleSessionCard({
  form,
  onChange,
  activeEngagements,
  saving,
  onSubmit
}: ScheduleSessionCardProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('tutoring.scheduleSession')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <Label>{t('tutoring.engagement')}</Label>
          <Select
            value={form.engagement_id}
            onValueChange={(value) =>
              onChange({ ...form, engagement_id: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={t('tutoring.selectEngagement')} />
            </SelectTrigger>
            <SelectContent>
              {activeEngagements.map((engagement) => (
                <SelectItem key={engagement.id} value={engagement.id}>
                  {engagement.Course?.title ?? engagement.course_id} ·{' '}
                  {engagement.Student?.display_name ??
                    engagement.student_profile_id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="startsAt">{t('tutoring.startsAt')}</Label>
          <DatePicker
            id="startsAt"
            value={form.starts_at}
            onChange={(pickedValue: string) =>
              onChange({ ...form, starts_at: pickedValue })
            }
            withTime
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endsAtSession">{t('tutoring.endsAtOptional')}</Label>
          <DatePicker
            id="endsAtSession"
            value={form.ends_at}
            onChange={(pickedValue: string) =>
              onChange({ ...form, ends_at: pickedValue })
            }
            withTime
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="timezone">{t('tutoring.timezone')}</Label>
          <Input
            id="timezone"
            value={form.timezone}
            onChange={(event) =>
              onChange({ ...form, timezone: event.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="meetingUrl">{t('tutoring.meetingUrl')}</Label>
          <Input
            id="meetingUrl"
            dir="ltr"
            placeholder="https://meet.google.com/..."
            value={form.meeting_url}
            onChange={(event) =>
              onChange({ ...form, meeting_url: event.target.value })
            }
          />
          <p className="text-xs text-muted-foreground">
            {t('tutoring.meetingUrlHint')}
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">{t('tutoring.notes')}</Label>
          <Textarea
            id="notes"
            value={form.notes}
            onChange={(event) =>
              onChange({ ...form, notes: event.target.value })
            }
            rows={2}
          />
        </div>
        <Button onClick={() => void onSubmit()} disabled={saving}>
          {t('tutoring.schedule')}
        </Button>
      </CardContent>
    </Card>
  );
}
