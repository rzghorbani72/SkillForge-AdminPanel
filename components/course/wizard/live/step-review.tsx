'use client';

import type { ReactNode } from 'react';
import { Globe, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { GroupScheduleSummary } from '@/components/class/group-schedule-summary';
import { useTranslation } from '@/lib/i18n/hooks';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import type { CourseWizardStep } from '../wizard-steps';
import { LIVE_CLASS_STEPS, WIZARD_STEP_LABEL } from '../wizard-steps';
import { RiskHint } from './live-ui';
import { PublishedCard } from './published-card';
import type { LiveClassDraftApi } from './use-live-class-draft';
import type { LivePublishApi } from './use-live-publish';

const DAY: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
const DAY_TIME: Intl.DateTimeFormatOptions = { ...DAY, hour: '2-digit', minute: '2-digit' };

type StepReviewProps = {
  live: LiveClassDraftApi;
  publisher: LivePublishApi;
  title: string;
  description: string;
  isPublished: boolean;
  onEdit: (step: CourseWizardStep) => void;
};

function ReviewSection({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <section className="space-y-3 rounded-2xl border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">{title}</h2>
        <Button type="button" variant="outline" size="sm" onClick={onEdit}>
          {t('common.edit')}
        </Button>
      </div>
      <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[10rem_minmax(0,1fr)]">
        {children}
      </dl>
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{children}</dd>
    </>
  );
}

export function StepReview({
  live,
  publisher,
  title,
  description,
  isPublished,
  onEdit,
}: StepReviewProps) {
  const { t } = useTranslation();
  const formatDate = useDateFormat();
  const formatNumber = useNumberFormat();
  const { draft, dates } = live;
  const first = dates.at(0);
  const last = dates.at(-1);
  const brokenSteps = LIVE_CLASS_STEPS.filter((step) => live.stepHasErrors(step));
  const toman = t('common.toman');

  if (publisher.justPublished)
    return <PublishedCard courseId={live.courseId} title={title} onEdit={() => onEdit('basics')} />;

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
      ) : null}

      <ReviewSection title={t('liveWizard.reviewCourse')} onEdit={() => onEdit('basics')}>
        <Row label={t('liveWizard.reviewTitle')}>{title}</Row>
        <Row label={t('liveWizard.reviewDescription')}>
          <span className="line-clamp-2 font-normal">{description}</span>
        </Row>
      </ReviewSection>

      <ReviewSection title={t('liveWizard.stepSchedule')} onEdit={() => onEdit('schedule')}>
        <Row label={t('liveWizard.weeklyTitle')}>
          <GroupScheduleSummary slots={draft.slots} timezone={live.group?.timezone} />
        </Row>
        <Row label={t('liveWizard.sessionCount')}>
          {first && last
            ? t('liveWizard.scheduleSummary', {
                count: formatNumber(dates.length),
                from: formatDate(first, DAY),
                to: formatDate(last, DAY),
              })
            : '—'}
        </Row>
        <Row label={t('liveWizard.deadline')}>
          {draft.joinDeadline ? formatDate(new Date(draft.joinDeadline), DAY_TIME) : '—'}
        </Row>
      </ReviewSection>

      <ReviewSection title={t('liveWizard.stepClassType')} onEdit={() => onEdit('classType')}>
        <Row label={t('liveWizard.classKind')}>
          {draft.kind === 'PRIVATE'
            ? t('liveWizard.privateTitle')
            : t('liveWizard.groupSummary', { count: formatNumber(Number(draft.capacity) || 0) })}
        </Row>
        <Row
          label={t(draft.kind === 'PRIVATE' ? 'liveWizard.privatePrice' : 'liveWizard.seatPrice')}
        >
          {draft.price === '' ? '—' : `${formatNumber(Number(draft.price))} ${toman}`}
        </Row>
      </ReviewSection>

      <ReviewSection title={t('liveWizard.stepMeeting')} onEdit={() => onEdit('meeting')}>
        <Row label={t('liveWizard.howStudentsEnter')}>
          {t(draft.meeting === 'AUTO' ? 'liveWizard.autoRoomTitle' : 'liveWizard.ownLinkTitle')}
        </Row>
        <Row label={t('liveWizard.whoCanEnter')}>{t('liveWizard.onlyEnrolled')}</Row>
      </ReviewSection>

      <section className="grid gap-3 rounded-2xl border bg-muted/30 p-5 sm:grid-cols-2">
        {isPublished ? null : (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{t('liveWizard.draftExplain')}</p>
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2"
              disabled={publisher.isBusy}
              onClick={() => void publisher.saveDraft()}
            >
              <Save className="h-4 w-4" />
              {t('liveWizard.saveDraft')}
            </Button>
          </div>
        )}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {t(isPublished ? 'liveWizard.saveChangesExplain' : 'liveWizard.publishExplain')}
          </p>
          <Button
            type="button"
            className="w-full gap-2"
            disabled={publisher.isBusy || !live.isComplete}
            onClick={() => void publisher.publish()}
          >
            <Globe className="h-4 w-4" />
            {t(isPublished ? 'liveWizard.saveChanges' : 'liveWizard.publish')}
          </Button>
        </div>
      </section>
    </div>
  );
}
