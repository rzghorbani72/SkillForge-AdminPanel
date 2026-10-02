import { toast } from 'react-toastify';
import { authService } from '@/lib/auth';
import { apiClient } from '@/lib/api';
import { useTranslation } from '@/lib/i18n/hooks';
import { isPanelAccessBlockedError } from '@/lib/auth-login-errors';
import { validateOtp } from '@/lib/auth-validation';
import type { Dispatch, SetStateAction } from 'react';
import { LoginResponse, goToUnauthorized, resolveLoginError } from '../_lib/use-login-helpers';
import { PendingRedirect } from '@/hooks/use-delayed-redirect';

type OtpSubmitParams = {
  otp: string;
  mode: 'verify' | 'login';
  phone: string;
  tempToken: string;
  finishLogin: (response: LoginResponse) => Promise<void>;
  scheduleRedirect: Dispatch<SetStateAction<PendingRedirect | null>>;
  setRegistrationRequired: (required: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (message: string) => void;
  onPasswordResetRequired: (tempToken: string) => void;
};

export function useLoginOtpSubmit({
  otp,
  mode,
  phone,
  tempToken,
  finishLogin,
  scheduleRedirect,
  setRegistrationRequired,
  setLoading,
  setError,
  onPasswordResetRequired,
}: OtpSubmitParams) {
  const { t } = useTranslation();

  return async function handleOtpSubmit() {
    const otpErrorKey = validateOtp(otp);
    if (otpErrorKey) {
      setError(t(otpErrorKey));
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (mode === 'login') {
        const response = (await authService.loginPhoneByOtp({
          phone_number: phone,
          otp: otp.trim(),
        })) as LoginResponse;

        await finishLogin(response);
        return;
      }

      const result = (await apiClient.confirmPhoneOtp(tempToken, otp.trim())) as LoginResponse & {
        redirect_to?: string;
      };

      if (result.password_reset_required) {
        onPasswordResetRequired(result.temp_token ?? '');
        return;
      }

      toast.success(t('success.otpVerified'), { toastId: 'login-success' });
      scheduleRedirect({
        href: result.redirect_to ?? '/dashboard',
        title: t('success.otpVerified'),
        message: t('auth.redirectingToAffiliate'),
      });
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
      setError(message);
    } finally {
      setLoading(false);
    }
  };
}
