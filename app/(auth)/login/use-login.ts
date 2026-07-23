import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { toE164Iran } from '@/lib/phone-utils';
import { authService } from '@/lib/auth';
import { apiClient } from '@/lib/api';
import { OtpType } from '@/constants/data';
import { ErrorHandler } from '@/lib/error-handler';
import { isDevelopmentMode, logDevInfo } from '@/lib/dev-utils';
import { useTranslation } from '@/lib/i18n/hooks';
import { useDelayedRedirect } from '@/hooks/use-delayed-redirect';
import { isPlatformStaff } from '@/lib/roles';
import { isUserNotRegisteredError } from '@/lib/auth-login-errors';

type Academy = { id: number; name: string; slug: string };
export type LoginMethod = 'password' | 'otp';

type LoginResponse = {
  currentProfile?: { Role?: { name?: string }; academy_id?: number };
  currentAcademy?: unknown;
  phone_verification_required?: boolean;
  temp_token?: string;
  phone?: string;
  availableAcademies?: Academy[];
  available_academies?: Academy[];
  requires_academy_selection?: boolean;
};

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

function resolveLoginError(
  error: unknown,
  fallback: string,
  notRegisteredMessage: string
): { message: string; registrationRequired: boolean } {
  const raw = getApiErrorMessage(error, fallback);
  const registrationRequired = isUserNotRegisteredError(raw);
  return {
    message: registrationRequired ? notRegisteredMessage : raw,
    registrationRequired
  };
}

