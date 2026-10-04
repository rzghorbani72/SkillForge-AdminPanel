'use client';

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
    { key: 'today', label: t('liveWizard.today'), date: new Date(), dot: 'bg-muted-foreground' },
    {
      key: 'deadline',
      label: t('liveWizard.registrationCloses'),
      date: deadline,
      dot: 'bg-amber-500',
    },
    { key: 'first', label: t('liveWizard.firstSession'), date: first, dot: 'bg-primary' },
    { key: 'last', label: t('liveWizard.lastSession'), date: last, dot: 'bg-foreground' },
  ];
  points.sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <ol className="grid gap-3 sm:grid-cols-4">
      {points.map((point) => (
        <li key={point.key} className="flex items-start gap-2 text-sm sm:flex-col sm:gap-1.5">
          <span className="flex items-center gap-2 sm:w-full">
            <span className={cn('h-3 w-3 shrink-0 rounded-full', point.dot)} aria-hidden />
            <span className="hidden h-px flex-1 bg-border sm:block" aria-hidden />
          </span>
          <span>
            <span className="block font-medium">{point.label}</span>
            <span className="text-xs text-muted-foreground">{formatDate(point.date, DAY)}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}
