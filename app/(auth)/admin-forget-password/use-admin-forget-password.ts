'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { apiClient } from '@/lib/api';
import { OtpType } from '@/constants/data';
import { isValidEmail, isValidPhone } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/hooks';

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
    const newErrors: Record<string, string> = {};
    if (!formData.email.trim()) newErrors.email = t('auth.emailRequired');
    else if (!isValidEmail(formData.email))
      newErrors.email = t('forgotPassword.validEmailAddress');

    if (!formData.phoneNumber.trim())
      newErrors.phoneNumber = t('auth.phoneRequired');
    else if (!isValidPhone(formData.phoneNumber))
      newErrors.phoneNumber = t('forgotPassword.validPhoneNumber');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const { password, confirmed_password } = formData;
    const newErrors: Record<string, string> = {};
    if (!password.trim()) newErrors.password = t('auth.passwordRequired');
    else if (password.length < 6)
      newErrors.password = t('auth.passwordTooShort');

    if (!confirmed_password.trim())
      newErrors.confirmed_password = t('auth.confirmPasswordRequired');
    else if (password !== confirmed_password)
      newErrors.confirmed_password = t('auth.passwordsDoNotMatch');

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
        // TODO: Remove when real SMS/email provider is integrated
        if (response?.data?.otp) {
          toast.info(
            `${t('forgotPassword.otpSentToEmail')}\n\n🔐 Code: ${response.data.otp}`,
            { autoClose: 8000, style: { whiteSpace: 'pre-wrap' } }
          );
        }
      } else {
        const phoneToSend = formData.fullPhoneNumber;
        if (!phoneToSend) {
          setErrors({ phoneNumber: t('forgotPassword.validPhoneNumber') });
          setIsLoading(false);
          return;
        }
        const response = await apiClient.sendPhoneOtp(
          phoneToSend,
          OtpType.RESET_PASSWORD_BY_PHONE
        );
        setMessage(t('forgotPassword.otpSentToPhone'));
        // TODO: Remove when real SMS/email provider is integrated
        if (response?.data?.otp) {
          toast.info(
            `${t('forgotPassword.otpSentToPhone')}\n\n🔐 Code: ${response.data.otp}`,
            { autoClose: 8000, style: { whiteSpace: 'pre-wrap' } }
          );
        }
      }
      setStep('otp');
    } catch (error: unknown) {
      setErrors({
        identifier:
          error instanceof Error
            ? error.message
            : t('forgotPassword.failedToSendOtp')
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!formData.otp.trim()) {
      setErrors({ otp: t('forgotPassword.otpRequired') });
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
          formData.fullPhoneNumber || formData.phoneNumber,
          formData.otp,
          OtpType.RESET_PASSWORD_BY_PHONE
        );
      }
      setStep('password');
      setMessage(t('forgotPassword.otpVerifiedSuccess'));
    } catch (error: unknown) {
      setErrors({
        otp:
          error instanceof Error
            ? error.message
            : t('forgotPassword.invalidOtp')
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!validatePassword()) return;
    setIsLoading(true);
    setErrors({});
    try {
      await apiClient.adminForgetPassword({
        email: formData.email.trim(),
        phone_number: formData.fullPhoneNumber || formData.phoneNumber,
        password: formData.password,
        confirmed_password: formData.confirmed_password,
        otp: formData.otp
      });
      setStep('success');
      setMessage(t('forgotPassword.passwordResetSuccess'));
    } catch (error: unknown) {
      setErrors({
        password:
          error instanceof Error
            ? error.message
            : t('forgotPassword.passwordResetFailed')
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
