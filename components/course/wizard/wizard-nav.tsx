'use client';

import type { ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Globe, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/hooks';

type WizardNavProps = {
  index: number;
  isLast: boolean;
  isSaving: boolean;
  /** Shows a spinner on "Continue" while it is working. */
  nextBusy?: boolean;
  /** Replaces the finish buttons when the last step brings its own actions. */
  finishActions?: ReactNode;
  /** A draft ends with a clear choice: publish now, or keep it unpublished. */
  offerPublish?: boolean;
  onBack: () => void;
  onNext: () => void;
  /** `undefined` keeps the visibility picked on the access step. */
  onFinish: (publish?: boolean) => void;
};

/** The step's own action row, right under its content. */
export function WizardNav({
  index,
  isLast,
  isSaving,
  nextBusy = false,
  finishActions,
  offerPublish = false,
  onBack,
  onNext,
  onFinish,
}: WizardNavProps) {
  const { t } = useTranslation();

  const back =
    index > 0 ? (
      <Button type="button" variant="outline" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        {t('common.previous')}
      </Button>
    ) : null;

  const finish =
    finishActions ??
    (offerPublish ? (
      <>
        <Button
          type="button"
          variant="outline"
          disabled={isSaving}
          onClick={() => onFinish(false)}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          {t('courses.wizard.saveWithoutPublishing')}
        </Button>
        <Button type="button" disabled={isSaving} onClick={() => onFinish(true)} className="gap-2">
          <Globe className="h-4 w-4" />
          {t('courses.wizard.publishCourse')}
        </Button>
      </>
    ) : (
      <Button type="button" disabled={isSaving} onClick={() => onFinish()} className="gap-2">
        <Save className="h-4 w-4" />
        {t('courses.wizard.saveCourse')}
      </Button>
    ));

  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
      {back ?? <span />}

      <div className="flex flex-wrap items-center gap-3">
        {isLast ? (
          finish
        ) : (
          <Button type="button" disabled={nextBusy} onClick={onNext} className="gap-2">
            {t('courses.wizard.confirmAndContinue')}
            {nextBusy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
