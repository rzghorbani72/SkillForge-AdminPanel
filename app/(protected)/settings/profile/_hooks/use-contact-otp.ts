'use client';

import { useCallback, useState } from 'react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { OtpType } from '@/constants/data';

export type OtpStep = 'idle' | 'sending' | 'input' | 'verifying';

export interface OtpState {
  step: OtpStep;
  code: string;
}

export const IDLE_OTP: OtpState = { step: 'idle', code: '' };

type Channel = 'email' | 'phone';

const CHANNELS = {
  email: {
    otpType: OtpType.REGISTER_EMAIL_VERIFICATION,
    send: apiClient.sendEmailOtp.bind(apiClient),
    verify: apiClient.verifyEmailOtp.bind(apiClient),
    successKey: 'settings.emailVerifiedSuccess'
  },
  phone: {
    otpType: OtpType.REGISTER_PHONE_VERIFICATION,
    send: apiClient.sendPhoneOtp.bind(apiClient),
    verify: apiClient.verifyPhoneOtp.bind(apiClient),
    successKey: 'settings.phoneVerifiedSuccess'
  }
} as const;

interface ContactOtp {
  state: OtpState;
  setCode: (code: string) => void;
  reset: () => void;
  send: () => Promise<void>;
  verify: () => Promise<void>;
}

/** One send/verify flow shared by the email and phone verification fields. */
export function useContactOtp(
  channel: Channel,
  value: string,
  onVerified: () => void
): ContactOtp {
  const { t } = useTranslation();
  const [state, setState] = useState<OtpState>(IDLE_OTP);
  const config = CHANNELS[channel];

  const reset = useCallback(() => setState(IDLE_OTP), []);
  const setCode = useCallback(
    (code: string) => setState((s) => ({ ...s, code })),
    []
  );

  const send = useCallback(async () => {
    if (!value) return;
    try {
      setState({ step: 'sending', code: '' });
      await config.send(value, config.otpType);
      setState((s) => ({ ...s, step: 'input' }));
    } catch (error) {
      ErrorHandler.handleApiError(error);
      setState(IDLE_OTP);
    }
  }, [config, value]);

  const verify = useCallback(async () => {
    if (!value || !state.code) return;
    try {
      setState((s) => ({ ...s, step: 'verifying' }));
      await config.verify(value, state.code, config.otpType);
      ErrorHandler.showSuccess(t(config.successKey));
      setState(IDLE_OTP);
      onVerified();
    } catch (error) {
      ErrorHandler.handleApiError(error);
      setState((s) => ({ ...s, step: 'input' }));
    }
  }, [config, onVerified, state.code, t, value]);

  return { state, setCode, reset, send, verify };
}
