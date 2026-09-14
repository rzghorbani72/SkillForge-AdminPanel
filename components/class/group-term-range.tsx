'use client';

import { termStart } from '@/lib/class-slot-time';
import { useTranslation } from '@/lib/i18n/hooks';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import type { TutoringGroup } from '@/types/learning-operations';

interface GroupTermRangeProps {
  group: Pick<TutoringGroup, 'starts_on' | 'starts_on_requested' | 'ends_on'>;
}

/**
 * The weekly slots say which days a class meets; this says between which real
 * dates it runs, so a manager reading "دوشنبه ۰۹:۰۰" knows the term as well.
 */
export function GroupTermRange({ group }: GroupTermRangeProps) {
  const { t } = useTranslation();
  const formatDate = useDateFormat();
  const startsOn = termStart(group);
  const endsOn = group.ends_on;

  if (!startsOn) return <>{t('courses.live.startDateMissing')}</>;
  if (!endsOn) return <>{t('courses.live.startsOn', { date: formatDate(startsOn) })}</>;

  return (
    <>
      {t('courses.live.termRange', {
        from: formatDate(startsOn),
        to: formatDate(endsOn),
      })}
    </>
  );
}
