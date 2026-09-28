import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { toE164Iran } from '@/lib/phone-utils';
import { authService } from '@/lib/auth';
import { apiClient } from '@/lib/api';
import { OtpType } from '@/constants/data';
import { useTranslation } from '@/lib/i18n/hooks';
import { useDelayedRedirect } from '@/hooks/use-delayed-redirect';
import { checkoutQueryFromSearch, homeRouteFor, resolveSessionRole } from '@/lib/auth-routing';
import {
  isMemberElsewhereError,
  isUserNotRegisteredError,
  isPanelAccessBlockedError,
} from '@/lib/auth-login-errors';
import { apiErrorMessage } from '@/lib/api-error-message';
import { notifyOtpSent } from '@/lib/otp-notify';
import { setSelectedAcademyId } from '@/lib/store-utils';
import type { LoginMethod } from '@/components/auth/login-method-toggle';
import { useHumanCheck } from '@/hooks/use-human-check';
import { collectErrors, validateOtp, validatePassword, validatePhone } from '@/lib/auth-validation';

type Academy = { id: string; name: string; slug: string };

type LoginResponse = {
  /** The role the backend put in the JWT — the only one the request proxy agrees with. */
  roles?: string[];
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
  availableAcademies?: Academy[];
  available_academies?: Academy[];
  requires_academy_selection?: boolean;
};

function goToUnauthorized() {
  if (typeof window === 'undefined') return;
  window.location.assign('/unauthorized');
}

function resolveLoginError(
  error: unknown,
  fallback: string,
  notRegisteredMessage: string,
): { message: string; registrationRequired: boolean } {
  const registrationRequired = isUserNotRegisteredError(error);
  return {
    message: registrationRequired ? notRegisteredMessage : apiErrorMessage(error, fallback),
    registrationRequired,
  };
}

export function useLogin() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const planParam = searchParams.get('plan');
  const periodParam = searchParams.get('period');
  const planQuery = checkoutQueryFromSearch(planParam, periodParam);
  const { pending: redirectPending, scheduleRedirect } = useDelayedRedirect();

  const [loginMethod, setLoginMethod] = useState<LoginMethod>('password');
  const captcha = useHumanCheck();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [unauthorizedError, setUnauthorizedError] = useState<string | null>(null);

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
  // The phone has an academy membership but no panel role — a student who came
  // to the wrong door. They are routed to their academy, not to signup.
  const [memberElsewhere, setMemberElsewhere] = useState(false);

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

  function validate() {
    const e = collectErrors(
      {
        phone: validatePhone(phone),
        ...(loginMethod === 'password' ? { password: validatePassword(password) } : {}),
      },
      t,
    );
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // Always schedules a redirect. A role we cannot place is a failed login
  // (no panel seat) — /unauthorized is reserved for banned/deactivated staff.
  function schedulePostLoginRedirect(response: LoginResponse) {
    const role = resolveSessionRole(response);
    const href = homeRouteFor(role, { planQuery });
    if (!href) {
      toast.error(t('error.authenticationFailed'), { toastId: 'login-error' });
      return;
    }

    scheduleRedirect({
      href,
      title: t('success.loginSuccess'),
      message: href.startsWith('/my-affiliate')
        ? t('auth.redirectingToAffiliate')
        : t('auth.redirectingToDashboard'),
    });
  }

  async function requestLoginOtp(captchaToken: string) {
    setIsLoading(true);
    setRegistrationRequired(false);
    try {
      const phoneE164 = toE164Iran(phone);
      await apiClient.sendPhoneOtp(phoneE164, OtpType.LOGIN_BY_PHONE, captchaToken);
      setOtpPhone(phoneE164);
      setOtpFullPhone(phoneE164);
      setOtpMode('login');
      setOtpRequired(true);
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
      setIsLoading(false);
    }
  }

  // Shared "what to do with a login response" — used after a normal password
  // login and after the OTP/reset gates finish, so all three paths land the
  // user the same way (single academy, academy picker, or straight in).
  async function finishLogin(response: LoginResponse) {
    const academies = response.availableAcademies || response.available_academies || [];

    if (academies.length === 1) {
      await handleAcademySelect(academies[0].id);
      return;
    }

    if (response.requires_academy_selection || academies.length > 0) {
      setOtpRequired(false);
      setAvailableAcademies(academies);
      setAcademyPickerOpen(true);
      return;
    }

    toast.success(t('success.loginSuccess'), { toastId: 'login-success' });
    schedulePostLoginRedirect(response);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const captchaToken = captcha.token;
    captcha.reset();
    if (loginMethod === 'otp') return requestLoginOtp(captchaToken);

    setIsLoading(true);
    setRegistrationRequired(false);
    try {
      const response = (await authService.login({
        identifier: toE164Iran(phone),
        password,
        captcha_token: captchaToken,
      })) as LoginResponse | null;
      if (!response) return;

      if (response.phone_verification_required) {
        setOtpTempToken(response.temp_token ?? '');
        setOtpPhone(response.phone ?? '');
        setOtpFullPhone(response.full_phone ?? '');
        setOtpRequired(true);
        // Login already sent the code server-side, so no OTP request shows up
        // in the network tab — surface it the same way every other OTP screen does.
        notifyOtpSent(t('success.otpSent'), 'login-otp-gate');
        return;
      }

      if (response.password_reset_required) {
        setResetTempToken(response.temp_token ?? '');
        setPasswordResetRequired(true);
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

  async function handleAcademySelect(academyId: string) {
    setPickingAcademy(true);
    try {
      // Every login path has created a session by now, so picking an academy switches.
      apiClient.resumeRequests();
      const switched = (await apiClient.switchAcademy(academyId)) as {
        data?: LoginResponse & { data?: LoginResponse };
      };
      setSelectedAcademyId(academyId);
      toast.success(t('success.loginSuccess'), { toastId: 'login-success' });

      // Someone who just picked an academy is academy staff by definition, so
      // an unreadable response falls back to the dashboard — never to
      // /unauthorized, and never to no redirect at all.
      const session = switched?.data?.data ?? switched?.data ?? {};
      scheduleRedirect({
        href: homeRouteFor(resolveSessionRole(session), { planQuery }) ?? '/dashboard',
        title: t('success.loginSuccess'),
        message: t('auth.redirectingToDashboard'),
      });
    } catch (error: unknown) {
      if (isPanelAccessBlockedError(error)) {
        goToUnauthorized();
        return;
      }
      toast.error(apiErrorMessage(error, t('error.authenticationFailed')), {
        toastId: 'login-error',
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

  function clearRegistrationHint() {
    setRegistrationRequired(false);
    setMemberElsewhere(false);
    setErrors((prev) => ({ ...prev, phone: '' }));
  }

  // Carries what the user already typed into signup, so step 1 is never retyped.
  const registerHref = (() => {
    const params = new URLSearchParams();
    if (phone.trim()) params.set('phone', phone.trim());
    if (planParam) params.set('plan', planParam);
    if (periodParam === 'monthly' || periodParam === 'quarterly') {
      params.set('period', periodParam);
    }
    const query = params.toString();
    return query ? `/register?${query}` : '/register';
  })();

  return {
    loginMethod,
    changeMethod: (method: LoginMethod) => {
      setLoginMethod(method);
      setErrors({});
    },
    captcha,
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
    changeIdentifier: () => {
      setPassword('');
      setErrors({});
      setMemberElsewhere(false);
    },

    memberElsewhere,
    phoneE164: phone.trim() ? toE164Iran(phone) : '',

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
    handleSetNewPasswordSubmit,
  };
}
