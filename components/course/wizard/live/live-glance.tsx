'use client';

import type { ReactNode } from 'react';
import { CalendarDays, LogIn, Users, Video, type LucideIcon } from 'lucide-react';

import { GroupScheduleSummary } from '@/components/class/group-schedule-summary';
import { IconBox } from '@/components/shared/icon-box';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { stepsFor, type CourseWizardStep } from '../wizard-steps';
import type { LiveClassDraftApi } from './use-live-class-draft';
import { useLiveSummary } from './use-live-summary';

const LIVE_STEPS = stepsFor('LIVE');

function GlanceRow({
  icon: Icon,
  label,
  filled,
  children,
}: {
  icon: LucideIcon;
  label: string;
  filled: boolean;
  children: ReactNode;
}) {
  return (
    <li className="flex items-start gap-2.5 border-t py-3 first:border-t-0">
      <IconBox icon={Icon} tone={filled ? 'primary' : 'muted'} />
      <div className="min-w-0 leading-relaxed">
        <p className="text-xs text-muted-foreground">{label}</p>
        {children}
      </div>
    </li>
  );
}

/** "Your class at a glance": what, when, for whom and how students get in, filled as the steps are. */
export function LiveGlance({
  live,
  title,
  step,
}: {
  live: LiveClassDraftApi;
  title: string;
  step: CourseWizardStep;
}) {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const summary = useLiveSummary(live);
  const reached = (target: CourseWizardStep) =>
    LIVE_STEPS.indexOf(step) >= LIVE_STEPS.indexOf(target);
  const pending = (target: CourseWizardStep) => (
    <p className="text-muted-foreground/70">
      {t('liveWizard.glanceInStep', { step: formatNumber(LIVE_STEPS.indexOf(target) + 1) })}
    </p>
  );

  return (
    <section className="rounded-xl border bg-card px-[18px] py-4">
      <h2 className="text-[15px] font-extrabold">{t('liveWizard.glanceTitle')}</h2>
      <p className="text-xs text-muted-foreground">{t('liveWizard.glanceHint')}</p>
      <ul>
        <GlanceRow icon={Video} label={t('liveWizard.glanceWhat')} filled={Boolean(title)}>
          {title ? (
            <p className="font-bold">{t('liveWizard.glanceWhatValue', { title })}</p>
          ) : (
            pending('basics')
          )}
        </GlanceRow>
        <GlanceRow
          icon={CalendarDays}
          label={t('liveWizard.glanceWhen')}
          filled={Boolean(summary.sessions)}
        >
          {summary.sessions ? (
            <>
              <GroupScheduleSummary slots={live.draft.slots} timezone={live.group?.timezone} />
              <p className="text-[13px] text-muted-foreground">{summary.sessions}</p>
              {summary.deadline ? (
                <p className="text-[13px] text-muted-foreground">
                  {t('liveWizard.glanceDeadline', { date: summary.deadline })}
                </p>
              ) : null}
            </>
          ) : (
            pending('schedule')
          )}
        </GlanceRow>
        <GlanceRow icon={Users} label={t('liveWizard.glancePrice')} filled={Boolean(summary.price)}>
          {summary.price ? (
            <>
              <p className="font-bold">{summary.kind}</p>
              <p className="text-[13px] text-muted-foreground">{summary.price}</p>
            </>
          ) : (
            pending('classType')
          )}
        </GlanceRow>
        <GlanceRow icon={LogIn} label={t('liveWizard.glanceEnter')} filled={reached('meeting')}>
          {reached('meeting') ? (
            <>
              <p className="font-bold">{t('liveWizard.glanceEnterValue')}</p>
              <p className="text-[13px] text-muted-foreground">{summary.meeting}</p>
            </>
          ) : (
            pending('meeting')
          )}
        </GlanceRow>
      </ul>
    </section>
  );
}
