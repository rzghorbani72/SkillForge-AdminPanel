'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTranslation } from '@/lib/i18n/hooks';
import { WeekdayPicker } from '@/components/shared/weekday-picker';

type Props = {
  repeats: boolean;
  days: readonly number[];
  until: string;
  onRepeatsChange: (next: boolean) => void;
  onDaysChange: (next: number[]) => void;
  onUntilChange: (next: string) => void;
};

/**
 * A group class runs on one or many weekdays until the term ends. Turning the
 * switch off is what makes it a single one-off meeting.
 */
const LiveSessionRecurrence = ({
  repeats,
  days,
  until,
  onRepeatsChange,
  onDaysChange,
  onUntilChange
}: Props) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-3 rounded-md border p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <Label htmlFor="live-repeats">
            {t('courses.liveSession.repeatLabel')}
          </Label>
          <p className="text-xs text-muted-foreground">
            {t('courses.liveSession.repeatHint')}
          </p>
        </div>
        <Switch
          id="live-repeats"
          checked={repeats}
          onCheckedChange={onRepeatsChange}
        />
      </div>

      {repeats ? (
        <div className="space-y-3">
          <WeekdayPicker value={days} onChange={onDaysChange} />
          <div className="space-y-2">
            <Label htmlFor="live-repeat-until">
              {t('courses.liveSession.repeatUntilLabel')}
            </Label>
            <Input
              id="live-repeat-until"
              type="date"
              dir="ltr"
              value={until}
              onChange={(e) => onUntilChange(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {t('courses.liveSession.repeatUntilHint')}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default LiveSessionRecurrence;
