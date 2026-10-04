'use client';

import { useTranslation } from '@/lib/i18n/hooks';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import type { LiveClassDraftApi } from './use-live-class-draft';

export const DAY: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
export const DAY_TIME: Intl.DateTimeFormatOptions = { ...DAY, hour: '2-digit', minute: '2-digit' };

/** One wording of the class (dates, seats, price) for the side summary, review and success page. */
export function useLiveSummary(live: LiveClassDraftApi) {
  const { t } = useTranslation();
  const formatDate = useDateFormat();
  const formatNumber = useNumberFormat();
  const { draft, dates } = live;
  const first = dates.at(0);
  const last = dates.at(-1);
  const isPrivate = draft.kind === 'PRIVATE';

  const sessions =
    first && last
      ? t('liveWizard.scheduleSummary', {
          count: formatNumber(dates.length),
          from: formatDate(first, DAY),
          to: formatDate(last, DAY),
        })
      : null;
  const deadline = draft.joinDeadline ? formatDate(new Date(draft.joinDeadline), DAY_TIME) : null;
  const kind = isPrivate
    ? t('liveWizard.privateSummary')
    : t('liveWizard.groupSeats', { count: formatNumber(Number(draft.capacity) || 0) });
  const price =
    draft.price === ''
      ? null
      : t(isPrivate ? 'liveWizard.priceWhole' : 'liveWizard.pricePerSeat', {
          price: formatNumber(Number(draft.price)),
        });
  return { first, last, sessions, deadline, kind, price };
}
