'use client';

import type { ReactNode } from 'react';
import { CalendarDays, LogIn, Users, Video, type LucideIcon } from 'lucide-react';

import { GroupScheduleSummary } from '@/components/class/group-schedule-summary';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { cn } from '@/lib/utils';
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
    <li className="flex items-start gap-3 border-t pt-3 first:border-t-0 first:pt-0">
      <span
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
          filled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
        )}
      >
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <div className="min-w-0 space-y-0.5 text-sm">
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
    <p className="text-muted-foreground">
      {t('liveWizard.glanceInStep', { step: formatNumber(LIVE_STEPS.indexOf(target) + 1) })}
    </p>
  );

  return (
    <section className="space-y-3 rounded-2xl border bg-muted/30 p-4">
      <div>
        <h2 className="text-sm font-bold">{t('liveWizard.glanceTitle')}</h2>
        <p className="text-xs text-muted-foreground">{t('liveWizard.glanceHint')}</p>
      </div>
      <ul className="space-y-3">
        <GlanceRow icon={Video} label={t('liveWizard.glanceWhat')} filled={Boolean(title)}>
          {title ? (
            <p className="font-medium">{t('liveWizard.glanceWhatValue', { title })}</p>
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
              <p className="text-xs text-muted-foreground">{summary.sessions}</p>
              {summary.deadline ? (
                <p className="text-xs text-muted-foreground">
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
              <p className="font-medium">{summary.kind}</p>
              <p className="text-xs text-muted-foreground">{summary.price}</p>
            </>
          ) : (
            pending('classType')
          )}
        </GlanceRow>
        <GlanceRow icon={LogIn} label={t('liveWizard.glanceEnter')} filled={reached('meeting')}>
          {reached('meeting') ? (
            <>
              <p className="font-medium">{t('liveWizard.glanceEnterValue')}</p>
              <p className="text-xs text-muted-foreground">{summary.meeting}</p>
            </>
          ) : (
            pending('meeting')
          )}
        </GlanceRow>
      </ul>
    </section>
  );
}
