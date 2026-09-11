'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import type { KycState, SubmitKycPayload } from '@/types/kyc';
import type { KycCardFields } from './kyc-step-card';
import type { KycShebaFields } from './kyc-step-sheba';

const SHEBA_PATTERN = /^IR\d{24}$/;
export const KYC_STEPS = ['identity', 'iban', 'card'] as const;
export type KycWizardStep = (typeof KYC_STEPS)[number];
export type KycStepIndex = 0 | 1 | 2;

/** First step that is not finished yet — where the manager resumes. */
export function resumeStep(state: KycState): KycStepIndex {
  if (!state.shahkar_matched) return 0;
  if (!state.iban_matched || !state.iban_info_confirmed) return 1;
  return 2;
}

export function useKycWizard(
  initial: KycState,
  onSubmitted: (next: KycState) => void
) {
  const { t } = useTranslation();
  const [stepIndex, setStepIndex] = useState<KycStepIndex>(resumeStep(initial));
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState<'front' | 'back' | null>(null);
  const [cardDeferred, setCardDeferred] = useState(false);
  const [state, setState] = useState(initial);
  const [nationalId, setNationalId] = useState(initial.national_id ?? '');
  const [sheba, setSheba] = useState<KycShebaFields>({
    birthDate: initial.birth_date ?? '',
    shebaNumber: initial.sheba_number ?? ''
  });
  const [cards, setCards] = useState<KycCardFields>({
    cardFrontId: initial.card_front_id,
    cardBackId: initial.card_back_id,
    frontPreview: null,
    backPreview: null
  });

  const step = KYC_STEPS[stepIndex];
  const awaitingIbanConfirm =
    step === 'iban' && state.iban_matched && !state.iban_info_confirmed;
  // Each api.ir endpoint locks on its own, so only its step goes read-only.
  const stepLockedUntil =
    step === 'identity'
      ? state.shahkar_attempts.locked_until
      : step === 'iban' && !awaitingIbanConfirm
        ? state.iban_attempts.locked_until
        : null;
  const rateLimited = Boolean(stepLockedUntil);
  const inputsLocked = rateLimited || !state.can_edit || busy;
  const stepAttempts =
    step === 'identity'
      ? state.shahkar_attempts
      : step === 'iban'
        ? state.iban_attempts
        : null;

  const identityReady = nationalId.trim().length >= 10;
  const shebaReady =
    sheba.birthDate.length === 10 &&
    SHEBA_PATTERN.test(sheba.shebaNumber.trim().toUpperCase());
  const cardReady = Boolean(cards.cardFrontId);

  const applyState = (next: KycState) => {
    setState(next);
    setStepIndex(resumeStep(next));
    setCardDeferred(false);
    onSubmitted(next);
  };

  /** Steps already confirmed stay reachable so the manager can review them. */
  const maxReachableStep = Math.max(stepIndex, resumeStep(state));
  const goToStep = (target: KycStepIndex) => {
    if (busy || target > maxReachableStep) return;
    setCardDeferred(false);
    setStepIndex(target);
  };

  const uploadCard = async (side: 'front' | 'back', file: File) => {
    if (inputsLocked) return;
    setUploading(side);
    const preview = URL.createObjectURL(file);
    try {
      const uploaded = await apiClient.uploadKycCard(file);
      setCards((prev) => ({
        ...prev,
        ...(side === 'front'
          ? { cardFrontId: uploaded.id, frontPreview: preview }
          : { cardBackId: uploaded.id, backPreview: preview })
      }));
    } catch (error) {
      URL.revokeObjectURL(preview);
      ErrorHandler.handleApiError(error);
    } finally {
      setUploading(null);
    }
  };

  const goNext = async () => {
    if (rateLimited || busy || uploading !== null) return;
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
      if (step === 'iban' && awaitingIbanConfirm) {
        const next = await apiClient.confirmKycIban();
        ErrorHandler.showSuccess(t('settings.kyc.ibanConfirmed'));
        applyState(next);
        return;
      }
      if (step === 'iban') {
        if (
          state.iban_info_confirmed &&
          sheba.birthDate === (state.birth_date ?? '') &&
          sheba.shebaNumber.trim().toUpperCase() === (state.sheba_number ?? '')
        ) {
          setStepIndex(2);
          return;
        }
        const next = await apiClient.verifyKycSheba({
          birth_date: sheba.birthDate,
          sheba_number: sheba.shebaNumber.trim().toUpperCase()
        });
        ErrorHandler.showSuccess(t('settings.kyc.ibanMatched'));
        applyState(next);
        return;
      }
      if (step === 'card' && cardReady) {
        const payload: SubmitKycPayload = {
          card_front_id: cards.cardFrontId as string,
          ...(cards.cardBackId ? { card_back_id: cards.cardBackId } : {})
        };
        const next = await apiClient.submitKyc(payload);
        ErrorHandler.showSuccess(t('settings.kyc.submitted'));
        applyState(next);
      }
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
    goToStep((stepIndex - 1) as KycStepIndex);
  };

  const nextLabel =
    step === 'identity'
      ? t('settings.kyc.verifyIdentity')
      : awaitingIbanConfirm
        ? t('settings.kyc.confirmIban')
        : step === 'iban'
          ? t('settings.kyc.verifySheba')
          : t('settings.kyc.submit');

  const canAdvance =
    !inputsLocked &&
    ((step === 'identity' && identityReady) ||
      (step === 'iban' &&
        (awaitingIbanConfirm
          ? state.iban_info?.active === true
          : shebaReady)) ||
      (step === 'card' && cardReady));

  return {
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
    canAdvance,
    setNationalId,
    setSheba,
    uploadCard,
    goNext,
    goBack,
    goToStep,
    skipCard: () => setCardDeferred(true),
    resumeCard: () => setCardDeferred(false)
  };
}
