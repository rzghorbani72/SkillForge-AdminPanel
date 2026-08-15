'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { authService } from '@/lib/auth';
import { apiClient } from '@/lib/api';
import { toEnglishDigits } from '@/lib/phone-utils';
import { sanitizePasswordInput } from '@/lib/password-utils';
import { ErrorHandler } from '@/lib/error-handler';
import { notifyOtpSent } from '@/lib/otp-notify';
import {
  collectErrors,
  validateEmail,
  validateOtp,
  validatePassword,
  validatePhone
} from '@/lib/auth-validation';
import { useTranslation } from '@/lib/i18n/hooks';
import { isPlatformStaff } from '@/lib/roles';
import {
  homeRouteFor,
  NO_HOME_ROUTE,
  resolveSessionRole
} from '@/lib/auth-routing';
import type { AuthUser } from '@/lib/auth';

type LoginMethod = 'password' | 'otp';

interface AdminLoginFields {
  email: string;
  phone: string;
  fullPhoneNumber: string;
  password: string;
}

export function useAdminLogin() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('password');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [formData, setFormData] = useState<AdminLoginFields>({
    email: '',
    phone: '',
    fullPhoneNumber: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [unauthorizedError, setUnauthorizedError] = useState<string | null>(
    null
  );

  useEffect(() => {
    const error = searchParams.get('error');
    const message = searchParams.get('message');
    if (error === 'unauthorized_role') {
      const errorMessage = message || t('auth.adminUnauthorizedRole');
      setUnauthorizedError(errorMessage);
      ErrorHandler.handleValidationErrors({ message: errorMessage });
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [searchParams, t]);

  const validateForm = () => {
    const newErrors = collectErrors(
      {
        email: validateEmail(formData.email),
        phone: validatePhone(formData.phone),
        ...(loginMethod === 'password'
          ? { password: validatePassword(formData.password) }
          : {})
      },
      t
    );
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const routeAfterLogin = (response: AuthUser) => {
    ErrorHandler.showSuccess('success.loginSuccess', true);
    // Platform staff sign in as an AdminProfile, which carries no Role relation —
    // reading `currentProfile.Role.name` returned undefined and bounced a valid
    // admin session straight back to /login.
    const userRole = resolveSessionRole(response);

    if (isPlatformStaff({ role: userRole })) {
      window.location.href = '/platform';
      return;
    }

    // Non-staff still have a valid session: send them to their own home rather
    // than to /login, which only loops.
    ErrorHandler.showWarning(t('auth.staffRouteOnly'));
    window.location.href = homeRouteFor(userRole) ?? NO_HOME_ROUTE;
  };

  const handlePasswordLogin = async () => {
    setIsLoading(true);
    try {
      const response = await authService.adminLogin({
        email: formData.email,
        phone_number: formData.fullPhoneNumber || formData.phone,
        password: formData.password
      });
      if (response) routeAfterLogin(response);
    } catch (error: unknown) {
      const fieldErrors = ErrorHandler.handleFormError(error);
      if (Object.keys(fieldErrors).length > 0) setErrors(fieldErrors);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.sendAdminLoginOtp(
        formData.email,
        formData.fullPhoneNumber || formData.phone
      );
      setOtpSent(true);
      notifyOtpSent(
        response as { data?: { otp?: string } },
        t('success.otpSent'),
        'admin-otp-sent'
      );
    } catch (error: unknown) {
      ErrorHandler.handleValidationErrors(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otpErrorKey = validateOtp(otp);
    if (otpErrorKey) {
      setErrors((prev) => ({ ...prev, otp: t(otpErrorKey) }));
      return;
    }
    setIsLoading(true);
    try {
      const response = await authService.loginPhoneByOtp({
        phone_number: formData.fullPhoneNumber || formData.phone,
        otp: otp.trim()
      });
      if (response) routeAfterLogin(response);
    } catch {
      setErrors((prev) => ({ ...prev, otp: t('auth.invalidOtp') }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginMethod === 'otp' && otpSent) return handleVerifyOtp();
    if (!validateForm()) return;
    if (loginMethod === 'otp') return handleSendOtp();
    return handlePasswordLogin();
  };

  const handleInputChange = (field: keyof AdminLoginFields, value: string) => {
    const next =
      field === 'password'
        ? sanitizePasswordInput(value)
        : toEnglishDigits(value);
    setFormData((prev) => ({ ...prev, [field]: next }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const changeMethod = (m: LoginMethod) => {
    setLoginMethod(m);
    setOtpSent(false);
    setOtp('');
    setErrors({});
  };

  const resetOtp = () => {
    setOtpSent(false);
    setOtp('');
  };

  return {
    t,
    isLoading,
    loginMethod,
    otpSent,
    otp,
    setOtp: (v: string) => setOtp(toEnglishDigits(v)),
    formData,
    errors,
    unauthorizedError,
    handleSubmit,
    handleSendOtp,
    handleVerifyOtp,
    handleInputChange,
    changeMethod,
    resetOtp
  };
}
