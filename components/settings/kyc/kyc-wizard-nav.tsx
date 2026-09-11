'use client';

import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/hooks';

type Props = {
  step: 'identity' | 'iban' | 'card';
  stepIndex: number;
  busy: boolean;
  canAdvance: boolean;
  awaitingIbanConfirm: boolean;
  settlementEligible: boolean;
  cardDeferred: boolean;
  nextLabel: string;
  onBack: () => void;
  onNext: () => void;
  onSkipCard: () => void;
  onResumeCard: () => void;
};

export function KycWizardNav({
  step,
  stepIndex,
  busy,
  canAdvance,
  awaitingIbanConfirm,
  settlementEligible,
  cardDeferred,
  nextLabel,
  onBack,
  onNext,
  onSkipCard,
  onResumeCard
}: Props) {
  const { t } = useTranslation();
  const hint =
    step === 'card' && settlementEligible
      ? t('settings.kyc.cardSkipHint')
      : step === 'identity'
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
      {step === 'card' && cardDeferred ? (
        <Button type="button" variant="outline" onClick={onResumeCard}>
          {t('settings.kyc.resumeCardUpload')}
        </Button>
      ) : (
        <Button type="button" onClick={onNext} disabled={!canAdvance}>
          {busy ? t('settings.kyc.verifying') : nextLabel}
        </Button>
      )}
      {step === 'card' && settlementEligible && !cardDeferred ? (
        <Button
          type="button"
          variant="ghost"
          onClick={onSkipCard}
          disabled={busy}
        >
          {t('settings.kyc.skipCardForNow')}
        </Button>
      ) : null}
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
