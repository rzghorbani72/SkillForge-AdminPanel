import { useState } from 'react';
import { toast } from 'react-toastify';
import { toE164Iran } from '@/lib/phone-utils';
import { authService } from '@/lib/auth';
import { useTranslation } from '@/lib/i18n/hooks';
import {
  isMemberElsewhereError,
  isUserNotRegisteredError,
  isPanelAccessBlockedError,
} from '@/lib/auth-login-errors';
import { apiErrorMessage } from '@/lib/api-error-message';
import { notifyOtpSent } from '@/lib/otp-notify';
import type { useHumanCheck } from '@/hooks/use-human-check';
import { LoginResponse, goToUnauthorized } from '../_lib/use-login-helpers';
import type { useLoginForm } from './use-login-form';
import type { useLoginOtp } from './use-login-otp';
import { useRequestLoginOtp } from './use-request-login-otp';

type LoginSubmitParams = {
  form: ReturnType<typeof useLoginForm>;
  captcha: ReturnType<typeof useHumanCheck>;
  otpFlow: ReturnType<typeof useLoginOtp>;
  finishLogin: (response: LoginResponse) => Promise<void>;
  setRegistrationRequired: (required: boolean) => void;
  setMemberElsewhere: (value: boolean) => void;
};

export function useLoginSubmit({
  form,
  captcha,
  otpFlow,
  finishLogin,
  setRegistrationRequired,
  setMemberElsewhere,
}: LoginSubmitParams) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const requestLoginOtp = useRequestLoginOtp({
    phone: form.phone,
    otpFlow,
    setLoading: setIsLoading,
    setRegistrationRequired,
  });

  async function submitPassword(captchaToken: string) {
    setIsLoading(true);
    setRegistrationRequired(false);
    try {
      const response = (await authService.login({
        identifier: toE164Iran(form.phone),
        password: form.password,
        captcha_token: captchaToken,
      })) as LoginResponse | null;
      if (!response) return;

      if (response.phone_verification_required) {
        otpFlow.setOtpTempToken(response.temp_token ?? '');
        otpFlow.setOtpPhone(response.phone ?? '');
        otpFlow.setOtpFullPhone(response.full_phone ?? '');
        otpFlow.setOtpRequired(true);
        // Login already sent the code server-side, so no OTP request shows up
        // in the network tab — surface it the same way every other OTP screen does.
        notifyOtpSent(t('success.otpSent'), 'login-otp-gate');
        return;
      }

      if (response.password_reset_required) {
        otpFlow.setResetTempToken(response.temp_token ?? '');
        otpFlow.setPasswordResetRequired(true);
        return;
      }

      await finishLogin(response);
    } catch (error: unknown) {
      if (isUserNotRegisteredError(error)) {
        setRegistrationRequired(true);
        return;
      }
      if (isMemberElsewhereError(error)) {
        setMemberElsewhere(true);
        return;
      }
      if (isPanelAccessBlockedError(error)) {
        goToUnauthorized();
        return;
      }
      toast.error(apiErrorMessage(error, t('error.authenticationFailed')), {
        toastId: 'login-error',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.validate()) return;
    return captcha.run((captchaToken) =>
      form.loginMethod === 'otp' ? requestLoginOtp(captchaToken) : submitPassword(captchaToken),
    );
  }

  return { isLoading, handleSubmit };
}
