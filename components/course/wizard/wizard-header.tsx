'use client';

import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';
import { CourseTypePill } from '../course-type-pill';
import type { CourseType } from '../course-drafts';
import type { SaveStatus } from '../useCourseForm';
import { WizardSaveButton } from './wizard-save-button';
import { WizardStepper } from './wizard-stepper';
import type { CourseWizardStep } from './wizard-steps';

type WizardHeaderProps = {
  /** Omitted inside the course workspace, whose own header already names it. */
  title?: string;
  subtitle?: string;
  courseType?: CourseType;
  step: CourseWizardStep;
  steps?: readonly CourseWizardStep[];
  invalidSteps?: readonly CourseWizardStep[];
  onSelectStep: (step: CourseWizardStep) => void;
  /** Absent while the course does not exist yet (nothing to autosave or save). */
  saveStatus?: SaveStatus;
  onSave?: () => Promise<boolean>;
  onRetrySave?: () => void;
  onBack?: () => void;
};

/**
 * Pinned to the top of the builder: the manager clicks the next step from
 * wherever the page has scrolled to, without hunting for it.
 */
export function WizardHeader({
  title,
  subtitle,
  courseType,
  step,
  steps,
  invalidSteps,
  onSelectStep,
  saveStatus,
  onSave,
  onRetrySave,
  onBack,
}: WizardHeaderProps) {
  const { t } = useTranslation();
  const hasTitle = Boolean(title && onBack);

  return (
    <div className="sticky top-0 z-20 border-b bg-card">
      <div className="mx-auto w-full max-w-[1200px] px-4 pb-3.5 pt-4 sm:px-6">
        {hasTitle ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-xl font-extrabold">{title}</h1>
                {courseType === 'LIVE' ? null : <CourseTypePill type={courseType} />}
              </div>
              <p className="truncate text-[13px] text-muted-foreground">{subtitle}</p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={onBack}>
              {t('liveWizard.exit')}
            </Button>
          </div>
        ) : null}

        <div
          className={cn('flex flex-wrap items-center justify-between gap-3', hasTitle && 'mt-3.5')}
        >
          <WizardStepper
            current={step}
            steps={steps}
            invalid={invalidSteps}
            onSelect={onSelectStep}
          />
          {saveStatus && onSave && onRetrySave && (
            <WizardSaveButton saveStatus={saveStatus} onSave={onSave} onRetry={onRetrySave} />
          )}
        </div>
      </div>
    </div>
  );
}
