import { useState } from 'react';
import { toast } from 'react-toastify';
import { authService } from '@/lib/auth';
import { apiClient } from '@/lib/api';
import { OtpType } from '@/constants/data';
import { useTranslation } from '@/lib/i18n/hooks';
import { isPanelAccessBlockedError } from '@/lib/auth-login-errors';
import { apiErrorMessage } from '@/lib/api-error-message';
import { notifyOtpSent } from '@/lib/otp-notify';
import { validateOtp } from '@/lib/auth-validation';
import type { Dispatch, SetStateAction } from 'react';
import { LoginResponse, goToUnauthorized, resolveLoginError } from '../_lib/use-login-helpers';
import { PendingRedirect } from '@/hooks/use-delayed-redirect';

export function useLoginOtp({
  finishLogin,
  scheduleRedirect,
  setRegistrationRequired,
}: {
  finishLogin: (response: LoginResponse) => Promise<void>;
  scheduleRedirect: Dispatch<SetStateAction<PendingRedirect | null>>;
  setRegistrationRequired: Dispatch<SetStateAction<boolean>>;
}) {
  const { t } = useTranslation();
  const [otpRequired, setOtpRequired] = useState(false);

  const [otpMode, setOtpMode] = useState<'verify' | 'login'>('verify');

  const [otpTempToken, setOtpTempToken] = useState('');

  const [otpPhone, setOtpPhone] = useState('');

  const [otpFullPhone, setOtpFullPhone] = useState('');

  const [otp, setOtp] = useState('');

  const [otpLoading, setOtpLoading] = useState(false);

  const [otpError, setOtpError] = useState('');

  const [passwordResetRequired, setPasswordResetRequired] = useState(false);

  const [resetTempToken, setResetTempToken] = useState('');

  const [resetLoading, setResetLoading] = useState(false);

  const [resetError, setResetError] = useState('');

  async function handleOtpSubmit() {
    const otpErrorKey = validateOtp(otp);
    if (otpErrorKey) {
      setOtpError(t(otpErrorKey));
      return;
    }
    setOtpLoading(true);
    setOtpError('');
    try {
      if (otpMode === 'login') {
        const response = (await authService.loginPhoneByOtp({
          phone_number: otpFullPhone || otpPhone,
          otp: otp.trim(),
        })) as LoginResponse;

        await finishLogin(response);
        return;
      }

      const result = (await apiClient.confirmPhoneOtp(
        otpTempToken,
        otp.trim(),
      )) as LoginResponse & { redirect_to?: string };

      if (result.password_reset_required) {
        setOtpRequired(false);
        setResetTempToken(result.temp_token ?? '');
        setPasswordResetRequired(true);
        return;
      }

      toast.success(t('success.otpVerified'), { toastId: 'login-success' });
      scheduleRedirect({
        href: result.redirect_to ?? '/my-affiliate',
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
      setOtpError(message);
    } finally {
      setOtpLoading(false);
    }
  }

  async function handleSetNewPasswordSubmit(newPassword: string) {
    setResetLoading(true);
    setResetError('');
    try {
      const response = (await apiClient.setNewPassword(
        resetTempToken,
        newPassword,
      )) as LoginResponse;
      setPasswordResetRequired(false);
      await finishLogin(response);
    } catch (error: unknown) {
      if (isPanelAccessBlockedError(error)) {
        goToUnauthorized();
        return;
      }
      setResetError(apiErrorMessage(error, t('error.authenticationFailed')));
    } finally {
      setResetLoading(false);
    }
  }

  async function resendOtp(captchaToken: string) {
    setOtpLoading(true);
    setOtpError('');
    setRegistrationRequired(false);
    try {
      // The screen serves two flows and they do NOT share an OTP type. In
      // 'verify' the account's phone is unconfirmed by definition, so asking for
      // a LOGIN_BY_PHONE code is rejected as "not registered" — and even if it
      // were sent, confirm-phone only ever matches REGISTER_PHONE_VERIFICATION.
      await apiClient.sendPhoneOtp(
        otpFullPhone || otpPhone,
        otpMode === 'verify' ? OtpType.REGISTER_PHONE_VERIFICATION : OtpType.LOGIN_BY_PHONE,
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
      setOtpError(needsRegistration ? message : '');
      if (!needsRegistration) {
        toast.error(message, { toastId: 'login-error' });
      }
    } finally {
      setOtpLoading(false);
    }
  }

  return {
    handleOtpSubmit,
    handleSetNewPasswordSubmit,
    otp,
    otpError,
    otpLoading,
    otpPhone,
    otpRequired,
    passwordResetRequired,
    resendOtp,
    resetError,
    resetLoading,
    setOtp,
    setOtpError,
    setOtpFullPhone,
    setOtpMode,
    setOtpPhone,
    setOtpRequired,
    setOtpTempToken,
    setPasswordResetRequired,
    setResetTempToken,
  };
}
