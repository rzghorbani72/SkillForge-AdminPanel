'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { InputWithIcon } from '@/components/ui/input-with-icon';
import { PhoneOtpScreen } from '@/components/auth/phone-otp-screen';
import { PhoneInputWithCountry } from '@/components/ui/phone-input-with-country';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Mail,
  Phone,
  Lock,
  Loader2,
  AlertCircle,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { toEnglishDigits } from '@/lib/phone-utils';
import { OtpType } from '@/constants/data';
import { isValidEmail, isValidPhone } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import Link from '@/components/ui/link';
import { AuthShell } from '@/components/auth/auth-shell';
import { useTranslation, useLanguage } from '@/lib/i18n/hooks';
import { toast } from 'react-toastify';

export default function ForgetPasswordPage() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<
    'identifier' | 'otp' | 'password' | 'success'
  >('identifier');
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [formData, setFormData] = useState({
    email: '',
    phoneNumber: '',
    fullPhoneNumber: '',
    password: '',
    confirmed_password: '',
    otp: '',
    store_slug: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [stores, setStores] = useState<
    Array<{ id: number; name: string; slug: string }>
  >([]);
  const [isLoadingStores, setIsLoadingStores] = useState(false);
  const [autoRedirecting, setAutoRedirecting] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (step !== 'success') {
      setAutoRedirecting(false);
      return;
    }

    setAutoRedirecting(true);
    const timer = window.setTimeout(() => router.push('/login'), 2200);
    return () => window.clearTimeout(timer);
  }, [step, router]);

  // Fetch stores on component mount
  useEffect(() => {
    const fetchStores = async () => {
      setIsLoadingStores(true);
      try {
        const response = await apiClient.getAcademiesPublic();
        setStores(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Failed to fetch stores:', error);
      } finally {
        setIsLoadingStores(false);
      }
    };

    fetchStores();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: toEnglishDigits(value) }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateIdentifier = () => {
    if (authMethod === 'email') {
      if (!formData.email.trim()) {
        setErrors({ email: t('forgotPassword.emailOrPhoneRequired') });
        return false;
      }
      if (!isValidEmail(formData.email)) {
        setErrors({ email: t('forgotPassword.validEmailAddress') });
        return false;
      }
    } else {
      if (!formData.phoneNumber.trim()) {
        setErrors({ phoneNumber: t('forgotPassword.emailOrPhoneRequired') });
        return false;
      }
      if (!isValidPhone(formData.phoneNumber)) {
        setErrors({ phoneNumber: t('forgotPassword.validPhoneNumber') });
        return false;
      }
    }

    return true;
  };

  const validatePassword = () => {
    const { password, confirmed_password } = formData;
    const newErrors: Record<string, string> = {};

    if (!password.trim()) {
      newErrors.password = t('auth.passwordRequired');
    } else if (password.length < 6) {
      newErrors.password = t('auth.passwordTooShort');
    }

    if (!confirmed_password.trim()) {
      newErrors.confirmed_password = t('auth.confirmPasswordRequired');
    } else if (password !== confirmed_password) {
      newErrors.confirmed_password = t('auth.passwordsDoNotMatch');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }

    return true;
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
            {
              autoClose: 8000,
              style: { whiteSpace: 'pre-wrap' }
            }
          );
        }
      } else {
        // Ensure we have the full phone number with country code
        const phoneToSend = formData.fullPhoneNumber;

        if (!phoneToSend) {
          console.error(
            'Full phone number not available. phoneNumber:',
            formData.phoneNumber,
            'fullPhoneNumber:',
            formData.fullPhoneNumber
          );
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
        if (response?.otp) {
          toast.info(
            `${t('forgotPassword.otpSentToPhone')}\n\n🔐 Code: ${response.otp}`,
            {
              autoClose: 8000,
              style: { whiteSpace: 'pre-wrap' }
            }
          );
        }
      }
      setStep('otp');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t('forgotPassword.failedToSendOtp');
      setErrors({ identifier: errorMessage });
      toast.error(errorMessage, { toastId: 'forget-password-error' });
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
      const errorMessage =
        error instanceof Error ? error.message : t('forgotPassword.invalidOtp');
      setErrors({ otp: errorMessage });
      toast.error(errorMessage, { toastId: 'forget-password-otp-error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!validatePassword()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const selectedStore = stores.find(
        (store) => store.slug === formData.store_slug
      );
      await apiClient.forgetPassword({
        identifier:
          authMethod === 'phone'
            ? formData.fullPhoneNumber || formData.phoneNumber
            : formData.email,
        password: formData.password,
        confirmed_password: formData.confirmed_password,
        otp: formData.otp,
        academy_id: selectedStore?.id
      });

      setStep('success');
      setMessage(t('forgotPassword.passwordResetSuccess'));
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t('forgotPassword.passwordResetFailed');
      setErrors({ password: errorMessage });
      toast.error(errorMessage, { toastId: 'forget-password-reset-error' });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setStep('identifier');
    setAuthMethod('email');
    setFormData({
      email: '',
      phoneNumber: '',
      fullPhoneNumber: '',
      password: '',
      confirmed_password: '',
      otp: '',
      store_slug: ''
    });
    setErrors({});
    setMessage('');
  };

  return (
    <AuthShell
      activeTab="forgot"
      title={t('forgotPassword.title')}
      subtitle={
        <>
          {step === 'identifier' && t('forgotPassword.enterIdentifier')}
          {step === 'otp' && t('forgotPassword.enterOtp')}
          {step === 'password' && t('forgotPassword.enterNewPassword')}
          {step === 'success' && t('forgotPassword.canLoginNow')}
        </>
      }
    >
      <div dir="rtl">
        <div>
          <div>
            {step === 'identifier' && (
              <div className="space-y-4">
                <Tabs
                  value={authMethod}
                  onValueChange={(value) =>
                    setAuthMethod(value as 'email' | 'phone')
                  }
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger
                      value="email"
                      className="flex items-center gap-2"
                    >
                      <Mail className="h-4 w-4" />
                      <span>{t('auth.email')}</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="phone"
                      className="flex items-center gap-2"
                    >
                      <Phone className="h-4 w-4" />
                      <span>{t('auth.phone')}</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="email" className="space-y-4" dir={'rtl'}>
                    <InputWithIcon
                      id="email"
                      label={t('auth.emailAddress')}
                      type="email"
                      placeholder={t('auth.enterEmail')}
                      value={formData.email}
                      onChange={(value) => handleInputChange('email', value)}
                      icon={Mail}
                      error={errors.email}
                      disabled={isLoading}
                    />
                  </TabsContent>

                  <TabsContent value="phone" className="space-y-4" dir={'rtl'}>
                    <PhoneInputWithCountry
                      id="phone"
                      label={t('auth.phoneNumber')}
                      placeholder="09121234567"
                      value={formData.phoneNumber}
                      onChange={(value) =>
                        handleInputChange('phoneNumber', value)
                      }
                      onFullPhoneChange={(fullPhone) =>
                        handleInputChange('fullPhoneNumber', fullPhone)
                      }
                      error={errors.phoneNumber}
                      disabled={isLoading}
                      lockCountryCode="IR"
                    />
                  </TabsContent>
                </Tabs>

                <Button
                  onClick={handleSendOtp}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <Loader2
                      className={`h-4 w-4 animate-spin ${isRTL ? 'ml-2' : 'mr-2'}`}
                    />
                  ) : null}
                  {t('forgotPassword.sendOtp')}
                </Button>
              </div>
            )}

            {step === 'otp' && (
              <PhoneOtpScreen
                embedded
                otpPhone={
                  authMethod === 'phone'
                    ? formData.fullPhoneNumber || formData.phoneNumber
                    : formData.email
                }
                otp={formData.otp}
                setOtp={(v) => handleInputChange('otp', v)}
                otpLoading={isLoading}
                otpError={errors.otp}
                onSubmit={(e) => {
                  e.preventDefault();
                  handleVerifyOtp();
                }}
                onBack={() => setStep('identifier')}
                inputLabel={t('forgotPassword.verificationCode')}
                submitLabel={t('forgotPassword.verifyOtp')}
                backLabel={t('common.back')}
                onResend={handleSendOtp}
                resending={isLoading}
              />
            )}

            {step === 'password' && (
              <div className="space-y-4">
                <InputWithIcon
                  id="password"
                  label={t('forgotPassword.newPassword')}
                  type="password"
                  placeholder={t('forgotPassword.enterNewPassword')}
                  value={formData.password}
                  onChange={(value) => handleInputChange('password', value)}
                  icon={Lock}
                  error={errors.password}
                />

                <InputWithIcon
                  id="confirmed_password"
                  label={t('auth.confirmPassword')}
                  type="password"
                  placeholder={t('forgotPassword.confirmNewPassword')}
                  value={formData.confirmed_password}
                  onChange={(value) =>
                    handleInputChange('confirmed_password', value)
                  }
                  icon={Lock}
                  error={errors.confirmed_password}
                />

                <div
                  className={`flex ${isRTL ? 'space-x-reverse' : 'space-x-2'}`}
                >
                  <Button
                    variant="outline"
                    onClick={() => setStep('otp')}
                    className="flex-1"
                  >
                    <ArrowLeft
                      className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`}
                    />
                    {t('common.back')}
                  </Button>
                  <Button
                    onClick={handleResetPassword}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <Loader2
                        className={`h-4 w-4 animate-spin ${isRTL ? 'ml-2' : 'mr-2'}`}
                      />
                    ) : null}
                    {t('forgotPassword.resetPassword')}
                  </Button>
                </div>
              </div>
            )}

            {step === 'success' && (
              <div className="space-y-4 text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-emerald-500" />
                <h3 className="text-lg font-medium text-foreground">
                  {t('forgotPassword.passwordResetSuccessTitle')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t('forgotPassword.passwordResetSuccessMessage')}
                </p>
                {autoRedirecting && (
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{t('forgotPassword.redirectingToLogin')}</span>
                  </div>
                )}
                <div
                  className={`flex ${isRTL ? 'space-x-reverse' : 'space-x-2'}`}
                >
                  <Button
                    variant="outline"
                    onClick={resetForm}
                    className="flex-1"
                  >
                    {t('forgotPassword.resetAnotherPassword')}
                  </Button>
                  <Button
                    onClick={() => router.push('/login')}
                    className="flex-1"
                  >
                    {t('forgotPassword.goToLogin')}
                  </Button>
                </div>
              </div>
            )}

            {message && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="text-sm text-primary hover:underline"
              >
                {t('forgotPassword.backToLogin')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AuthShell>
  );
}
