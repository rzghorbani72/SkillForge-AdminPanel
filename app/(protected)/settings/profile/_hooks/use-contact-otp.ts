'use client';

import { useCallback, useState } from 'react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { toE164Iran } from '@/lib/phone-utils';

export type OtpStep = 'idle' | 'sending' | 'input' | 'verifying';

export interface OtpState {
  step: OtpStep;
  code: string;
}

export const IDLE_OTP: OtpState = { step: 'idle', code: '' };

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
}

function payloadValue(channel: Channel, value: string): string {
  return channel === 'phone' ? toE164Iran(value) : value.trim();
}

/** Send/verify a new phone or email; the API saves it only after the code matches. */
export function useContactOtp(channel: Channel, value: string, onVerified: () => void): ContactOtp {
  const { t } = useTranslation();
  const [state, setState] = useState<OtpState>(IDLE_OTP);

  const reset = useCallback(() => setState(IDLE_OTP), []);
  const setCode = useCallback((code: string) => setState((s) => ({ ...s, code })), []);

  const send = useCallback(async () => {
    const target = payloadValue(channel, value);
    if (!target) return;
    try {
      setState({ step: 'sending', code: '' });
      await apiClient.sendMyContactOtp(channel, target);
      setState((s) => ({ ...s, step: 'input' }));
    } catch (error) {
      ErrorHandler.handleApiError(error);
      setState(IDLE_OTP);
    }
  }, [channel, value]);

  const verify = useCallback(async () => {
    const target = payloadValue(channel, value);
    if (!target || !state.code) return;
    try {
      setState((s) => ({ ...s, step: 'verifying' }));
      await apiClient.verifyMyContactOtp(channel, target, state.code);
      ErrorHandler.showSuccess(t(SUCCESS_KEY[channel]));
      setState(IDLE_OTP);
      onVerified();
    } catch (error) {
      ErrorHandler.handleApiError(error);
      setState((s) => ({ ...s, step: 'input' }));
    }
  }, [channel, onVerified, state.code, t, value]);

  return { state, setCode, reset, send, verify };
}
