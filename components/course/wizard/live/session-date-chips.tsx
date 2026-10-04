'use client';

import { useState } from 'react';

import { useTranslation } from '@/lib/i18n/hooks';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { cn } from '@/lib/utils';

/** Enough to check the rhythm; the rest is one "+N" chip so the card stays short. */
const VISIBLE_DATES = 30;

const CHIP_DATE: Intl.DateTimeFormatOptions = {
  year: undefined,
  weekday: 'narrow',
  day: 'numeric',
  month: 'long',
};

const CHIP = 'min-w-[62px] rounded-lg border px-2.5 py-1 text-center text-xs leading-normal';

/** The exact session dates the server will create; past ones are green. */
export function SessionDateChips({ dates }: { dates: readonly Date[] }) {
  const { t } = useTranslation();
  const formatDate = useDateFormat();
  const formatNumber = useNumberFormat();
  const [now] = useState(Date.now);
  const hidden = dates.length - VISIBLE_DATES;

  return (
    <ol className="flex flex-wrap gap-1.5">
      {dates.slice(0, VISIBLE_DATES).map((date, index) => (
        <li
          key={date.toISOString()}
          className={cn(
            CHIP,
            date.getTime() < now ? 'border-success/30 bg-success/10 text-success' : 'bg-card',
          )}
        >
          <b className="block text-[13px]">{formatNumber(index + 1)}</b>
          {formatDate(date, CHIP_DATE)}
        </li>
      ))}
      {hidden > 0 ? (
        <li className={cn(CHIP, 'grid place-items-center bg-card text-muted-foreground')}>
          {t('liveWizard.moreDates', { count: formatNumber(hidden) })}
        </li>
      ) : null}
    </ol>
  );
}
