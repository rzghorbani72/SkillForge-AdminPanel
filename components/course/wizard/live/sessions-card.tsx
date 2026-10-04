'use client';

import { Hash } from 'lucide-react';

import { NumberInput } from '@/components/ui/number-input';
import { Note } from '@/components/shared/note';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { FieldError, FieldLabel } from '@/components/shared/field-label';
import { SectionCard } from '@/components/shared/section-card';
import { SessionDateChips } from './session-date-chips';
import type { LiveClassDraftApi } from './use-live-class-draft';
import { useLiveSummary } from './use-live-summary';

/** How many sessions, and the real dates they fall on. */
export function SessionsCard({ live }: { live: LiveClassDraftApi }) {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const summary = useLiveSummary(live);
  const { draft, dates, shownErrors: errors, update, scheduleLocked } = live;
  const perWeek = draft.slots.length;

  return (
    <SectionCard
      icon={Hash}
      title={t('liveWizard.sessionsTitle')}
      hint={t('liveWizard.sessionCountHint')}
    >
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex w-[200px] flex-col gap-1.5">
          <FieldLabel htmlFor="live-session-count" required>
            {t('liveWizard.sessionCount')}
          </FieldLabel>
          <NumberInput
            id="live-session-count"
            value={draft.sessionCount}
            min={1}
            max={200}
            suffix={t('liveWizard.sessionUnit')}
            onChange={(sessionCount) => update({ sessionCount })}
            disabled={scheduleLocked}
          />
          <FieldError messageKey={errors.sessionCount} />
        </div>
        {summary.sessions ? (
          <Note tone="success" className="flex-[1_1_300px]">
            <b className="block">{summary.sessions}</b>
            {t('liveWizard.scheduleRhythm', {
              perWeek: formatNumber(perWeek),
              weeks: formatNumber(Math.ceil(dates.length / Math.max(perWeek, 1))),
            })}
          </Note>
        ) : null}
      </div>
      {dates.length > 0 ? <SessionDateChips dates={dates} /> : null}
      <p className="text-xs text-muted-foreground">{t('liveWizard.datesHint')}</p>
    </SectionCard>
  );
}