export function useLogin() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const planParam = searchParams.get('plan');
  const { pending: redirectPending, scheduleRedirect } = useDelayedRedirect();

  const [loginMethod, setLoginMethod] = useState<LoginMethod>('password');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [unauthorizedError, setUnauthorizedError] = useState<string | null>(
    null
  );

  const [academyPickerOpen, setAcademyPickerOpen] = useState(false);
  const [availableAcademies, setAvailableAcademies] = useState<Academy[]>([]);
  const [pickingAcademy, setPickingAcademy] = useState(false);

  const [otpRequired, setOtpRequired] = useState(false);
  const [otpMode, setOtpMode] = useState<'verify' | 'login'>('verify');
  const [otpTempToken, setOtpTempToken] = useState('');
  const [otpPhone, setOtpPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [registrationRequired, setRegistrationRequired] = useState(false);

  useEffect(() => {
    const error = searchParams.get('error');
    const message = searchParams.get('message');
    if (error === 'unauthorized_role') {
      setUnauthorizedError(message || t('auth.loginTitle'));
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [searchParams, t]);

  function validate() {
    const e: Record<string, string> = {};
    if (!phone) e.phone = t('auth.phoneRequired');
    else if (phone.replace(/\D/g, '').length < 7)
      e.phone = t('auth.validPhoneNumber');
    if (loginMethod === 'password') {
      if (!password) e.password = t('auth.passwordRequired');
      else if (password.length < 6) e.password = t('auth.passwordTooShort');
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function schedulePostLoginRedirect(response: LoginResponse) {
    const userRole = response.currentProfile?.Role?.name;
    const hasNoAcademy =
      !response.currentAcademy && !response.currentProfile?.academy_id;

    if (userRole === 'AFFILIATE') {
      scheduleRedirect({
        href: '/my-affiliate',
        title: t('success.loginSuccess'),
        message: t('auth.redirectingToAffiliate')
      });
      return;
    }

    if (userRole === 'STUDENT') {
      if (isDevelopmentMode()) logDevInfo('Student → dashboard (dev)');
      scheduleRedirect({
        href: isDevelopmentMode() ? '/dashboard' : '/student-dashboard',
        title: t('success.loginSuccess'),
        message: t('auth.redirectingToDashboard')
      });
      return;
    }

    if (isPlatformStaff({ role: userRole })) {
      scheduleRedirect({
        href: '/admin-login',
        title: t('success.loginSuccess'),
        message: t('auth.redirectingToAdminLogin')
      });
      return;
    }

    if (
      userRole === 'USER' ||
      userRole === 'MANAGER' ||
      userRole === 'TEACHER'
    ) {
      const planQuery = planParam
        ? `?plan=${encodeURIComponent(planParam)}`
        : '';
      scheduleRedirect({
        href: hasNoAcademy
          ? `/onboarding/create-academy${planQuery}`
          : planParam
            ? `/plans${planQuery}`
            : '/dashboard',
        title: t('success.loginSuccess'),
        message: hasNoAcademy
          ? t('auth.redirectingToOnboarding')
          : t('auth.redirectingToDashboard')
      });
      return;
    }

    ErrorHandler.showWarning(
      t('auth.panelForStaff') + ' ' + t('auth.teachersManagersAdmins')
    );
  }

  async function requestLoginOtp() {
    setIsLoading(true);
    setRegistrationRequired(false);
    try {
      const phoneE164 = toE164Iran(phone);
      const response = await apiClient.sendPhoneOtp(
        phoneE164,
        OtpType.LOGIN_BY_PHONE
      );
      setOtpPhone(phoneE164);
      setOtpMode('login');
      setOtpRequired(true);

      // TODO: Remove debug OTP display when real SMS provider is integrated
      if (response?.data?.otp) {
        toast.info(`${t('success.otpSent')}\n\n🔐 Code: ${response.data.otp}`, {
          toastId: 'login-otp-sent',
          autoClose: 8000,
          style: { whiteSpace: 'pre-wrap' }
        });
      } else {
        toast.success(t('success.otpSent'), { toastId: 'login-otp-sent' });
      }
    } catch (error: unknown) {
      const { message, registrationRequired: needsRegistration } =
        resolveLoginError(
          error,
          t('error.authenticationFailed'),
          t('auth.accountNotRegisteredForLogin')
        );
      setRegistrationRequired(needsRegistration);
      if (needsRegistration) {
        setErrors((prev) => ({ ...prev, phone: '' }));
      } else {
        toast.error(message, { toastId: 'login-error' });
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    if (loginMethod === 'otp') return requestLoginOtp();
    setIsLoading(true);
    try {
      const response = (await authService.login({
        identifier: toE164Iran(phone),
        password
      })) as LoginResponse | null;
      if (!response) return;

      if (response.phone_verification_required) {
        setOtpTempToken(response.temp_token ?? '');
        setOtpPhone(response.phone ?? '');
        setOtpRequired(true);
        return;
      }

      const academies =
        response.availableAcademies || response.available_academies || [];

      if (academies.length === 1) {
        await handleAcademySelect(academies[0].id);
        return;
      }

      if (response.requires_academy_selection || academies.length > 0) {
        setAvailableAcademies(academies);
        setAcademyPickerOpen(true);
        return;
      }

      toast.success(t('success.loginSuccess'), { toastId: 'login-success' });
      schedulePostLoginRedirect(response);
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, t('error.authenticationFailed')), {
        toastId: 'login-error'
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAcademySelect(academyId: number) {
    setPickingAcademy(true);
    try {
      const response = (await authService.login({
        identifier: toE164Iran(phone),
        password,
        academy_id: academyId
      })) as LoginResponse | null;
      if (response) {
        toast.success(t('success.loginSuccess'), { toastId: 'login-success' });
        schedulePostLoginRedirect(response);
      }
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, t('error.authenticationFailed')), {
        toastId: 'login-error'
      });
    } finally {
      setPickingAcademy(false);
    }
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!otp.trim()) {
      setOtpError(t('auth.enterPhoneOtp'));
      return;
    }
    setOtpLoading(true);
    setOtpError('');
    try {
      if (otpMode === 'login') {
        const response = (await authService.loginPhoneByOtp({
          phone_number: otpPhone,
          otp: otp.trim()
        })) as LoginResponse;
        toast.success(t('success.loginSuccess'), { toastId: 'login-success' });
        schedulePostLoginRedirect(response);
        return;
      }

      const result = await apiClient.confirmPhoneOtp(otpTempToken, otp.trim());
      toast.success(t('success.otpVerified'), { toastId: 'login-success' });
      scheduleRedirect({
        href:
          (result as { redirect_to?: string })?.redirect_to ?? '/my-affiliate',
        title: t('success.otpVerified'),
        message: t('auth.redirectingToAffiliate')
      });
    } catch (error: unknown) {
      const { message, registrationRequired: needsRegistration } =
        resolveLoginError(
          error,
          t('error.authenticationFailed'),
          t('auth.accountNotRegisteredForLogin')
        );
      setRegistrationRequired(needsRegistration);
      setOtpError(message);
      if (!needsRegistration) {
        toast.error(message, { toastId: 'login-otp-error' });
      }
    } finally {
      setOtpLoading(false);
    }
  }

  async function resendOtp() {
    setOtpLoading(true);
    setOtpError('');
    setRegistrationRequired(false);
    try {
      const response = await apiClient.sendPhoneOtp(
        otpPhone,
        OtpType.LOGIN_BY_PHONE
      );

      // TODO: Remove debug OTP display when real SMS provider is integrated
      if (response?.data?.otp) {
        toast.info(`${t('success.otpSent')}\n\n🔐 Code: ${response.data.otp}`, {
          toastId: 'otp-resent',
          autoClose: 8000,
          style: { whiteSpace: 'pre-wrap' }
        });
      } else {
        toast.success(t('success.otpSent'), { toastId: 'otp-resent' });
      }
    } catch (error: unknown) {
      const { message, registrationRequired: needsRegistration } =
        resolveLoginError(
          error,
          t('error.authenticationFailed'),
          t('auth.accountNotRegisteredForLogin')
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

  function clearRegistrationHint() {
    setRegistrationRequired(false);
    setErrors((prev) => ({ ...prev, phone: '' }));
  }

  return {
    loginMethod,
    setLoginMethod,
    phone,
    setPhone,
    password,
    setPassword,
    showPassword,
    toggleShowPassword: () => setShowPassword((v) => !v),
    isLoading,
    errors,
    setErrors,
    unauthorizedError,
    handleSubmit,
    redirectPending,

    academyPickerOpen,
    availableAcademies,
    pickingAcademy,
    handleAcademySelect,
    closeAcademyPicker: () => setAcademyPickerOpen(false),

    otpRequired,
    otpPhone,
    otp,
    setOtp,
    otpLoading,
    otpError,
    registrationRequired,
    clearRegistrationHint,
    handleOtpSubmit,
    resendOtp,
    resetOtp: () => {
      setOtpRequired(false);
      setOtpMode('verify');
      setOtp('');
      setOtpError('');
      setRegistrationRequired(false);
    }
  };
}
