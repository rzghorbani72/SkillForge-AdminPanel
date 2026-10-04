'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GroupScheduleSummary } from '@/components/class/group-schedule-summary';
import { resolveMediaUrl } from '@/lib/media-url';
import { useTranslation } from '@/lib/i18n/hooks';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import type { CourseWizardStep } from '../wizard-steps';
import { LIVE_CLASS_STEPS, WIZARD_STEP_LABEL } from '../wizard-steps';
import { RiskHint } from './live-ui';
import { PublishedCard } from './published-card';
import { ReviewRows, ReviewSection, Row } from './review-parts';
import type { LiveClassDraftApi } from './use-live-class-draft';
import type { LivePublishApi } from './use-live-publish';
import { DAY, useLiveSummary } from './use-live-summary';

const DAY_MS = 86_400_000;

type StepReviewProps = {
  live: LiveClassDraftApi;
  publisher: LivePublishApi;
  title: string;
  description: string;
  coverUrl: string | null;
  levelKey: string;
  onEdit: (step: CourseWizardStep) => void;
};

export function StepReview({
  live,
  publisher,
  title,
  description,
  coverUrl,
  levelKey,
  onEdit,
}: StepReviewProps) {
  const { t } = useTranslation();
  const formatDate = useDateFormat();
  const formatNumber = useNumberFormat();
  const summary = useLiveSummary(live);
  const { draft } = live;
  const brokenSteps = LIVE_CLASS_STEPS.filter((step) => live.stepHasErrors(step));
  const deadline = draft.joinDeadline ? new Date(draft.joinDeadline) : null;
  const leadDays =
    deadline && summary.first
      ? Math.ceil((summary.first.getTime() - deadline.getTime()) / DAY_MS)
      : null;

  if (publisher.justPublished) return <PublishedCard live={live} title={title} />;

  return (
    <div className="space-y-4">
      {brokenSteps.length > 0 ? (
        <RiskHint tone="warn">
          <span className="block">{t('liveWizard.reviewIncomplete')}</span>
          <span className="mt-2 flex flex-wrap gap-2">
            {brokenSteps.map((step) => (
              <Button
                key={step}
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  live.revealErrors();
                  onEdit(step);
                }}
              >
                {t(WIZARD_STEP_LABEL[step])}
              </Button>
            ))}
          </span>
        </RiskHint>
      ) : (
        <RiskHint>{t('liveWizard.reviewComplete')}</RiskHint>
      )}

      <ReviewSection title={t('liveWizard.reviewCourse')} onEdit={() => onEdit('basics')}>
        <div className="flex flex-wrap items-start gap-4">
          {coverUrl ? (
            <img
              src={resolveMediaUrl(coverUrl)}
              alt=""
              className="aspect-video w-48 shrink-0 rounded-lg border object-cover"
            />
          ) : null}
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-base font-bold">{title}</p>
            <p className="line-clamp-2 text-sm text-muted-foreground">{description}</p>
            <p className="text-xs text-muted-foreground">
              {t('liveWizard.reviewLevel')}: {t(levelKey)} ·{' '}
              {t('liveWizard.topicsCount', { count: formatNumber(live.topics.length) })}
            </p>
          </div>
        </div>
      </ReviewSection>

      <ReviewSection title={t('liveWizard.stepSchedule')} onEdit={() => onEdit('schedule')}>
        <ReviewRows>
          <Row label={t('liveWizard.startDate')}>
            {summary.first ? formatDate(summary.first, DAY) : '—'}
          </Row>
          <Row label={t('liveWizard.weeklyTitle')}>
            <GroupScheduleSummary slots={draft.slots} timezone={live.group?.timezone} />
          </Row>
          <Row label={t('liveWizard.reviewWholeCourse')}>{summary.sessions ?? '—'}</Row>
          <Row label={t('liveWizard.deadline')}>
            {summary.deadline ?? '—'}{' '}
            {leadDays === null ? null : leadDays > 0 ? (
              <Badge variant="secondary">
                {t('liveWizard.daysBeforeStart', { count: formatNumber(leadDays) })}
              </Badge>
            ) : (
              <Badge variant="outline">{t('liveWizard.afterStart')}</Badge>
            )}
          </Row>
        </ReviewRows>
      </ReviewSection>

      <ReviewSection title={t('liveWizard.stepClassType')} onEdit={() => onEdit('classType')}>
        <ReviewRows>
          <Row label={t('liveWizard.classKind')}>{summary.kind}</Row>
          <Row
            label={t(draft.kind === 'PRIVATE' ? 'liveWizard.privatePrice' : 'liveWizard.seatPrice')}
          >
            {summary.price ?? '—'}
          </Row>
        </ReviewRows>
      </ReviewSection>

      <ReviewSection title={t('liveWizard.stepMeeting')} onEdit={() => onEdit('meeting')}>
        <ReviewRows>
          <Row label={t('liveWizard.howStudentsEnter')}>{summary.meeting}</Row>
          <Row label={t('liveWizard.whoCanEnter')}>{t('liveWizard.onlyEnrolled')}</Row>
        </ReviewRows>
      </ReviewSection>
    </div>
  );
}
