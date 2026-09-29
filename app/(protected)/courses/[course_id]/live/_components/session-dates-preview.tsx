'use client';

import { CalendarDays } from 'lucide-react';

import { useTranslation } from '@/lib/i18n/hooks';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { FormSection } from './form-section';

/** Enough to check the rhythm; the rest is summarised so the list never scrolls. */
const VISIBLE_DATES = 12;

const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  year: undefined,
  weekday: 'long',
  hour: '2-digit',
  minute: '2-digit',
};

interface SessionDatesPreviewProps {
  dates: readonly Date[];
  coursePublished: boolean;
}

/** The exact dates the backend will write, so the teacher agrees to real days. */
export function SessionDatesPreview({ dates, coursePublished }: SessionDatesPreviewProps) {
  const { t } = useTranslation();
  const formatDate = useDateFormat();
  const formatNumber = useNumberFormat();
  const hidden = dates.length - VISIBLE_DATES;
  const last = dates.at(-1);

  return (
    <FormSection
      icon={CalendarDays}
      title={t('courses.live.previewTitle')}
      aside={
        dates.length > 0
          ? t('courses.live.meetingsCount', { count: formatNumber(dates.length) })
          : null
      }
    >
      {dates.length === 0 ? (
        <div className="flex h-72 flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-6 text-center">
          <CalendarDays className="h-8 w-8 text-muted-foreground/40" aria-hidden />
          <p className="text-sm text-muted-foreground">{t('courses.live.sessionDatesEmpty')}</p>
        </div>
      ) : (
        <div className="rounded-xl border bg-muted/20">
          <ol className="divide-y">
            {dates.slice(0, VISIBLE_DATES).map((date, index) => (
              <li key={date.toISOString()} className="flex items-center gap-3 px-3 py-2 text-sm">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {formatNumber(index + 1)}
                </span>
                <span className="truncate">{formatDate(date, DATE_OPTIONS)}</span>
              </li>
            ))}
          </ol>
          {hidden > 0 && last ? (
            <p className="border-t px-3 py-2.5 text-sm text-muted-foreground">
              {t('courses.live.moreSessions', {
                count: formatNumber(hidden),
                date: formatDate(last, DATE_OPTIONS),
              })}
            </p>
          ) : null}
        </div>
      )}
      {!coursePublished && (
        <p className="text-xs text-muted-foreground">{t('courses.live.sessionsOnCoursePublish')}</p>
      )}
    </FormSection>
  );
}
