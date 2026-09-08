'use client';

import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/hooks';
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
  onSelectStep,
  saveStatus,
  onSave,
  onRetrySave,
  onBack
}: WizardHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
      {title && onBack && (
        <div className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={onBack}
              aria-label={t('common.back')}
            >
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            </Button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-xl font-bold tracking-tight">
                  {title}
                </h1>
                <CourseTypePill type={courseType} />
              </div>
              <p className="mt-0.5 truncate text-sm text-muted-foreground">
                {subtitle}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center justify-between gap-3 px-4 py-2 sm:px-6">
        <WizardStepper current={step} steps={steps} onSelect={onSelectStep} />
        {saveStatus && onSave && onRetrySave && (
          <WizardSaveButton
            saveStatus={saveStatus}
            onSave={onSave}
            onRetry={onRetrySave}
          />
        )}
      </div>
    </div>
  );
}
