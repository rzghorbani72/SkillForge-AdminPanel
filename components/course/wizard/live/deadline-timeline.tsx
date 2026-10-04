'use client';

import { Fragment } from 'react';

import { useTranslation } from '@/lib/i18n/hooks';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import { cn } from '@/lib/utils';
import { DAY } from './use-live-summary';

type Point = { key: string; label: string; date: Date; dot: string };

/** Today → registration closes → first session → last session, in real date order. */
export function DeadlineTimeline({
  deadline,
  first,
  last,
}: {
  deadline: Date;
  first: Date;
  last: Date;
}) {
  const { t } = useTranslation();
  const formatDate = useDateFormat();
  const points: Point[] = [
    {
      key: 'today',
      label: t('liveWizard.today'),
      date: new Date(),
      dot: 'bg-muted-foreground border-muted',
    },
    {
      key: 'deadline',
      label: t('liveWizard.registrationCloses'),
      date: deadline,
      dot: 'bg-amber-500 border-amber-500/20',
    },
    {
      key: 'first',
      label: t('liveWizard.firstSession'),
      date: first,
      dot: 'bg-primary border-primary/20',
    },
    {
      key: 'last',
      label: t('liveWizard.lastSession'),
      date: last,
      dot: 'bg-foreground border-foreground/15',
    },
  ];
  points.sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <ol className="flex flex-wrap items-start pt-2 sm:flex-nowrap">
      {points.map((point, index) => (
        <Fragment key={point.key}>
          {index > 0 ? (
            <li aria-hidden className="mt-1.5 hidden h-0.5 min-w-4 flex-1 bg-border sm:block" />
          ) : null}
          <li className="flex w-[120px] flex-none flex-col items-center gap-1 text-center text-xs leading-normal">
            <span
              className={cn('h-3.5 w-3.5 rounded-full border-[3px] bg-clip-padding', point.dot)}
            />
            <b className="text-[13px]">{point.label}</b>
            {formatDate(point.date, DAY)}
          </li>
        </Fragment>
      ))}
    </ol>
  );
}
