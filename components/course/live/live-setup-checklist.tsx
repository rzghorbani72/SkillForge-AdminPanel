'use client';

import type { ReactNode } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { cn } from '@/lib/utils';
import { currentLiveSetupStep, liveSetupDoneCount, type LiveSetupStep } from './live-setup-steps';

interface LiveSetupChecklistProps {
  steps: readonly LiveSetupStep[];
  /** Publish button or link, shown beside the progress. */
  action?: ReactNode;
  /** Hides the "what to do next" band, e.g. on the read-only overview tab. */
  compact?: boolean;
}

/**
 * Setup as one visible path instead of four equal cards. A teacher who opens a
 * half-built live course sees how far they got, which single step is next, and
 * why publishing is still disabled — the three questions the old grey line
 * under the publish button tried to answer at once.
 */
export function LiveSetupChecklist({ steps, action, compact = false }: LiveSetupChecklistProps) {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const current = currentLiveSetupStep(steps);
  const done = liveSetupDoneCount(steps);
  const ready = current === null;

  return (
    <section
      className={cn(
        'rounded-2xl border p-4 sm:p-5',
        ready ? 'border-emerald-500/30 bg-emerald-500/5' : 'bg-card',
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            {ready ? <Sparkles className="h-4 w-4 text-emerald-600" /> : null}
            {ready ? t('courses.live.setupReadyTitle') : t('courses.live.setupTitle')}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {ready
              ? t('courses.live.setupReadyHint')
              : t('courses.live.setupProgress', {
                  done: formatNumber(done),
                  total: formatNumber(steps.length),
                })}
          </p>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>

      <ol className="mt-4 grid grid-cols-3 gap-x-2 gap-y-4">
        {steps.map((step, index) => {
          const isCurrent = current?.id === step.id;
          return (
            <li key={step.id} className="min-w-0">
              <div className="flex items-center gap-2">
                <span
                  aria-hidden
                  className={cn('h-px flex-1', index === 0 ? 'opacity-0' : 'bg-border')}
                />
                <span
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold',
                    step.done && 'border-emerald-500/40 bg-emerald-500/15 text-emerald-600',
                    isCurrent && 'border-primary bg-primary text-primary-foreground',
                    !step.done && !isCurrent && 'border-dashed text-muted-foreground',
                  )}
                >
                  {step.done ? <Check className="h-3.5 w-3.5" /> : formatNumber(index + 1)}
                </span>
                <span
                  aria-hidden
                  className={cn(
                    'h-px flex-1',
                    index === steps.length - 1 ? 'opacity-0' : 'bg-border',
                  )}
                />
              </div>
              <p
                className={cn(
                  'mt-1.5 truncate text-center text-xs',
                  isCurrent ? 'font-semibold text-foreground' : 'text-muted-foreground',
                )}
              >
                {t(step.labelKey)}
              </p>
            </li>
          );
        })}
      </ol>

      {!compact && current ? (
        <p className="mt-4 rounded-xl bg-muted/60 px-3 py-2.5 text-sm">
          <span className="font-semibold">{t('courses.live.nextStep')}: </span>
          {t(current.hintKey)}
        </p>
      ) : null}
    </section>
  );
}
