'use client';

import Link from 'next/link';
import { Clock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { NumberInput } from '@/components/ui/number-input';
import { FormSection } from '@/app/(protected)/courses/[course_id]/live/_components/form-section';
import { SessionDatesPreview } from '@/app/(protected)/courses/[course_id]/live/_components/session-dates-preview';
import { GroupSlotEditor } from '@/app/(protected)/tutoring/groups/_components/group-slot-editor';
import { useTranslation } from '@/lib/i18n/hooks';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { DeadlineSection } from './deadline-section';
import { FieldError, RiskHint } from './live-ui';
import type { LiveClassDraftApi } from './use-live-class-draft';

const DAY: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };

export function StepSchedule({ live }: { live: LiveClassDraftApi }) {
  const { t } = useTranslation();
  const formatDate = useDateFormat();
  const formatNumber = useNumberFormat();
  const { draft, dates, shownErrors: errors, update, scheduleLocked } = live;
  const first = dates.at(0);
  const last = dates.at(-1);
  const classesPage = `/courses/${live.courseId}/live`;
  const [firstSlot] = draft.slots;
  const timesDiffer = draft.slots.some(
    (slot) =>
      slot.start_minute !== firstSlot?.start_minute ||
      slot.duration_minutes !== firstSlot?.duration_minutes,
  );
  const sameTimeForAll = () => {
    if (!firstSlot) return;
    const { start_minute, duration_minutes } = firstSlot;
    update({ slots: draft.slots.map((slot) => ({ ...slot, start_minute, duration_minutes })) });
  };

  return (
    <div className="space-y-6">
      {scheduleLocked ? (
        <RiskHint tone="warn">
          {t('liveWizard.scheduleLocked')}{' '}
          <Link href={classesPage} className="font-medium underline">
            {t('liveWizard.openClassesPage')}
          </Link>
        </RiskHint>
      ) : null}
      {live.otherClasses > 0 ? (
        <RiskHint>
          {t('liveWizard.otherClasses', { count: formatNumber(live.otherClasses) })}{' '}
          <Link href={classesPage} className="font-medium underline">
            {t('liveWizard.openClassesPage')}
          </Link>
        </RiskHint>
      ) : null}

      <div className="grid gap-6 rounded-2xl border bg-card p-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-8">
        <FormSection icon={Clock} title={t('liveWizard.weeklyTitle')}>
          <div className="space-y-1.5">
            <Label htmlFor="live-starts-on">{t('liveWizard.startDate')} *</Label>
            <DatePicker
              id="live-starts-on"
              value={draft.startsOn}
              onChange={(startsOn) => update({ startsOn })}
              minDate={new Date()}
              disabled={scheduleLocked}
            />
            <FieldError messageKey={errors.startsOn} />
          </div>
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label>{t('liveWizard.classDays')} *</Label>
              {timesDiffer && !scheduleLocked ? (
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto p-0"
                  onClick={sameTimeForAll}
                >
                  {t('liveWizard.sameTimeAllDays')}
                </Button>
              ) : null}
            </div>
            <GroupSlotEditor
              slots={draft.slots}
              onChange={(slots) => update({ slots })}
              disabled={scheduleLocked}
            />
            <FieldError messageKey={errors.slots} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="live-session-count">{t('liveWizard.sessionCount')} *</Label>
            <NumberInput
              id="live-session-count"
              value={draft.sessionCount}
              min={1}
              max={200}
              onChange={(sessionCount) => update({ sessionCount })}
              disabled={scheduleLocked}
            />
            <p className="text-xs text-muted-foreground">{t('liveWizard.sessionCountHint')}</p>
            <FieldError messageKey={errors.sessionCount} />
          </div>
          {first && last ? (
            <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">
              {t('liveWizard.scheduleSummary', {
                count: formatNumber(dates.length),
                from: formatDate(first, DAY),
                to: formatDate(last, DAY),
              })}
            </p>
          ) : null}
        </FormSection>
        <SessionDatesPreview dates={dates} coursePublished={Boolean(live.course?.is_published)} />
      </div>

      <DeadlineSection live={live} />
    </div>
  );
}
