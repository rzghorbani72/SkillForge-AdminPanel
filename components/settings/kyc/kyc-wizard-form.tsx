'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { useAuthUser } from '@/hooks/useAuthUser';
import { formatPhoneDisplay } from '@/lib/phone-utils';
import type { KycState, SubmitKycPayload } from '@/types/kyc';
import {
  KycStepIdentity,
  joinLegalName,
  splitLegalName,
  type KycIdentityFields
} from './kyc-step-identity';
import { KycStepCard, type KycCardFields } from './kyc-step-card';
import { KycStepSheba, type KycShebaFields } from './kyc-step-sheba';
import { KycStepExtras, type KycExtrasFields } from './kyc-step-extras';

const SHEBA_PATTERN = /^IR\d{24}$/;
const STEPS = ['identity', 'card', 'sheba', 'extras'] as const;
type Step = (typeof STEPS)[number];

type Props = {
  initial: KycState;
  onSubmitted: (next: KycState) => void;
};

/**
 * Multi-step KYC: Shahkar on identity, card upload, IbanMatch on Sheba,
 * then final submit for staff card review. Inputs lock while an API call runs.
 * Env/config faults are not grayed out — the API returns the error on verify.
 */
export function KycWizardForm({ initial, onSubmitted }: Props) {
  const { t } = useTranslation();
  const { user } = useAuthUser();
  const phoneNumber = formatPhoneDisplay(user?.phone ?? '') || '—';

  const [stepIndex, setStepIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState<'front' | 'back' | null>(null);
  const [state, setState] = useState(initial);

  const [identity, setIdentity] = useState<KycIdentityFields>(() => {
    const split = splitLegalName(initial.legal_entity_name);
    return {
      firstName: split.firstName,
      lastName: split.lastName,
      nationalId: initial.national_id ?? '',
      birthDate: initial.birth_date ?? ''
    };
  });
  const [cards, setCards] = useState<KycCardFields>({
    cardFrontId: initial.card_front_id,
    cardBackId: initial.card_back_id,
    frontPreview: null,
    backPreview: null
  });
  const [sheba, setSheba] = useState<KycShebaFields>({
    shebaNumber: '',
    accountHolderName: initial.legal_entity_name ?? ''
  });
  const [extras, setExtras] = useState<KycExtrasFields>({
    contactAddress: initial.contact_address ?? '',
    permitDeclared: initial.permit_declared_at !== null
  });

  const step = STEPS[stepIndex] as Step;
  const fullName = joinLegalName(identity.firstName, identity.lastName);
  const rateLimited = Boolean(state.verify_locked_until);
  const inputsLocked = rateLimited || !state.can_edit || busy;
  const nextBlocked = inputsLocked || uploading !== null;

  const identityReady =
    identity.firstName.trim().length >= 1 &&
    identity.lastName.trim().length >= 1 &&
    identity.nationalId.trim().length >= 10 &&
    identity.birthDate.length === 10;

  const cardReady = Boolean(cards.cardFrontId);
  const shebaReady =
    SHEBA_PATTERN.test(sheba.shebaNumber.trim().toUpperCase()) &&
    sheba.accountHolderName.trim().length >= 2;

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
    if (nextBlocked || rateLimited) return;
    setBusy(true);
    try {
      if (step === 'identity') {
        const next = await apiClient.verifyKycIdentity({
          legal_entity_name: fullName,
          national_id: identity.nationalId.trim(),
          birth_date: identity.birthDate
        });
        setState(next);
        setSheba((prev) => ({
          ...prev,
          accountHolderName: prev.accountHolderName || fullName
        }));
        ErrorHandler.showSuccess(t('settings.kyc.shahkarMatched'));
        setStepIndex(1);
        return;
      }
      if (step === 'card') {
        if (!cardReady) return;
        setStepIndex(2);
        return;
      }
      if (step === 'sheba') {
        const next = await apiClient.verifyKycSheba({
          sheba_number: sheba.shebaNumber.trim().toUpperCase(),
          account_holder_name: sheba.accountHolderName.trim()
        });
        setState(next);
        ErrorHandler.showSuccess(t('settings.kyc.ibanMatched'));
        setStepIndex(3);
        return;
      }
      if (step === 'extras') {
        if (!cards.cardFrontId) return;
        const payload: SubmitKycPayload = {
          legal_entity_name: fullName,
          national_id: identity.nationalId.trim(),
          birth_date: identity.birthDate,
          card_front_id: cards.cardFrontId,
          sheba_number: sheba.shebaNumber.trim().toUpperCase(),
          account_holder_name: sheba.accountHolderName.trim(),
          ...(cards.cardBackId ? { card_back_id: cards.cardBackId } : {}),
          ...(extras.contactAddress.trim()
            ? { contact_address: extras.contactAddress.trim() }
            : {}),
          permit_declared: extras.permitDeclared
        };
        const next = await apiClient.submitKyc(payload);
        ErrorHandler.showSuccess(t('settings.kyc.submitted'));
        onSubmitted(next);
      }
    } catch (error) {
      ErrorHandler.handleApiError(error);
      try {
        const refreshed = await apiClient.getKyc();
        setState(refreshed);
      } catch {
        /* ignore refresh errors */
      }
    } finally {
      setBusy(false);
    }
  };

  const goBack = () => {
    if (busy || stepIndex === 0) return;
    setStepIndex((index) => index - 1);
  };

  const nextLabel =
    step === 'identity'
      ? t('settings.kyc.verifyIdentity')
      : step === 'sheba'
        ? t('settings.kyc.verifySheba')
        : step === 'extras'
          ? t('settings.kyc.submit')
          : t('common.next');

  const canAdvance =
    !nextBlocked &&
    ((step === 'identity' && identityReady) ||
      (step === 'card' && cardReady) ||
      (step === 'sheba' && shebaReady) ||
      step === 'extras');

  return (
    <div className="space-y-6">
      {state.verify_locked_until ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {t('settings.kyc.rateLimited')}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          {t('settings.kyc.attemptsRemaining', {
            count: state.verify_attempts_remaining
          })}
        </p>
      )}

      <p className="text-sm font-medium">
        {t('settings.kyc.stepProgress', {
          current: stepIndex + 1,
          total: STEPS.length
        })}
      </p>

      {step === 'identity' ? (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold">
            {t('settings.kyc.sectionIdentity')}
          </h3>
          <KycStepIdentity
            values={identity}
            phoneNumber={phoneNumber}
            disabled={inputsLocked}
            onChange={setIdentity}
          />
        </section>
      ) : null}

      {step === 'card' ? (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold">
            {t('settings.kyc.sectionCard')}
          </h3>
          <KycStepCard
            values={cards}
            uploading={uploading}
            disabled={inputsLocked}
            onPick={(side, file) => void uploadCard(side, file)}
          />
        </section>
      ) : null}

      {step === 'sheba' ? (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold">
            {t('settings.kyc.sectionFinancial')}
          </h3>
          <KycStepSheba
            values={sheba}
            disabled={inputsLocked}
            onChange={setSheba}
          />
        </section>
      ) : null}

      {step === 'extras' ? (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold">
            {t('settings.kyc.sectionPublisher')}
          </h3>
          <KycStepExtras
            values={extras}
            disabled={inputsLocked}
            onChange={setExtras}
          />
        </section>
      ) : null}

      <Separator />

      <div className="flex flex-wrap items-center gap-3">
        {stepIndex > 0 ? (
          <Button
            type="button"
            variant="outline"
            onClick={goBack}
            disabled={busy}
          >
            {t('common.back')}
          </Button>
        ) : null}
        <Button
          type="button"
          onClick={() => void goNext()}
          disabled={!canAdvance}
        >
          {busy ? t('settings.kyc.verifying') : nextLabel}
        </Button>
        <p className="text-xs text-muted-foreground">
          {step === 'identity'
            ? t('settings.kyc.identityStepHint')
            : step === 'sheba'
              ? t('settings.kyc.shebaStepHint')
              : step === 'extras'
                ? t('settings.kyc.submitHint')
                : t('settings.kyc.cardStepHint')}
        </p>
      </div>
    </div>
  );
}
