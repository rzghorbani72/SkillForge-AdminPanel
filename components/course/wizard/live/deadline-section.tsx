'use client';

import { CalendarClock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { FormSection } from '@/app/(protected)/courses/[course_id]/live/_components/form-section';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { DeadlineTimeline } from './deadline-timeline';
import { defaultDeadline } from './live-class-draft';
import { FieldError, RiskHint } from './live-ui';
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
    <section className="space-y-4 rounded-2xl border bg-card p-5">
      <FormSection icon={CalendarClock} title={t('liveWizard.deadlineTitle')}>
        <div className="max-w-sm space-y-1.5">
          <Label htmlFor="live-deadline">{t('liveWizard.deadline')} *</Label>
          <DatePicker
            id="live-deadline"
            withTime
            value={draft.joinDeadline}
            onChange={(joinDeadline) => update({ joinDeadline })}
            minDate={new Date()}
          />
          <p className="text-xs text-muted-foreground">{t('liveWizard.deadlineHint')}</p>
          <FieldError messageKey={errors.joinDeadline} />
        </div>
        {deadline && first && last ? (
          <DeadlineTimeline deadline={deadline} first={first} last={last} />
        ) : null}
        {live.missedAtDeadline > 0 && !live.errors.joinDeadline ? (
          <RiskHint tone="warn">
            <span className="block">
              {t('liveWizard.lateJoinWarning', { count: formatNumber(live.missedAtDeadline) })}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => update({ joinDeadline: defaultDeadline(draft.startsOn) })}
            >
              {t('liveWizard.closeBeforeStart')}
            </Button>
          </RiskHint>
        ) : null}
      </FormSection>
    </section>
  );
}
