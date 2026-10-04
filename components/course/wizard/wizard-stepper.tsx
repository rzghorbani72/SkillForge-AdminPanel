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

const CHIP = {
  todo: 'border-border bg-background text-muted-foreground hover:border-primary/40',
  done: 'border-border bg-background text-success',
  current: 'border-primary/30 bg-primary/10 font-bold text-primary',
  invalid: 'border-destructive/30 bg-destructive/10 text-destructive',
} as const;

const DOT = {
  todo: 'border-border bg-card',
  done: 'border-success bg-success text-success-foreground',
  current: 'border-primary bg-primary text-primary-foreground',
  invalid: 'border-destructive bg-destructive text-destructive-foreground',
} as const;

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
    <ol className="flex flex-wrap gap-1.5">
      {steps.map((step, index) => {
        const state = invalid.includes(step)
          ? 'invalid'
          : index === currentIndex
            ? 'current'
            : index < currentIndex
              ? 'done'
              : 'todo';

        return (
          <li key={step}>
            <button
              type="button"
              onClick={() => onSelect(step)}
              aria-current={index === currentIndex ? 'step' : undefined}
              className={cn(
                'inline-flex items-center gap-2 rounded-full border py-[5px] pe-3 ps-3.5 text-[13px] transition-colors',
                CHIP[state],
              )}
            >
              <span
                className={cn(
                  'grid h-[22px] w-[22px] place-items-center rounded-full border text-xs',
                  DOT[state],
                )}
              >
                {state === 'invalid' ? (
                  '!'
                ) : state === 'done' ? (
                  <Check className="h-3.5 w-3.5" aria-hidden />
                ) : (
                  formatNumber(index + 1)
                )}
              </span>
              {t(WIZARD_STEP_LABEL[step])}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
