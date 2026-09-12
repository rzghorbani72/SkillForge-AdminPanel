'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import type { KycState } from '@/types/kyc';
import type { KycShebaFields } from './kyc-step-sheba';

const SHEBA_PATTERN = /^IR\d{24}$/;
export const KYC_STEPS = ['identity', 'iban'] as const;
export type KycWizardStep = (typeof KYC_STEPS)[number];
export type KycStepIndex = 0 | 1;

/** First step that is not finished yet — where the manager resumes. */
export function resumeStep(state: KycState): KycStepIndex {
  if (!state.shahkar_matched) return 0;
  return 1;
}

export function useKycWizard(
  initial: KycState,
  onSubmitted: (next: KycState) => void
) {
  const { t } = useTranslation();
  const [stepIndex, setStepIndex] = useState<KycStepIndex>(resumeStep(initial));
  const [busy, setBusy] = useState(false);
  const [state, setState] = useState(initial);
  const [nationalId, setNationalId] = useState(initial.national_id ?? '');
  const [sheba, setSheba] = useState<KycShebaFields>({
    birthDate: initial.birth_date ?? '',
    shebaNumber: initial.sheba_number ?? ''
  });

  const step = KYC_STEPS[stepIndex];
  const awaitingIbanConfirm =
    step === 'iban' && state.iban_matched && !state.iban_info_confirmed;
  // Each api.ir endpoint locks on its own, so only its step goes read-only.
  const stepLockedUntil =
    step === 'identity'
      ? state.shahkar_attempts.locked_until
      : awaitingIbanConfirm
        ? null
        : state.iban_attempts.locked_until;
  const rateLimited = Boolean(stepLockedUntil);
  const inputsLocked = rateLimited || !state.can_edit || busy;
  const stepAttempts =
    step === 'identity' ? state.shahkar_attempts : state.iban_attempts;

  const identityReady = nationalId.trim().length >= 10;
  const shebaReady =
    sheba.birthDate.length === 10 &&
    SHEBA_PATTERN.test(sheba.shebaNumber.trim().toUpperCase());

  const applyState = (next: KycState) => {
    setState(next);
    setStepIndex(resumeStep(next));
    onSubmitted(next);
  };

  /** Steps already confirmed stay reachable so the manager can review them. */
  const maxReachableStep = Math.max(stepIndex, resumeStep(state));
  const goToStep = (target: KycStepIndex) => {
    if (busy || target > maxReachableStep) return;
    setStepIndex(target);
  };

  const goNext = async () => {
    if (rateLimited || busy) return;
    setBusy(true);
    try {
      if (step === 'identity') {
        if (
          state.shahkar_matched &&
          nationalId.trim() === (state.national_id ?? '')
        ) {
          setStepIndex(1);
          return;
        }
        const next = await apiClient.verifyKycIdentity({
          national_id: nationalId.trim()
        });
        ErrorHandler.showSuccess(t('settings.kyc.shahkarMatched'));
        applyState(next);
        return;
      }
      if (awaitingIbanConfirm) {
        const next = await apiClient.confirmKycIban();
        ErrorHandler.showSuccess(t('settings.kyc.ibanConfirmed'));
        applyState(next);
        return;
      }
      const next = await apiClient.verifyKycSheba({
        birth_date: sheba.birthDate,
        sheba_number: sheba.shebaNumber.trim().toUpperCase()
      });
      ErrorHandler.showSuccess(t('settings.kyc.ibanMatched'));
      applyState(next);
    } catch (error) {
      ErrorHandler.handleApiError(error);
      try {
        applyState(await apiClient.getKyc());
      } catch {
        /* ignore refresh errors */
      }
    } finally {
      setBusy(false);
    }
  };

  const goBack = () => {
    if (stepIndex === 0) return;
    goToStep(0);
  };

  const nextLabel =
    step === 'identity'
      ? t('settings.kyc.verifyIdentity')
      : awaitingIbanConfirm
        ? t('settings.kyc.confirmIban')
        : t('settings.kyc.verifySheba');

  const canAdvance =
    !inputsLocked &&
    (step === 'identity'
      ? identityReady
      : awaitingIbanConfirm
        ? state.iban_info?.active === true
        : shebaReady);

  return {
    step,
    stepIndex,
    busy,
    state,
    nationalId,
    sheba,
    inputsLocked,
    awaitingIbanConfirm,
    stepAttempts,
    stepLockedUntil,
    maxReachableStep,
    nextLabel,
    canAdvance,
    setNationalId,
    setSheba,
    goNext,
    goBack,
    goToStep
  };
}
