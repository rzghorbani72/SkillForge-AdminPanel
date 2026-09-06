'use client';

import { Check } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { cn } from '@/lib/utils';
import {
  COURSE_WIZARD_STEPS,
  WIZARD_STEP_LABEL,
  type CourseWizardStep
} from './wizard-steps';

type WizardStepperProps = {
  current: CourseWizardStep;
  /** Steps after this index are not open yet (a new course has no id). */
  maxReachableIndex: number;
  onSelect: (step: CourseWizardStep) => void;
};

/**
 * The course wizard's map: where the manager is, what is done, and what is
 * still locked. Done steps stay clickable so going back is never a re-run.
 */
export function WizardStepper({
  current,
  maxReachableIndex,
  onSelect
}: WizardStepperProps) {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const currentIndex = COURSE_WIZARD_STEPS.indexOf(current);

  return (
    <ol className="flex items-center gap-1 overflow-x-auto py-1">
      {COURSE_WIZARD_STEPS.map((step, index) => {
        const done = index < currentIndex;
        const active = index === currentIndex;
        const locked = index > maxReachableIndex;

        return (
          <li key={step} className="flex shrink-0 items-center">
            <button
              type="button"
              disabled={locked}
              onClick={() => onSelect(step)}
              aria-current={active ? 'step' : undefined}
              className={cn(
                'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition-colors',
                active && 'bg-primary/10 font-medium text-foreground',
                !active && !locked && 'text-muted-foreground hover:bg-accent',
                locked && 'cursor-not-allowed text-muted-foreground/50'
              )}
            >
              <span
                className={cn(
                  'inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs tabular-nums',
                  active && 'border-primary bg-primary text-primary-foreground',
                  done && 'border-primary/40 bg-primary/10 text-primary'
                )}
              >
                {done ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  formatNumber(index + 1)
                )}
              </span>
              {t(WIZARD_STEP_LABEL[step])}
            </button>
            {index < COURSE_WIZARD_STEPS.length - 1 && (
              <span className="mx-1 h-px w-4 shrink-0 bg-border sm:w-6" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
