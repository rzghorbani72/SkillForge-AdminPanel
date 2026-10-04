'use client';

import { Badge } from '@/components/ui/badge';
import { GroupScheduleSummary } from '@/components/class/group-schedule-summary';
import { useTranslation } from '@/lib/i18n/hooks';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { ReviewRows, Row } from './review-parts';
import type { ClassScheduleApi } from './use-class-schedules';
import { DAY, useClassSummary } from './use-live-summary';

const DAY_MS = 86_400_000;

type ClassReviewRowsProps = {
  item: ClassScheduleApi;
  timezone: string;
  /** The success page shows only the timetable, not the start and deadline details. */
  compact?: boolean;
};

/** One class's name and timetable, as the review and success page show it. */
export function ClassReviewRows({ item, timezone, compact = false }: ClassReviewRowsProps) {
  const { t } = useTranslation();
  const formatDate = useDateFormat();
  const formatNumber = useNumberFormat();
  const summary = useClassSummary(item);
  const deadline = item.schedule.joinDeadline ? new Date(item.schedule.joinDeadline) : null;
  const leadDays =
    deadline && summary.first
      ? Math.ceil((summary.first.getTime() - deadline.getTime()) / DAY_MS)
      : null;

  return (
    <ReviewRows>
      {item.schedule.title.trim() ? (
        <Row label={t('liveWizard.className')}>{item.schedule.title}</Row>
      ) : null}
      {compact ? null : (
        <Row label={t('liveWizard.startDate')}>
          {summary.first ? formatDate(summary.first, DAY) : '—'}
        </Row>
      )}
      <Row label={t('liveWizard.weeklyTitle')}>
        <GroupScheduleSummary slots={item.schedule.slots} timezone={timezone} />
      </Row>
      <Row label={t('liveWizard.reviewWholeCourse')}>{summary.sessions ?? '—'}</Row>
      {compact ? null : (
        <Row label={t('liveWizard.deadline')}>
          {summary.deadline ?? '—'}{' '}
          {leadDays === null ? null : leadDays > 0 ? (
            <Badge variant="success">
              {t('liveWizard.daysBeforeStart', { count: formatNumber(leadDays) })}
            </Badge>
          ) : (
            <Badge variant="muted">{t('liveWizard.afterStart')}</Badge>
          )}
        </Row>
      )}
    </ReviewRows>
  );
}
