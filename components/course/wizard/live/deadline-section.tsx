'use client';

import { CalendarClock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { FormSection } from '@/app/(protected)/courses/[course_id]/live/_components/form-section';
import { useTranslation } from '@/lib/i18n/hooks';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { defaultDeadline } from './live-class-draft';
import { FieldError, RiskHint } from './live-ui';
import type { LiveClassDraftApi } from './use-live-class-draft';

const DAY_TIME: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
};

/** Registration close date beside the first session, so their order is obvious. */
export function DeadlineSection({ live }: { live: LiveClassDraftApi }) {
  const { t } = useTranslation();
  const formatDate = useDateFormat();
  const formatNumber = useNumberFormat();
  const { draft, shownErrors: errors, update } = live;
  const first = live.dates.at(0);
  const deadline = draft.joinDeadline ? new Date(draft.joinDeadline) : null;

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
        {deadline && first ? (
          <ul className="grid gap-2 text-sm sm:grid-cols-2">
            <li className="rounded-lg border px-3 py-2">
              <span className="block text-xs text-muted-foreground">
                {t('liveWizard.registrationCloses')}
              </span>
              <span className="font-medium">{formatDate(deadline, DAY_TIME)}</span>
            </li>
            <li className="rounded-lg border px-3 py-2">
              <span className="block text-xs text-muted-foreground">
                {t('liveWizard.firstSession')}
              </span>
              <span className="font-medium">{formatDate(first, DAY_TIME)}</span>
            </li>
          </ul>
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
