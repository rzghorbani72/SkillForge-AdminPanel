'use client';

import { DatePicker } from '@/components/ui/date-picker';
import { NumberInput } from '@/components/ui/number-input';
import { FieldError, FieldLabel } from '@/components/shared/field-label';
import { useTranslation } from '@/lib/i18n/hooks';
import type { ClassScheduleApi } from './use-class-schedules';

/** Start, length and registration close side by side: the three dates-and-numbers of a class. */
export function ClassScheduleFields({ item }: { item: ClassScheduleApi }) {
  const { t } = useTranslation();
  const { schedule, shownErrors: errors, update, locked } = item;
  const id = (name: string) => `live-${name}-${schedule.key}`;

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor={id('starts-on')} required>
          {t('liveWizard.startDate')}
        </FieldLabel>
        <DatePicker
          id={id('starts-on')}
          value={schedule.startsOn}
          onChange={(startsOn) => update({ startsOn })}
          minDate={new Date()}
          disabled={locked}
        />
        <FieldError messageKey={errors.startsOn} />
      </div>
      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor={id('session-count')} required>
          {t('liveWizard.sessionCount')}
        </FieldLabel>
        <NumberInput
          id={id('session-count')}
          value={schedule.sessionCount}
          min={1}
          max={200}
          suffix={t('liveWizard.sessionUnit')}
          onChange={(sessionCount) => update({ sessionCount })}
          disabled={locked}
        />
        <FieldError messageKey={errors.sessionCount} />
      </div>
      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor={id('deadline')}>
          {t('liveWizard.deadline')}{' '}
          <span className="font-normal text-muted-foreground">{t('liveWizard.optional')}</span>
        </FieldLabel>
        <DatePicker
          id={id('deadline')}
          withTime
          value={schedule.joinDeadline}
          onChange={(joinDeadline) => update({ joinDeadline })}
          minDate={new Date()}
        />
        <FieldError messageKey={errors.joinDeadline} />
      </div>
    </div>
  );
}
