'use client';

import { ImageIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Note } from '@/components/shared/note';
import { resolveMediaUrl } from '@/lib/media-url';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import type { CourseWizardStep } from '../wizard-steps';
import { LIVE_CLASS_STEPS, WIZARD_STEP_LABEL } from '../wizard-steps';
import { ClassLinkField } from './class-link-field';
import { PublishedCard } from './published-card';
import { ClassReviewRows } from './class-review-rows';
import { ReviewRows, ReviewSection, Row } from './review-parts';
import type { LiveClassDraftApi } from './use-live-class-draft';
import type { LivePublishApi } from './use-live-publish';
import { useOfferSummary } from './use-live-summary';

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
  const formatNumber = useNumberFormat();
  const summary = useOfferSummary(live.draft);
  const { draft } = live;
  const brokenSteps = LIVE_CLASS_STEPS.filter((step) => live.stepHasErrors(step));

  if (publisher.justPublished) return <PublishedCard live={live} title={title} />;

  return (
    <div className="flex flex-col gap-4">
      {brokenSteps.length > 0 ? (
        <Note tone="warn">
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
        </Note>
      ) : (
        <Note tone="success">{t('liveWizard.reviewComplete')}</Note>
      )}

      <ReviewSection title={t('liveWizard.reviewCourse')} onEdit={() => onEdit('basics')}>
        <div className="flex flex-wrap items-start gap-4">
          {coverUrl ? (
            <img
              src={resolveMediaUrl(coverUrl)}
              alt=""
              className="h-28 w-[200px] shrink-0 rounded-[10px] border object-cover"
            />
          ) : (
            <span className="grid h-28 w-[200px] shrink-0 place-items-center rounded-[10px] border bg-muted text-muted-foreground">
              <ImageIcon className="h-6 w-6" aria-hidden />
            </span>
          )}
          <div className="min-w-0 flex-[1_1_280px]">
            <p className="text-[17px] font-extrabold">{title}</p>
            <p className="line-clamp-2 text-[13px] text-muted-foreground">{description}</p>
            <p className="mt-1.5 text-[13px] text-muted-foreground">
              {t('liveWizard.reviewLevel')}: {t(levelKey)} ·{' '}
              {t('liveWizard.topicsCount', { count: formatNumber(live.topics.length) })}
            </p>
          </div>
        </div>
      </ReviewSection>

      <ReviewSection title={t('liveWizard.stepSchedule')} onEdit={() => onEdit('schedule')}>
        <div className="flex flex-col divide-y">
          {live.classes.map((item) => (
            <div key={item.schedule.key} className="py-3 first:pt-0 last:pb-0">
              <ClassReviewRows item={item} timezone={live.timezone} />
            </div>
          ))}
        </div>
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
        <ClassLinkField live={live} />
      </ReviewSection>
    </div>
  );
}
