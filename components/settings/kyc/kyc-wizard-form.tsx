'use client';

import { Separator } from '@/components/ui/separator';
import { useTranslation } from '@/lib/i18n/hooks';
import type { KycState } from '@/types/kyc';
import { KycConfirmedSummary } from './kyc-confirmed-summary';
import { KycIbanConfirmCard } from './kyc-iban-confirm';
import { KycStepIdentity } from './kyc-step-identity';
import { KycStepCard } from './kyc-step-card';
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
    uploading,
    cardDeferred,
    state,
    nationalId,
    sheba,
    cards,
    inputsLocked,
    awaitingIbanConfirm,
    stepAttempts,
    stepLockedUntil,
    maxReachableStep,
    nextLabel,
    canAdvance
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
      ) : stepAttempts ? (
        <p className="text-xs text-muted-foreground">
          {t('settings.kyc.attemptsRemaining', {
            count: stepAttempts.attempts_remaining,
            total: state.max_verify_attempts
          })}
        </p>
      ) : null}

      {state.settlement_eligible ? (
        <p className="rounded-lg border border-success/30 bg-success/5 p-3 text-sm">
          {t('settings.kyc.settlementUnlocked')}
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
          <h3 className="text-sm font-semibold">
            {t('settings.kyc.sectionIdentity')}
          </h3>
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
          <h3 className="text-sm font-semibold">
            {t('settings.kyc.sectionFinancial')}
          </h3>
          <KycConfirmedSummary state={state} upto="identity" />
          {awaitingIbanConfirm && state.iban_info ? (
            <KycIbanConfirmCard
              info={state.iban_info}
              shebaNumber={state.sheba_number}
            />
          ) : (
            <KycStepSheba
              values={sheba}
              disabled={inputsLocked}
              onChange={wizard.setSheba}
            />
          )}
        </section>
      ) : null}

      {step === 'card' ? (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold">
            {t('settings.kyc.sectionCard')}
          </h3>
          <KycConfirmedSummary state={state} upto="iban" />
          {cardDeferred ? (
            <p className="text-sm text-muted-foreground">
              {t('settings.kyc.cardSkipHint')}
            </p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                {t('settings.kyc.cardOptionalHint')}
              </p>
              <KycStepCard
                values={cards}
                uploading={uploading}
                disabled={inputsLocked}
                onPick={(side, file) => void wizard.uploadCard(side, file)}
              />
            </>
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
        settlementEligible={state.settlement_eligible}
        cardDeferred={cardDeferred}
        nextLabel={nextLabel}
        onBack={wizard.goBack}
        onNext={() => void wizard.goNext()}
        onSkipCard={wizard.skipCard}
        onResumeCard={wizard.resumeCard}
      />
    </div>
  );
}
