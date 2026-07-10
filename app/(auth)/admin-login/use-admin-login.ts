'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/lib/auth';
import { apiClient } from '@/lib/api';
import { toEnglishDigits } from '@/lib/phone-utils';
import { isValidEmail, isValidPhone } from '@/lib/utils';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { isPlatformStaff } from '@/lib/roles';
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
  const router = useRouter();
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
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = t('auth.emailRequired');
    else if (!isValidEmail(formData.email))
      newErrors.email = t('auth.invalidEmail');

    if (!formData.phone) newErrors.phone = t('auth.phoneRequired');
    else if (!isValidPhone(formData.phone))
      newErrors.phone = t('auth.invalidPhone');

    if (loginMethod === 'password') {
      if (!formData.password) newErrors.password = t('auth.passwordRequired');
      else if (formData.password.length < 6)
        newErrors.password = t('auth.passwordTooShort');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const routeAfterLogin = (response: AuthUser) => {
    ErrorHandler.showSuccess('success.loginSuccess', true);
    const authData = response as AuthUser & { role?: string };
    const userRole =
      authData.role ??
      response.currentProfile?.Role?.name ??
      response.currentProfile?.role?.name;
    if (isPlatformStaff({ role: userRole })) {
      window.location.href = '/platform';
    } else {
      ErrorHandler.showWarning(t('auth.staffRouteOnly'));
      router.push('/login');
    }
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
      await apiClient.sendAdminLoginOtp(
        formData.email,
        formData.fullPhoneNumber || formData.phone
      );
      setOtpSent(true);
      ErrorHandler.showSuccess('success.otpSent', true);
    } catch (error: unknown) {
      ErrorHandler.handleValidationErrors(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setErrors((prev) => ({ ...prev, otp: t('auth.otpRequired') }));
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
    setFormData((prev) => ({ ...prev, [field]: toEnglishDigits(value) }));
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
