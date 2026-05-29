import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { toE164Iran } from '@/lib/phone-utils';
import { authService } from '@/lib/auth';
import { ErrorHandler } from '@/lib/error-handler';
import { isDevelopmentMode, logDevInfo } from '@/lib/dev-utils';
import { useTranslation } from '@/lib/i18n/hooks';

type Academy = { id: number; name: string; slug: string };

export function useLogin() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();

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
  const [otpTempToken, setOtpTempToken] = useState('');
  const [otpPhone, setOtpPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');

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
    if (!password) e.password = t('auth.passwordRequired');
    else if (password.length < 6) e.password = t('auth.passwordTooShort');
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function afterLogin(response: any) {
    const userRole = response.currentProfile?.Role?.name;
    const hasNoAcademy =
      !response.currentAcademy &&
      !response.currentProfile?.academy_id &&
      !(response.currentProfile as any)?.Academy;

    if (userRole === 'AFFILIATE') {
      window.location.href = '/my-affiliate';
      return;
    }
    if (userRole === 'STUDENT') {
      if (isDevelopmentMode()) logDevInfo('Student → dashboard (dev)');
      window.location.href = isDevelopmentMode()
        ? '/dashboard'
        : '/student-dashboard';
      return;
    }
    if (userRole === 'ADMIN' || userRole === 'SUPPORT') {
      window.location.href = '/admin-login';
      return;
    }
    if (
      userRole === 'USER' ||
      userRole === 'MANAGER' ||
      userRole === 'TEACHER'
    ) {
      window.location.href = hasNoAcademy
        ? '/onboarding/create-academy'
        : '/dashboard';
      return;
    }
    ErrorHandler.showWarning(
      t('auth.panelForStaff') + ' ' + t('auth.teachersManagersAdmins')
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      const response = await authService.login({
        identifier: toE164Iran(phone),
        password
      });
      if (!response) return;

      if ((response as any).phone_verification_required) {
        setOtpTempToken((response as any).temp_token ?? '');
        setOtpPhone((response as any).phone ?? '');
        setOtpRequired(true);
        return;
      }

      const academies =
        (response as any).availableAcademies ||
        (response as any).available_academies ||
        [];

      if (academies.length === 1) {
        await handleAcademySelect(academies[0].id);
        return;
      }

      if (
        (response as any).requires_academy_selection ||
        academies.length > 0
      ) {
        setAvailableAcademies(academies);
        setAcademyPickerOpen(true);
        return;
      }

      toast.success(t('success.loginSuccess'), { toastId: 'login-success' });
      afterLogin(response);
    } catch {
      toast.error(t('error.authenticationFailed'), { toastId: 'login-error' });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAcademySelect(academyId: number) {
    setPickingAcademy(true);
    try {
      const response = await authService.login({
        identifier: toE164Iran(phone),
        password,
        academy_id: academyId
      });
      if (response) {
        toast.success(t('success.loginSuccess'), { toastId: 'login-success' });
        afterLogin(response);
      }
    } catch {
      toast.error(t('error.authenticationFailed'), { toastId: 'login-error' });
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
      const { apiClient } = await import('@/lib/api');
      const result = await apiClient.confirmPhoneOtp(otpTempToken, otp.trim());
      toast.success(t('success.otpVerified'), { toastId: 'login-success' });
      window.location.href = (result as any)?.redirect_to ?? '/my-affiliate';
    } catch {
      setOtpError(t('error.authenticationFailed'));
    } finally {
      setOtpLoading(false);
    }
  }

  return {
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
    handleOtpSubmit,
    resetOtp: () => {
      setOtpRequired(false);
      setOtp('');
      setOtpError('');
    }
  };
}
