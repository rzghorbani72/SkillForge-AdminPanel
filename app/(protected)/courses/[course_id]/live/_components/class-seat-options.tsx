'use client';

import { Users } from 'lucide-react';

import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { NumberInput } from '@/components/ui/number-input';
import { Switch } from '@/components/ui/switch';
import { ClassSellingFields } from '@/components/class/class-selling-fields';
import { ClassPlanSeatsNote } from '@/components/class/class-plan-seats-note';
import { useTranslation } from '@/lib/i18n/hooks';
import { clampClassCapacity, MAX_CLASS_CAPACITY } from '@/lib/live-room';
import { classSeats, type useScheduleBuilder } from '../hooks/use-schedule-builder';
import { FormSection } from './form-section';

type Builder = ReturnType<typeof useScheduleBuilder>;

interface ClassSeatOptionsProps {
  fields: Builder['fields'];
  set: Builder['set'];
  /** The course seat price a class inherits when its own is left empty. */
  offerPrice?: number;
  className?: string;
}

/** Everything here has a safe default, so the section is marked optional. */
export function ClassSeatOptions({ fields, set, offerPrice, className }: ClassSeatOptionsProps) {
  const { t } = useTranslation();

  return (
    <FormSection
      icon={Users}
      title={t('courses.live.seatOptionsTitle')}
      aside={t('common.optional')}
      className={className}
    >
      <ClassPlanSeatsNote />
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-0.5">
          <Label htmlFor="private-class">{t('courses.live.privateClass')}</Label>
          <p className="text-xs text-muted-foreground">{t('courses.live.privateClassHint')}</p>
        </div>
        <Switch id="private-class" checked={fields.isPrivate} onCheckedChange={set.isPrivate} />
      </div>

      <div className="grid items-start gap-6 md:grid-cols-3">
        {fields.isPrivate ? (
          <div className="space-y-1.5">
            <Label htmlFor="private-students">{t('courses.live.privateStudents')}</Label>
            <NumberInput
              id="private-students"
              value={fields.privateStudents}
              min={1}
              onChange={(raw) => set.privateStudents(clampClassCapacity(raw))}
            />
            <p className="text-xs text-muted-foreground">{t('courses.live.privateStudentsHint')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="min-students">{t('courses.live.minStudents')}</Label>
              <NumberInput
                id="min-students"
                value={fields.minStudents}
                min={1}
                onChange={set.minStudents}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="capacity">{t('courses.live.maxStudents')}</Label>
              <NumberInput
                id="capacity"
                value={fields.capacity}
                min={1}
                onChange={(raw) => set.capacity(clampClassCapacity(raw))}
              />
            </div>
            <p className="col-span-2 text-xs text-muted-foreground">
              {t('tutoring.groups.capacityLimitHint', { count: MAX_CLASS_CAPACITY })}
            </p>
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="join-deadline">{t('courses.live.joinDeadline')}</Label>
          <DatePicker id="join-deadline" value={fields.joinDeadline} onChange={set.joinDeadline} />
        </div>

        <ClassSellingFields
          idPrefix="new-class"
          className="border-0 p-0"
          capacity={classSeats(fields).capacity}
          seatPrice={fields.seatPrice}
          offerPrice={offerPrice}
          wholeClassBooking={fields.wholeClassBooking}
          onSeatPriceChange={set.seatPrice}
          onWholeClassBookingChange={set.wholeClassBooking}
        />
      </div>
    </FormSection>
  );
}
