'use client';

import { useTranslation } from '@/lib/i18n/hooks';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import type { LiveClassDraft } from './live-class-draft';
import type { ClassScheduleApi } from './use-class-schedules';

export const DAY: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
export const DAY_TIME: Intl.DateTimeFormatOptions = { ...DAY, hour: '2-digit', minute: '2-digit' };

/** One wording of a class's dates for the schedule step, review and success page. */
export function useClassSummary({ dates, schedule }: Pick<ClassScheduleApi, 'dates' | 'schedule'>) {
  const { t } = useTranslation();
  const formatDate = useDateFormat();
  const formatNumber = useNumberFormat();
  const first = dates.at(0);
  const last = dates.at(-1);

  const sessions =
    first && last
      ? t('liveWizard.scheduleSummary', {
          count: formatNumber(dates.length),
          from: formatDate(first, DAY),
          to: formatDate(last, DAY),
        })
      : null;
  const deadline = schedule.joinDeadline
    ? formatDate(new Date(schedule.joinDeadline), DAY_TIME)
    : null;
  return { first, last, sessions, deadline };
}

/** Seats and price, shared by every class of the course. */
export function useOfferSummary(draft: LiveClassDraft) {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const isPrivate = draft.kind === 'PRIVATE';
  const kind = isPrivate
    ? t('liveWizard.privateSummary')
    : t('liveWizard.groupSeats', { count: formatNumber(Number(draft.capacity) || 0) });
  const price =
    draft.price === ''
      ? null
      : t(isPrivate ? 'liveWizard.priceWhole' : 'liveWizard.pricePerSeat', {
          price: formatNumber(Number(draft.price)),
        });
  return { kind, price };
}
