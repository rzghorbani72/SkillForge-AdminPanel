'use client';

import type { ReactNode } from 'react';
import { ArrowRight, Globe, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/hooks';

type WizardNavProps = {
  index: number;
  isLast: boolean;
  isSaving: boolean;
  /** Shows a spinner on "Continue" while it is working. */
  nextBusy?: boolean;
  /** Label of the step "Continue" leads to. */
  nextLabel?: string;
  /** Replaces the finish buttons when the last step brings its own actions. */
  finishActions?: ReactNode;
  /** A draft ends with a clear choice: publish now, or keep it unpublished. */
  offerPublish?: boolean;
  onBack: () => void;
  onSaveAndExit?: () => void;
  onNext: () => void;
  /** `undefined` keeps the visibility picked on the access step. */
  onFinish: (publish?: boolean) => void;
};

/** Pinned to the bottom of the page, so the next move is always one click away. */
export function WizardNav({
  index,
  isLast,
  isSaving,
  nextBusy = false,
  nextLabel,
  finishActions,
  offerPublish = false,
  onBack,
  onSaveAndExit,
  onNext,
  onFinish,
}: WizardNavProps) {
  const { t } = useTranslation();

  const back =
    index > 0 ? (
      <Button type="button" variant="outline" onClick={onBack}>
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
    <div className="sticky bottom-0 z-10 -mx-4 -mb-4 mt-6 border-t bg-card px-4 py-3 sm:-mx-6 sm:-mb-6 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {isLast ? (
          (back ?? <span />)
        ) : onSaveAndExit ? (
          <Button type="button" variant="ghost" disabled={isSaving} onClick={onSaveAndExit}>
            {t('courses.wizard.saveAndExit')}
          </Button>
        ) : (
          <span />
        )}

        <div className="flex flex-wrap items-center gap-3">
          {isLast ? (
            finish
          ) : (
            <>
              {back}
              <Button type="button" disabled={nextBusy} onClick={onNext} className="gap-2">
                {nextLabel ? t('courses.wizard.continueTo', { step: nextLabel }) : t('common.next')}
                {nextBusy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
