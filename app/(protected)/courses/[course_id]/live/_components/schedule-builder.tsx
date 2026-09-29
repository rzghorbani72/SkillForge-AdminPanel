'use client';

import { Clock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { NumberInput } from '@/components/ui/number-input';
import { PriceInput } from '@/components/ui/price-input';
import { GroupSlotEditor } from '@/app/(protected)/tutoring/groups/_components/group-slot-editor';
import { useTranslation } from '@/lib/i18n/hooks';
import { useScheduleBuilder, type ScheduleBuilderArgs } from '../hooks/use-schedule-builder';
import { ClassSeatOptions } from './class-seat-options';
import { FormSection } from './form-section';
import { SessionDatesPreview } from './session-dates-preview';

interface ScheduleBuilderProps extends ScheduleBuilderArgs {
  /** The course's per-seat offer price, shown when the class sets none. */
  defaultSeatPrice?: number;
  /** Hidden for the first class, when there is nothing to go back to. */
  onCancel?: () => void;
}

/**
 * When the class meets beside the dates that produces, so a teacher sees each
 * change land on real days; seats and price, all optional, sit below.
 */
export default function ScheduleBuilder({
  defaultSeatPrice,
  onCancel,
  ...args
}: ScheduleBuilderProps) {
  const { t } = useTranslation();
  const { fields, set, needsPrice, preview, isSaving, create } = useScheduleBuilder(args);
  const offerPrice =
    defaultSeatPrice ?? (needsPrice && fields.groupPrice ? Number(fields.groupPrice) : undefined);

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-8">
        <FormSection icon={Clock} title={t('courses.live.classTimeTitle')}>
          {needsPrice && (
            <div className="space-y-1.5">
              <Label htmlFor="new-class-group-price">{t('courses.live.groupPrice')} *</Label>
              <PriceInput
                id="new-class-group-price"
                value={fields.groupPrice}
                onChange={set.groupPrice}
                suffix={t('common.toman')}
              />
              <p className="text-xs text-muted-foreground">{t('courses.live.groupPriceHint')}</p>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>{t('courses.live.weeklyTimes')} *</Label>
            <GroupSlotEditor slots={fields.slots} onChange={set.slots} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="starts-on">{t('courses.live.startDate')} *</Label>
              <DatePicker id="starts-on" value={fields.startsOn} onChange={set.startsOn} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="session-count">{t('courses.live.sessionCount')} *</Label>
              <NumberInput
                id="session-count"
                value={fields.sessionCount}
                min={1}
                max={200}
                onChange={set.sessionCount}
              />
            </div>
          </div>
        </FormSection>

        <SessionDatesPreview dates={preview} coursePublished={args.coursePublished} />

        <ClassSeatOptions
          className="border-t pt-6 lg:col-span-2"
          fields={fields}
          set={set}
          offerPrice={offerPrice}
        />
      </div>

      <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
            {t('common.cancel')}
          </Button>
        ) : null}
        <Button type="button" onClick={() => void create()} disabled={isSaving}>
          {isSaving ? t('common.saving') : t('courses.live.createClass')}
        </Button>
      </div>
    </>
  );
}
