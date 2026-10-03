'use client';

import { useClassPlanSeats } from '@/hooks/use-class-plan-seats';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';

/** Shows the plan's class-size cap and private-tutoring seats, so a limit never surprises on save. */
export function ClassPlanSeatsNote() {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const seats = useClassPlanSeats();
  if (!seats) return null;

  return (
    <div className="space-y-0.5 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
      <p>
        {t('courses.live.planSeats', {
          max: formatNumber(seats.class_capacity_limit),
          used: formatNumber(seats.tutoring_students.used),
          limit: formatNumber(seats.tutoring_students.limit),
        })}
      </p>
      <p>{t('courses.live.planSeatsHint')}</p>
    </div>
  );
}
