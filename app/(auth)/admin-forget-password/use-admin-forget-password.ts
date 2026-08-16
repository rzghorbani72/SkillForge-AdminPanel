'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { apiClient } from '@/lib/api';
import { OtpType } from '@/constants/data';
import { toE164Iran } from '@/lib/phone-utils';
import { useTranslation } from '@/lib/i18n/hooks';
import { notifyOtpSent } from '@/lib/otp-notify';
import { apiErrorMessage } from '@/lib/api-error-message';
import {
  collectErrors,
  validateConfirmPassword,
  validateEmail,
  validateOtp,
  validateNewPassword as validateChosenPassword,
  validatePhone
} from '@/lib/auth-validation';

type Step = 'identifier' | 'otp' | 'password' | 'success';
type AuthMethod = 'email' | 'phone';

interface ForgetFields {
  email: string;
  phoneNumber: string;
  fullPhoneNumber: string;
  password: string;
  confirmed_password: string;
  otp: string;
}

const EMPTY: ForgetFields = {
  email: '',
  phoneNumber: '',
  fullPhoneNumber: '',
  password: '',
  confirmed_password: '',
  otp: ''
};

export function useAdminForgetPassword() {
  const { t } = useTranslation();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<Step>('identifier');
  const [authMethod, setAuthMethod] = useState<AuthMethod>('email');
  const [formData, setFormData] = useState<ForgetFields>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');

  const handleInputChange = (field: keyof ForgetFields, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateIdentifier = () => {
    const newErrors = collectErrors(
      {
        email: validateEmail(formData.email),
        phoneNumber: validatePhone(formData.phoneNumber)
      },
      t
    );
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateNewPassword = () => {
    const newErrors = collectErrors(
      {
        password: validateChosenPassword(formData.password),
        confirmed_password: validateConfirmPassword(
          formData.password,
          formData.confirmed_password
        )
      },
      t
    );
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOtp = async () => {
    if (!validateIdentifier()) return;
    setIsLoading(true);
    setErrors({});
    try {
      if (authMethod === 'email') {
        const response = await apiClient.sendEmailOtp(
          formData.email,
          OtpType.RESET_PASSWORD_BY_EMAIL
        );
        setMessage(t('forgotPassword.otpSentToEmail'));
        notifyOtpSent(
          response,
          t('forgotPassword.otpSentToEmail'),
          'admin-forget-password-otp-sent'
        );
      } else {
        const response = await apiClient.sendPhoneOtp(
          toE164Iran(formData.fullPhoneNumber || formData.phoneNumber),
          OtpType.RESET_PASSWORD_BY_PHONE
        );
        setMessage(t('forgotPassword.otpSentToPhone'));
        notifyOtpSent(
          response,
          t('forgotPassword.otpSentToPhone'),
          'admin-forget-password-otp-sent'
        );
      }
      setStep('otp');
    } catch (error: unknown) {
      const errorMessage = apiErrorMessage(
        error,
        t('forgotPassword.failedToSendOtp')
      );
      setErrors({ identifier: errorMessage });
      toast.error(errorMessage, { toastId: 'admin-forget-password-error' });
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
      if (authMethod === 'email') {
        await apiClient.verifyEmailOtp(
          formData.email,
          formData.otp,
          OtpType.RESET_PASSWORD_BY_EMAIL
        );
      } else {
        await apiClient.verifyPhoneOtp(
          toE164Iran(formData.fullPhoneNumber || formData.phoneNumber),
          formData.otp,
          OtpType.RESET_PASSWORD_BY_PHONE
        );
      }
      setStep('password');
      setMessage(t('forgotPassword.otpVerifiedSuccess'));
    } catch (error: unknown) {
      const errorMessage = apiErrorMessage(
        error,
        t('forgotPassword.invalidOtp')
      );
      setErrors({ otp: errorMessage });
      toast.error(errorMessage, { toastId: 'admin-forget-password-otp-error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!validateNewPassword()) return;
    setIsLoading(true);
    setErrors({});
    try {
      await apiClient.adminForgetPassword({
        email: formData.email.trim(),
        phone_number: toE164Iran(
          formData.fullPhoneNumber || formData.phoneNumber
        ),
        password: formData.password,
        confirmed_password: formData.confirmed_password,
        otp: formData.otp
      });
      setStep('success');
      setMessage(t('forgotPassword.passwordResetSuccess'));
    } catch (error: unknown) {
      const errorMessage = apiErrorMessage(
        error,
        t('forgotPassword.passwordResetFailed')
      );
      setErrors({ password: errorMessage });
      toast.error(errorMessage, {
        toastId: 'admin-forget-password-reset-error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setStep('identifier');
    setAuthMethod('email');
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
    authMethod,
    setAuthMethod,
    formData,
    errors,
    message,
    handleInputChange,
    handleSendOtp,
    handleVerifyOtp,
    handleResetPassword,
    resetForm
  };
}
