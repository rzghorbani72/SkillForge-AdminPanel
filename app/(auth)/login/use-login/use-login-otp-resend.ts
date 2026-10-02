import { toast } from 'react-toastify';
import { apiClient } from '@/lib/api';
import { OtpType } from '@/constants/data';
import { useTranslation } from '@/lib/i18n/hooks';
import { isPanelAccessBlockedError } from '@/lib/auth-login-errors';
import { notifyOtpSent } from '@/lib/otp-notify';
import { goToUnauthorized, resolveLoginError } from '../_lib/use-login-helpers';

type OtpResendParams = {
  phone: string;
  mode: 'verify' | 'login';
  setLoading: (loading: boolean) => void;
  setError: (message: string) => void;
  setRegistrationRequired: (required: boolean) => void;
};

export function useLoginOtpResend({
  phone,
  mode,
  setLoading,
  setError,
  setRegistrationRequired,
}: OtpResendParams) {
  const { t } = useTranslation();

  return async function resendOtp(captchaToken: string) {
    setLoading(true);
    setError('');
    setRegistrationRequired(false);
    try {
      // The two modes do NOT share an OTP type: in 'verify' the phone is unconfirmed,
      // so a LOGIN_BY_PHONE code is rejected as "not registered".
      await apiClient.sendPhoneOtp(
        phone,
        mode === 'verify' ? OtpType.REGISTER_PHONE_VERIFICATION : OtpType.LOGIN_BY_PHONE,
        captchaToken,
      );
      notifyOtpSent(t('success.otpSent'), 'otp-resent');
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
      setError(needsRegistration ? message : '');
      if (!needsRegistration) {
        toast.error(message, { toastId: 'login-error' });
      }
    } finally {
      setLoading(false);
    }
  };
}
