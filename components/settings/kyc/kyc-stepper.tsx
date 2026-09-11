'use client';

import { Check, Lock } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';
import type { KycStepIndex } from './use-kyc-wizard';

const STEP_LABEL_KEYS = [
  'settings.kyc.sectionIdentity',
  'settings.kyc.sectionFinancial',
  'settings.kyc.sectionCard'
] as const;

type Props = {
  current: KycStepIndex;
  doneUpto: KycStepIndex;
  maxReachable: number;
  onSelect: (step: KycStepIndex) => void;
};

/** Clickable progress rail: finished steps stay open for review. */
export function KycStepper({
  current,
  doneUpto,
  maxReachable,
  onSelect
}: Props) {
  const { t, language } = useTranslation();
  const digit = (index: number) =>
    language === 'fa' ? ['۱', '۲', '۳'][index] : String(index + 1);

  return (
    <ol className="flex flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-3">
      {STEP_LABEL_KEYS.map((key, index) => {
        const done = index < doneUpto;
        const active = index === current;
        const reachable = index <= maxReachable;
        return (
          <li key={key} className="flex-1">
            <button
              type="button"
              disabled={!reachable}
              onClick={() => onSelect(index as KycStepIndex)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg border p-3 text-start transition-colors',
                active
                  ? 'border-primary bg-primary/5'
                  : done
                    ? 'border-success/40 bg-success/5'
                    : 'border-border bg-muted/30',
                reachable
                  ? 'hover:border-primary/60'
                  : 'cursor-not-allowed opacity-60'
              )}
            >
              <span
                className={cn(
                  'grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-semibold',
                  done
                    ? 'bg-success text-success-foreground'
                    : active
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                )}
              >
                {done ? (
                  <Check className="h-4 w-4" />
                ) : !reachable ? (
                  <Lock className="h-3.5 w-3.5" />
                ) : (
                  digit(index)
                )}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium">{t(key)}</span>
                <span className="block text-xs text-muted-foreground">
                  {done
                    ? t('settings.kyc.stepDone')
                    : active
                      ? t('settings.kyc.stepCurrent')
                      : t('settings.kyc.stepPending')}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
