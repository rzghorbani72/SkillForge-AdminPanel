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
import {
  isUserNotRegisteredError,
  isCaptchaRequiredError
} from '@/lib/auth-login-errors';
import { apiErrorMessage } from '@/lib/api-error-message';
import { notifyOtpSent } from '@/lib/otp-notify';
import type { AccountIdentity } from '@/types/auth';
import { nextStepFor } from '@/lib/auth-identify';
import {
  collectErrors,
  validateOtp,
  validatePassword,
  validatePhone
} from '@/lib/auth-validation';

type Academy = { id: string; name: string; slug: string };

type LoginResponse = {
  currentProfile?: { Role?: { name?: string }; academy_id?: string };
  currentAcademy?: unknown;
  phone_verification_required?: boolean;
  password_reset_required?: boolean;
  temp_token?: string;
  /** Masked, for display only. */
  phone?: string;
  /** Real E.164 — what the OTP endpoints must be called with. */
  full_phone?: string;
  /** Debug code, only while no real SMS provider is delivering it. */
  otp?: string;
  availableAcademies?: Academy[];
  available_academies?: Academy[];
  requires_academy_selection?: boolean;
};

function resolveLoginError(
  error: unknown,
  fallback: string,
  notRegisteredMessage: string
): { message: string; registrationRequired: boolean } {
  const registrationRequired = isUserNotRegisteredError(error);
  return {
    message: registrationRequired
      ? notRegisteredMessage
      : apiErrorMessage(error, fallback),
    registrationRequired
  };
}

