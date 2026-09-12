'use client';

import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/hooks';
import type { KycWizardStep } from './use-kyc-wizard';

type Props = {
  step: KycWizardStep;
  stepIndex: number;
  busy: boolean;
  canAdvance: boolean;
  awaitingIbanConfirm: boolean;
  nextLabel: string;
  onBack: () => void;
  onNext: () => void;
};

export function KycWizardNav({
  step,
  stepIndex,
  busy,
  canAdvance,
  awaitingIbanConfirm,
  nextLabel,
  onBack,
  onNext
}: Props) {
  const { t } = useTranslation();
  const hint =
    step === 'identity'
      ? t('settings.kyc.identityStepHint')
      : awaitingIbanConfirm
        ? t('settings.kyc.ibanConfirmHint')
        : t('settings.kyc.shebaStepHint');

  return (
    <div className="flex flex-wrap items-center gap-3">
      {stepIndex > 0 ? (
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={busy}
        >
          {t('common.back')}
        </Button>
      ) : null}
      <Button type="button" onClick={onNext} disabled={!canAdvance}>
        {busy ? t('settings.kyc.verifying') : nextLabel}
      </Button>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
