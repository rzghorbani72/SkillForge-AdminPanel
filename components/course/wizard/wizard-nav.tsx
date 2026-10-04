'use client';

import { ArrowLeft, ArrowRight, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/hooks';

type WizardNavProps = {
  index: number;
  isLast: boolean;
  isSaving: boolean;
  showSave: boolean;
  /** Off when the last step brings its own actions. */
  showFinish?: boolean;
  onBack: () => void;
  onSave: () => void;
  onNext: () => void;
  onFinish: () => void;
};

export function WizardNav({
  index,
  isLast,
  isSaving,
  showSave,
  showFinish = true,
  onBack,
  onSave,
  onNext,
  onFinish,
}: WizardNavProps) {
  const { t } = useTranslation();

  return (
    <div className="mt-6 flex items-center justify-between gap-3 rounded-lg border bg-muted/30 px-4 py-3">
      <Button
        type="button"
        variant="ghost"
        disabled={index === 0}
        onClick={onBack}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        {t('common.back')}
      </Button>

      <div className="flex items-center gap-3">
        {!isLast && showSave && (
          <Button
            type="button"
            variant="outline"
            disabled={isSaving}
            onClick={onSave}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {t('common.save')}
          </Button>
        )}
        {isLast && !showFinish ? null : isLast ? (
          <Button type="button" disabled={isSaving} onClick={onFinish} className="gap-2">
            <Save className="h-4 w-4" />
            {t('courses.wizard.saveCourse')}
          </Button>
        ) : (
          <Button type="button" onClick={onNext} className="gap-2">
            {t('common.next')}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Button>
        )}
      </div>
    </div>
  );
}
