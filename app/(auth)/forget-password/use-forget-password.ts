'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { apiClient } from '@/lib/api';
import { toE164Iran } from '@/lib/phone-utils';
import { OtpType } from '@/constants/data';
import { useTranslation } from '@/lib/i18n/hooks';
import { notifyOtpSent } from '@/lib/otp-notify';
import { apiErrorMessage } from '@/lib/api-error-message';
import {
  collectErrors,
  validateConfirmPassword,
  validateOtp,
  validateNewPassword as validateChosenPassword,
  validatePhone,
} from '@/lib/auth-validation';
import { logger } from '@/lib/logging/app-logger';
import { errorFields } from '@/lib/logging/error-fields';

type Step = 'identifier' | 'otp' | 'password' | 'success';

interface ForgetFields {
  phoneNumber: string;
  fullPhoneNumber: string;
  password: string;
  confirmed_password: string;
  otp: string;
  store_slug: string;
}

const EMPTY: ForgetFields = {
  phoneNumber: '',
  fullPhoneNumber: '',
  password: '',
  confirmed_password: '',
  otp: '',
  store_slug: '',
};

export function useForgetPassword() {
  const { t } = useTranslation();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<Step>('identifier');
  const [formData, setFormData] = useState<ForgetFields>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [stores, setStores] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [autoRedirecting, setAutoRedirecting] = useState(false);

  useEffect(() => {
    if (step !== 'success') {
      setAutoRedirecting(false);
      return;
    }
    setAutoRedirecting(true);
    const timer = window.setTimeout(() => router.push('/login'), 2200);
    return () => window.clearTimeout(timer);
  }, [step, router]);

  useEffect(() => {
    apiClient
      .getAcademiesPublic()
      .then((response) => {
        setStores(Array.isArray(response.data) ? response.data : []);
      })
      .catch((error) => {
        logger.error('Auth', 'FetchStoresFailed', errorFields(error));
      });
  }, []);

  const handleInputChange = (field: keyof ForgetFields, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateIdentifier = () => {
    const newErrors = collectErrors({ phoneNumber: validatePhone(formData.phoneNumber) }, t);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateNewPassword = () => {
    const newErrors = collectErrors(
      {
        password: validateChosenPassword(formData.password),
        confirmed_password: validateConfirmPassword(formData.password, formData.confirmed_password),
      },
      t,
    );
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOtp = async (captchaToken: string) => {
    if (!validateIdentifier()) return;
    setIsLoading(true);
    setErrors({});
    try {
      await apiClient.sendPhoneOtp(
        toE164Iran(formData.fullPhoneNumber || formData.phoneNumber),
        OtpType.RESET_PASSWORD_BY_PHONE,
        captchaToken,
      );
      setMessage(t('forgotPassword.otpSentToPhone'));
      notifyOtpSent(t('forgotPassword.otpSentToPhone'), 'forget-password-otp-sent');
      setStep('otp');
    } catch (error: unknown) {
      const errorMessage = apiErrorMessage(error, t('forgotPassword.failedToSendOtp'));
      setErrors({ identifier: errorMessage });
      toast.error(errorMessage, { toastId: 'forget-password-error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otpErrorKey = validateOtp(formData.otp);
    if (otpErrorKey) {
      setErrors({ otp: t(otpErrorKey) });
      return;
    }
    setIsLoading(true);
    setErrors({});
    try {
      await apiClient.verifyPhoneOtp(
        toE164Iran(formData.fullPhoneNumber || formData.phoneNumber),
        formData.otp,
        OtpType.RESET_PASSWORD_BY_PHONE,
      );
      setStep('password');
      setMessage(t('forgotPassword.otpVerifiedSuccess'));
    } catch (error: unknown) {
      const errorMessage = apiErrorMessage(error, t('forgotPassword.invalidOtp'));
      setErrors({ otp: errorMessage });
      toast.error(errorMessage, { toastId: 'forget-password-otp-error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!validateNewPassword()) return;
    setIsLoading(true);
    setErrors({});
    try {
      const selectedStore = stores.find((store) => store.slug === formData.store_slug);
      await apiClient.forgetPassword({
        identifier: toE164Iran(formData.fullPhoneNumber || formData.phoneNumber),
        password: formData.password,
        confirmed_password: formData.confirmed_password,
        otp: formData.otp,
        academy_id: selectedStore?.id,
      });
      setStep('success');
      setMessage(t('forgotPassword.passwordResetSuccess'));
    } catch (error: unknown) {
      const errorMessage = apiErrorMessage(error, t('forgotPassword.passwordResetFailed'));
      setErrors({ password: errorMessage });
      toast.error(errorMessage, { toastId: 'forget-password-reset-error' });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setStep('identifier');
    setFormData(EMPTY);
    setErrors({});
    setMessage('');
  };

  return {
    t,
    router,
    isLoading,
    step,
    setStep,
    formData,
    errors,
    message,
    autoRedirecting,
    handleInputChange,
    handleSendOtp,
    handleVerifyOtp,
    handleResetPassword,
    resetForm,
  };
}
