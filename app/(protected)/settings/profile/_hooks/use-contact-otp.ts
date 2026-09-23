'use client';

import { useCallback, useState } from 'react';
import { apiClient } from '@/lib/api';
import { isApiResponseError } from '@/lib/api-error';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { logger } from '@/lib/logging/app-logger';
import { toE164Iran } from '@/lib/phone-utils';
import { useOtpTimer } from '@/hooks/use-otp-timer';

export type OtpStep = 'idle' | 'sending' | 'input' | 'verifying';

export interface OtpState {
  step: OtpStep;
  code: string;
}

export const IDLE_OTP: OtpState = { step: 'idle', code: '' };

/** Matches Backend `OtpSharedService.OTP_COOLDOWN_SECONDS`. */
const CONTACT_OTP_COOLDOWN_SECONDS = 60;

type Channel = 'email' | 'phone';

const SUCCESS_KEY = {
  email: 'settings.emailVerifiedSuccess',
  phone: 'settings.phoneVerifiedSuccess',
} as const;

interface ContactOtp {
  state: OtpState;
  setCode: (code: string) => void;
  reset: () => void;
  send: () => Promise<void>;
  verify: () => Promise<void>;
  resendCooldown: string;
  canResend: boolean;
}

function payloadValue(channel: Channel, value: string): string {
  return channel === 'phone' ? toE164Iran(value) : value.trim();
}

function cooldownSecondsFromError(error: unknown): number | null {
  if (!isApiResponseError(error) || error.error.code !== 'OTP_COOLDOWN') return null;
  const raw = error.error.params.seconds;
  const seconds = typeof raw === 'number' ? raw : Number(raw);
  return Number.isFinite(seconds) && seconds > 0 ? Math.ceil(seconds) : null;
}

/** Send/verify a new phone or email; the API saves it only after the code matches. */
export function useContactOtp(channel: Channel, value: string, onVerified: () => void): ContactOtp {
  const { t } = useTranslation();
  const [state, setState] = useState<OtpState>(IDLE_OTP);
  const timer = useOtpTimer(CONTACT_OTP_COOLDOWN_SECONDS);

  const reset = useCallback(() => setState(IDLE_OTP), []);
  const setCode = useCallback((code: string) => setState((s) => ({ ...s, code })), []);

  const send = useCallback(async () => {
    const target = payloadValue(channel, value);
    if (!target) return;
    const isResend = state.step === 'input';
    if (isResend && !timer.canResend) return;

    try {
      setState({ step: 'sending', code: '' });
      await apiClient.sendMyContactOtp(channel, target);
      timer.start(CONTACT_OTP_COOLDOWN_SECONDS);
      setState({ step: 'input', code: '' });
      ErrorHandler.showSuccess(t('settings.codeSentTo').replace('{{value}}', target));
      logger.ok('Settings', 'ContactOtpSent', { channel });
    } catch (error) {
      const cooldown = cooldownSecondsFromError(error);
      logger.warn('Settings', 'ContactOtpSendFailed', {
        channel,
        error_code: isApiResponseError(error) ? error.error.code : 'UNKNOWN',
      });
      ErrorHandler.handleApiError(error);
      if (cooldown != null) {
        timer.start(cooldown);
        setState({ step: 'input', code: '' });
        return;
      }
      setState(isResend ? { step: 'input', code: '' } : IDLE_OTP);
    }
  }, [channel, state.step, t, timer, value]);

  const verify = useCallback(async () => {
    const target = payloadValue(channel, value);
    if (!target || !state.code) return;
    try {
      setState((s) => ({ ...s, step: 'verifying' }));
      await apiClient.verifyMyContactOtp(channel, target, state.code);
      ErrorHandler.showSuccess(t(SUCCESS_KEY[channel]));
      logger.ok('Settings', 'ContactOtpVerified', { channel });
      setState(IDLE_OTP);
      onVerified();
    } catch (error) {
      logger.warn('Settings', 'ContactOtpVerifyFailed', {
        channel,
        error_code: isApiResponseError(error) ? error.error.code : 'UNKNOWN',
      });
      ErrorHandler.handleApiError(error);
      setState((s) => ({ ...s, step: 'input' }));
    }
  }, [channel, onVerified, state.code, t, value]);

  return {
    state,
    setCode,
    reset,
    send,
    verify,
    resendCooldown: timer.formatted,
    canResend: timer.canResend,
  };
}
