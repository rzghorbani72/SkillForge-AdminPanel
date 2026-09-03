'use client';

import { useTranslation } from '@/lib/i18n/hooks';
import { useDateFormat } from '@/lib/i18n/use-date-format';

interface GroupTermRangeProps {
  startsOn?: string | null;
  endsOn?: string | null;
}

/**
 * The weekly slots say which days a class meets; this says between which real
 * dates it runs, so a manager reading "دوشنبه ۰۹:۰۰" knows the term as well.
 */
export function GroupTermRange({ startsOn, endsOn }: GroupTermRangeProps) {
  const { t } = useTranslation();
  const formatDate = useDateFormat();

  if (!startsOn) return <>{t('courses.live.startDateMissing')}</>;
  if (!endsOn)
    return <>{t('courses.live.startsOn', { date: formatDate(startsOn) })}</>;

  return (
    <>
      {t('courses.live.termRange', {
        from: formatDate(startsOn),
        to: formatDate(endsOn)
      })}
    </>
  );
}
