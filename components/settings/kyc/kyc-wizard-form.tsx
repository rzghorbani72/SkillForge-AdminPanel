'use client';

import { Separator } from '@/components/ui/separator';
import { useTranslation } from '@/lib/i18n/hooks';
import type { KycState } from '@/types/kyc';
import { KycConfirmedSummary } from './kyc-confirmed-summary';
import { KycIbanConfirmCard } from './kyc-iban-confirm';
import { KycStepIdentity } from './kyc-step-identity';
import { KycStepSheba } from './kyc-step-sheba';
import { KycStepper } from './kyc-stepper';
import { KycWizardNav } from './kyc-wizard-nav';
import { resumeStep, useKycWizard } from './use-kyc-wizard';

type Props = {
  initial: KycState;
  onSubmitted: (next: KycState) => void;
};

export function KycWizardForm({ initial, onSubmitted }: Props) {
  const { t } = useTranslation();
  const wizard = useKycWizard(initial, onSubmitted);
  const {
    step,
    stepIndex,
    busy,
    state,
    nationalId,
    sheba,
    inputsLocked,
    awaitingIbanConfirm,
    confirmInfo,
    confirmSheba,
    stepAttempts,
    stepLockedUntil,
    maxReachableStep,
    nextLabel,
    canAdvance,
  } = wizard;

  return (
    <div className="space-y-6">
      {!state.verification_enabled ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {t('settings.kyc.serviceDisabled')}
        </p>
      ) : stepLockedUntil ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {t('settings.kyc.rateLimited')}
        </p>
      ) : stepAttempts.attempts_remaining < state.max_verify_attempts ? (
        <p className="text-xs text-muted-foreground">
          {t('settings.kyc.attemptsRemaining', {
            count: stepAttempts.attempts_remaining,
            total: state.max_verify_attempts,
          })}
        </p>
      ) : null}

      <KycStepper
        current={stepIndex}
        doneUpto={resumeStep(state)}
        maxReachable={maxReachableStep}
        onSelect={wizard.goToStep}
      />

      {step === 'identity' ? (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold">{t('settings.kyc.sectionIdentity')}</h3>
          <KycStepIdentity
            nationalId={nationalId}
            phoneNumber={state.phone_number ?? ''}
            disabled={inputsLocked}
            onChange={wizard.setNationalId}
          />
        </section>
      ) : null}

      {step === 'iban' ? (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold">{t('settings.kyc.sectionFinancial')}</h3>
          <KycConfirmedSummary state={state} upto="identity" />
          {awaitingIbanConfirm && confirmInfo ? (
            <KycIbanConfirmCard info={confirmInfo} shebaNumber={confirmSheba} />
          ) : (
            <KycStepSheba values={sheba} disabled={inputsLocked} onChange={wizard.setSheba} />
          )}
        </section>
      ) : null}

      <Separator />

      <KycWizardNav
        step={step}
        stepIndex={stepIndex}
        busy={busy}
        canAdvance={canAdvance}
        awaitingIbanConfirm={awaitingIbanConfirm}
        nextLabel={nextLabel}
        onBack={wizard.goBack}
        onNext={() => void wizard.goNext()}
      />
    </div>
  );
}
