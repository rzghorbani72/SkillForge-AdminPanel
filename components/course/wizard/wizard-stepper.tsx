'use client';

import { Check } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { cn } from '@/lib/utils';
import { COURSE_WIZARD_STEPS, WIZARD_STEP_LABEL, type CourseWizardStep } from './wizard-steps';

type WizardStepperProps = {
  current: CourseWizardStep;
  steps?: readonly CourseWizardStep[];
  /** Steps with errors the manager has been shown; drawn red. */
  invalid?: readonly CourseWizardStep[];
  onSelect: (step: CourseWizardStep) => void;
};

/**
 * The course wizard's map. Every step is clickable at any time, in create and
 * in edit alike: the work autosaves, so jumping around never loses anything.
 */
export function WizardStepper({
  current,
  steps = COURSE_WIZARD_STEPS,
  invalid = [],
  onSelect,
}: WizardStepperProps) {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const currentIndex = steps.indexOf(current);

  return (
    <ol className="flex items-center gap-1 overflow-x-auto py-1">
      {steps.map((step, index) => {
        const done = index < currentIndex;
        const active = index === currentIndex;
        const hasError = invalid.includes(step);

        return (
          <li key={step} className="flex shrink-0 items-center">
            <button
              type="button"
              onClick={() => onSelect(step)}
              aria-current={active ? 'step' : undefined}
              className={cn(
                'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition-colors',
                active
                  ? 'bg-primary/10 font-medium text-foreground'
                  : 'text-muted-foreground hover:bg-accent',
                hasError && 'text-destructive',
              )}
            >
              <span
                className={cn(
                  'inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs tabular-nums',
                  active && 'border-primary bg-primary text-primary-foreground',
                  done && 'border-primary/40 bg-primary/10 text-primary',
                  hasError && 'border-destructive bg-destructive text-destructive-foreground',
                )}
              >
                {hasError ? (
                  '!'
                ) : done ? (
                  <Check className="h-3.5 w-3.5" aria-hidden />
                ) : (
                  formatNumber(index + 1)
                )}
              </span>
              {t(WIZARD_STEP_LABEL[step])}
            </button>
            {index < steps.length - 1 && (
              <span className="mx-1 h-px w-4 shrink-0 bg-border sm:w-6" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
