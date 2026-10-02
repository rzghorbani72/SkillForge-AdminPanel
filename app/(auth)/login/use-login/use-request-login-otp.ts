import { toast } from 'react-toastify';
import { toE164Iran } from '@/lib/phone-utils';
import { apiClient } from '@/lib/api';
import { OtpType } from '@/constants/data';
import { useTranslation } from '@/lib/i18n/hooks';
import { isPanelAccessBlockedError } from '@/lib/auth-login-errors';
import { notifyOtpSent } from '@/lib/otp-notify';
import { goToUnauthorized, resolveLoginError } from '../_lib/use-login-helpers';
import type { useLoginOtp } from './use-login-otp';

type RequestLoginOtpParams = {
  phone: string;
  otpFlow: ReturnType<typeof useLoginOtp>;
  setLoading: (loading: boolean) => void;
  setRegistrationRequired: (required: boolean) => void;
};

export function useRequestLoginOtp({
  phone,
  otpFlow,
  setLoading,
  setRegistrationRequired,
}: RequestLoginOtpParams) {
  const { t } = useTranslation();

  return async function requestLoginOtp(captchaToken: string) {
    setLoading(true);
    setRegistrationRequired(false);
    try {
      const phoneE164 = toE164Iran(phone);
      await apiClient.sendPhoneOtp(phoneE164, OtpType.LOGIN_BY_PHONE, captchaToken);
      otpFlow.setOtpPhone(phoneE164);
      otpFlow.setOtpFullPhone(phoneE164);
      otpFlow.setOtpMode('login');
      otpFlow.setOtpRequired(true);
      notifyOtpSent(t('success.otpSent'), 'login-otp-sent');
    } catch (error: unknown) {
      if (isPanelAccessBlockedError(error)) {
        goToUnauthorized();
        return;
      }
      const { message, registrationRequired: needsRegistration } = resolveLoginError(
        error,
        t('error.authenticationFailed'),
        t('auth.accountNotRegisteredForLogin'),
      );
      setRegistrationRequired(needsRegistration);
      if (!needsRegistration) toast.error(message, { toastId: 'login-error' });
    } finally {
      setLoading(false);
    }
  };
}
