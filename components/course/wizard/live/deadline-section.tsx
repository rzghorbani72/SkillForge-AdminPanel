'use client';

import { Clock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Note } from '@/components/shared/note';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { DeadlineTimeline } from './deadline-timeline';
import { defaultDeadline } from './live-class-draft';
import { FieldError, FieldLabel } from '@/components/shared/field-label';
import { SectionCard } from '@/components/shared/section-card';
import type { LiveClassDraftApi } from './use-live-class-draft';

/** Registration close date beside the first session, so their order is obvious. */
export function DeadlineSection({ live }: { live: LiveClassDraftApi }) {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const { draft, shownErrors: errors, update } = live;
  const first = live.dates.at(0);
  const last = live.dates.at(-1);
  const parsed = new Date(draft.joinDeadline);
  const deadline = Number.isNaN(parsed.getTime()) ? null : parsed;

  return (
    <SectionCard
      icon={Clock}
      title={t('liveWizard.deadlineTitle')}
      hint={t('liveWizard.deadlineCardHint')}
    >
      <div className="flex max-w-[320px] flex-col gap-1.5">
        <FieldLabel htmlFor="live-deadline" required>
          {t('liveWizard.deadline')}
        </FieldLabel>
        <DatePicker
          id="live-deadline"
          withTime
          value={draft.joinDeadline}
          onChange={(joinDeadline) => update({ joinDeadline })}
          minDate={new Date()}
        />
        <FieldError messageKey={errors.joinDeadline} />
      </div>
      <p className="text-xs text-muted-foreground">{t('liveWizard.deadlineHint')}</p>
      {deadline && first && last ? (
        <DeadlineTimeline deadline={deadline} first={first} last={last} />
      ) : null}
      {live.missedAtDeadline > 0 && !live.errors.joinDeadline ? (
        <Note tone="warn">
          {t('liveWizard.lateJoinWarning', { count: formatNumber(live.missedAtDeadline) })}
          <div className="mt-2 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => update({ joinDeadline: defaultDeadline(draft.startsOn) })}
            >
              {t('liveWizard.closeBeforeStart')}
            </Button>
          </div>
        </Note>
      ) : null}
    </SectionCard>
  );
}