export function useLogin() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const planParam = searchParams.get('plan');
  const { pending: redirectPending, scheduleRedirect } = useDelayedRedirect();

  const [identity, setIdentity] = useState<AccountIdentity | null>(null);
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
  // `otpPhone` is masked in the verify flow, so it can never be sent to an API.
  const [otpFullPhone, setOtpFullPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [registrationRequired, setRegistrationRequired] = useState(false);
  const [captchaRequired, setCaptchaRequired] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');

  // Admin created this account with a one-time password — the user must pick
  // their own before a real session is granted.
  const [passwordResetRequired, setPasswordResetRequired] = useState(false);
  const [resetTempToken, setResetTempToken] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');

  useEffect(() => {
    const error = searchParams.get('error');
    const message = searchParams.get('message');
    if (error === 'unauthorized_role') {
      setUnauthorizedError(message || t('auth.loginTitle'));
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [searchParams, t]);

  function validate(step: 'identify' | 'password') {
    const e = collectErrors(
      {
        phone: validatePhone(phone),
        ...(step === 'password' ? { password: validatePassword(password) } : {})
      },
      t
    );
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function schedulePostLoginRedirect(response: LoginResponse) {
    const userRole = response.currentProfile?.Role?.name;

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
      // Everyone lands on the dashboard: whether an academy-less manager is
      // invited to create one is decided there, not by the login redirect.
      const planQuery = planParam
        ? `?plan=${encodeURIComponent(planParam)}`
        : '';
      scheduleRedirect({
        href: planParam ? `/plans${planQuery}` : '/dashboard',
        title: t('success.loginSuccess'),
        message: t('auth.redirectingToDashboard')
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
      setOtpFullPhone(phoneE164);
      setOtpMode('login');
      setOtpRequired(true);
      notifyOtpSent(response, t('success.otpSent'), 'login-otp-sent');
    } catch (error: unknown) {
      const { message, registrationRequired: needsRegistration } =
        resolveLoginError(
          error,
          t('error.authenticationFailed'),
          t('auth.accountNotRegisteredForLogin')
        );
      setRegistrationRequired(needsRegistration);
      if (needsRegistration) {
        // Fall back to step 1 so the signup hint is visible where it belongs.
        setIdentity(null);
        setErrors((prev) => ({ ...prev, phone: '' }));
      } else {
        toast.error(message, { toastId: 'login-error' });
      }
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Step 1 of identifier-first login: look the phone up before asking for a
   * password, so an unknown number is offered signup instead of a login it
   * could never pass.
   */
  async function handleIdentify() {
    if (!validate('identify')) return;
    setIsLoading(true);
    setRegistrationRequired(false);
    try {
      const { data } = await apiClient.identifyStaff(
        toE164Iran(phone),
        captchaRequired ? captchaToken : undefined
      );
      setCaptchaRequired(data.captcha_required);
      setCaptchaToken('');

      const next = nextStepFor(data);
      if (next === 'register') {
        setRegistrationRequired(true);
        return;
      }

      setIdentity(data);
      if (next === 'otp') {
        await requestLoginOtp();
        return;
      }
      if (next === 'blocked') {
        toast.error(t('auth.noSignInMethodAvailable'), {
          toastId: 'login-no-method'
        });
      }
    } catch (error: unknown) {
      if (isCaptchaRequiredError(error)) {
        setCaptchaRequired(true);
        setCaptchaToken('');
      }
      toast.error(apiErrorMessage(error, t('error.authenticationFailed')), {
        toastId: 'login-error'
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Shared "what to do with a login response" — used after a normal password
  // login and after the OTP/reset gates finish, so all three paths land the
  // user the same way (single academy, academy picker, or straight in).
  async function finishLogin(response: LoginResponse) {
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
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!identity) return handleIdentify();
    if (!validate('password')) return;
    setIsLoading(true);
    try {
      const response = (await authService.login({
        identifier: toE164Iran(phone),
        password,
        ...(captchaRequired ? { captcha_token: captchaToken } : {})
      })) as LoginResponse | null;
      if (!response) return;

      setCaptchaRequired(false);
      setCaptchaToken('');

      if (response.phone_verification_required) {
        setOtpTempToken(response.temp_token ?? '');
        setOtpPhone(response.phone ?? '');
        setOtpFullPhone(response.full_phone ?? '');
        setOtpRequired(true);
        // Login already sent the code server-side, so no OTP request shows up
        // in the network tab — surface it the same way every other OTP screen does.
        notifyOtpSent(
          { data: { otp: response.otp } },
          t('success.otpSent'),
          'login-otp-gate'
        );
        return;
      }

      if (response.password_reset_required) {
        setResetTempToken(response.temp_token ?? '');
        setPasswordResetRequired(true);
        return;
      }

      await finishLogin(response);
    } catch (error: unknown) {
      if (isCaptchaRequiredError(error)) {
        setCaptchaRequired(true);
        setCaptchaToken('');
        toast.error(apiErrorMessage(error, t('error.authenticationFailed')), {
          toastId: 'login-captcha-required'
        });
        return;
      }
      toast.error(apiErrorMessage(error, t('error.authenticationFailed')), {
        toastId: 'login-error'
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAcademySelect(academyId: string) {
    setPickingAcademy(true);
    try {
      if (otpMode === 'login') {
        await apiClient.switchAcademy(academyId);
        toast.success(t('success.loginSuccess'), { toastId: 'login-success' });
        window.location.assign('/dashboard');
        return;
      }

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
      toast.error(apiErrorMessage(error, t('error.authenticationFailed')), {
        toastId: 'login-error'
      });
    } finally {
      setPickingAcademy(false);
    }
  }

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
          otp: otp.trim()
        })) as LoginResponse;

        // OTP login always creates the session, so a user with several academies
        // picks one by switching rather than by logging in again — there is no
        // password to replay and the OTP is spent.
        const academies = response.availableAcademies ?? [];
        if (academies.length > 1) {
          setAvailableAcademies(academies);
          setAcademyPickerOpen(true);
          return;
        }

        toast.success(t('success.loginSuccess'), { toastId: 'login-success' });
        schedulePostLoginRedirect(response);
        return;
      }

      const result = (await apiClient.confirmPhoneOtp(
        otpTempToken,
        otp.trim()
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

  async function handleSetNewPasswordSubmit(newPassword: string) {
    setResetLoading(true);
    setResetError('');
    try {
      const response = (await apiClient.setNewPassword(
        resetTempToken,
        newPassword
      )) as LoginResponse;
      setPasswordResetRequired(false);
      await finishLogin(response);
    } catch (error: unknown) {
      setResetError(apiErrorMessage(error, t('error.authenticationFailed')));
    } finally {
      setResetLoading(false);
    }
  }

  async function resendOtp() {
    setOtpLoading(true);
    setOtpError('');
    setRegistrationRequired(false);
    try {
      // The screen serves two flows and they do NOT share an OTP type. In
      // 'verify' the account's phone is unconfirmed by definition, so asking for
      // a LOGIN_BY_PHONE code is rejected as "not registered" — and even if it
      // were sent, confirm-phone only ever matches REGISTER_PHONE_VERIFICATION.
      const response = await apiClient.sendPhoneOtp(
        otpFullPhone || otpPhone,
        otpMode === 'verify'
          ? OtpType.REGISTER_PHONE_VERIFICATION
          : OtpType.LOGIN_BY_PHONE
      );
      notifyOtpSent(response, t('success.otpSent'), 'otp-resent');
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

  // Carries what the user already typed into signup, so step 1 is never retyped.
  const registerHref = (() => {
    const params = new URLSearchParams();
    if (phone.trim()) params.set('phone', phone.trim());
    if (planParam) params.set('plan', planParam);
    const query = params.toString();
    return query ? `/register?${query}` : '/register';
  })();

  return {
    identity,
    registerHref,
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
    useOtpInstead: requestLoginOtp,
    changeIdentifier: () => {
      setIdentity(null);
      setPassword('');
      setErrors({});
    },

    captchaRequired,
    setCaptchaToken,

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
    },

    passwordResetRequired,
    resetLoading,
    resetError,
    handleSetNewPasswordSubmit
  };
}
