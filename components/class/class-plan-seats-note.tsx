'use client';

import { Note } from '@/components/shared/note';
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
    <Note>
      <b className="block">
        {t('courses.live.planSeats', {
          max: formatNumber(seats.class_capacity_limit),
        })}
      </b>
      {t('courses.live.planSeatsHint', {
        used: formatNumber(seats.tutoring_students.used),
        limit: formatNumber(seats.tutoring_students.limit),
      })}
    </Note>
  );
}
