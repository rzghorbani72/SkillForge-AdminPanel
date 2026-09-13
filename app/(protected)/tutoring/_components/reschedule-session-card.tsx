'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { TutoringSessionSearchCombobox } from '@/components/entity-search';
import { DatePicker } from '@/components/ui/date-picker';
import { useTranslation } from '@/lib/i18n/hooks';

interface RescheduleFormState {
  session_id: string;
  starts_at: string;
  ends_at: string;
  meeting_url: string;
  regenerate: boolean;
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
          <DatePicker
            id="rescheduleStarts"
            value={form.starts_at}
            onChange={(pickedValue: string) =>
              onChange({ ...form, starts_at: pickedValue })
            }
            withTime
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rescheduleEnds">{t('tutoring.endsAtOptional')}</Label>
          <DatePicker
            id="rescheduleEnds"
            value={form.ends_at}
            onChange={(pickedValue: string) =>
              onChange({ ...form, ends_at: pickedValue })
            }
            withTime
          />
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="rescheduleRegenerate"
            checked={form.regenerate}
            onCheckedChange={(value) =>
              onChange({ ...form, regenerate: value })
            }
          />
          <Label htmlFor="rescheduleRegenerate" className="text-sm font-normal">
            {t('tutoring.regenerateLink')}
          </Label>
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
