'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TutoringSessionSearchCombobox } from '@/components/entity-search';
import { useTranslation } from '@/lib/i18n/hooks';

interface RescheduleFormState {
  session_id: string;
  starts_at: string;
  ends_at: string;
  meeting_url: string;
}

interface RescheduleSessionCardProps {
  form: RescheduleFormState;
  onChange: (next: RescheduleFormState) => void;
  saving: boolean;
  onReschedule: () => void;
  onCancel: (sessionId: string) => void;
}

export function RescheduleSessionCard({
  form,
  onChange,
  saving,
  onReschedule,
  onCancel
}: RescheduleSessionCardProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('tutoring.rescheduleOrCancel')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="sessionId">{t('tutoring.sessionId')}</Label>
          <TutoringSessionSearchCombobox
            id="sessionId"
            value={form.session_id}
            onValueChange={(value) => onChange({ ...form, session_id: value })}
            placeholder={t('entitySearch.searchPlaceholder')}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rescheduleStarts">{t('tutoring.startsAt')}</Label>
          <Input
            id="rescheduleStarts"
            type="datetime-local"
            value={form.starts_at}
            onChange={(event) =>
              onChange({ ...form, starts_at: event.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rescheduleEnds">{t('tutoring.endsAtOptional')}</Label>
          <Input
            id="rescheduleEnds"
            type="datetime-local"
            value={form.ends_at}
            onChange={(event) =>
              onChange({ ...form, ends_at: event.target.value })
            }
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => void onReschedule()} disabled={saving}>
            {t('tutoring.reschedule')}
          </Button>
          <Button
            variant="outline"
            onClick={() => void onCancel(form.session_id)}
            disabled={saving || !form.session_id}
          >
            {t('tutoring.cancel')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
