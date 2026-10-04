'use client';

import { ArrowLeft, ArrowRight, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/hooks';

type WizardNavProps = {
  index: number;
  isLast: boolean;
  isSaving: boolean;
  /** Label of the step "Continue" leads to. */
  nextLabel?: string;
  /** Off when the last step brings its own actions. */
  showFinish?: boolean;
  onBack: () => void;
  onSaveAndExit?: () => void;
  onNext: () => void;
  onFinish: () => void;
};

export function WizardNav({
  index,
  isLast,
  isSaving,
  nextLabel,
  showFinish = true,
  onBack,
  onSaveAndExit,
  onNext,
  onFinish,
}: WizardNavProps) {
  const { t } = useTranslation();

  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/30 px-4 py-3">
      {onSaveAndExit && !isLast ? (
        <Button type="button" variant="ghost" disabled={isSaving} onClick={onSaveAndExit}>
          {t('courses.wizard.saveAndExit')}
        </Button>
      ) : (
        <span />
      )}

      <div className="flex items-center gap-3">
        {index > 0 && (
          <Button type="button" variant="outline" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            {t('common.back')}
          </Button>
        )}
        {isLast && !showFinish ? null : isLast ? (
          <Button type="button" disabled={isSaving} onClick={onFinish} className="gap-2">
            <Save className="h-4 w-4" />
            {t('courses.wizard.saveCourse')}
          </Button>
        ) : (
          <Button type="button" onClick={onNext} className="gap-2">
            {nextLabel ? t('courses.wizard.continueTo', { step: nextLabel }) : t('common.next')}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Button>
        )}
      </div>
    </div>
  );
}
