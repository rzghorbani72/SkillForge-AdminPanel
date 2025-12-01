'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputWithIcon } from '@/components/ui/input-with-icon';
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
import { OtpType } from '@/constants/data';
import { isValidEmail, isValidPhone } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LanguageDetector } from '@/components/providers/language-detector';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useTranslation } from '@/lib/i18n/hooks';

export default function ForgetPasswordPage() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<
    'identifier' | 'otp' | 'password' | 'success'
  >('identifier');
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    confirmed_password: '',
    otp: '',
    school_slug: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [schools, setSchools] = useState<
    Array<{ id: number; name: string; slug: string }>
  >([]);
  const [isLoadingSchools, setIsLoadingSchools] = useState(false);

  const router = useRouter();

  // Fetch schools on component mount
  useEffect(() => {
    const fetchSchools = async () => {
      setIsLoadingSchools(true);
      try {
        const response = await apiClient.getSchoolsPublic();
        setSchools(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Failed to fetch schools:', error);
      } finally {
        setIsLoadingSchools(false);
      }
    };

    fetchSchools();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateIdentifier = () => {
    const { identifier } = formData;
    if (!identifier.trim()) {
      setErrors({ identifier: t('forgotPassword.emailOrPhoneRequired') });
      return false;
    }

    if (authMethod === 'email' && !isValidEmail(identifier)) {
      setErrors({ identifier: t('forgotPassword.validEmailAddress') });
      return false;
    }

    if (authMethod === 'phone' && !isValidPhone(identifier)) {
      setErrors({ identifier: t('forgotPassword.validPhoneNumber') });
      return false;
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
        await apiClient.sendEmailOtp(
          formData.identifier,
          OtpType.RESET_PASSWORD_BY_EMAIL
        );
        setMessage(t('forgotPassword.otpSentToEmail'));
      } else {
        await apiClient.sendPhoneOtp(
          formData.identifier,
          OtpType.RESET_PASSWORD_BY_PHONE
        );
        setMessage(t('forgotPassword.otpSentToPhone'));
      }
      setStep('otp');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to send OTP';
      setErrors({ identifier: errorMessage });
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
          formData.identifier,
          formData.otp,
          OtpType.RESET_PASSWORD_BY_EMAIL
        );
      } else {
        await apiClient.verifyPhoneOtp(
          formData.identifier,
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!validatePassword()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const selectedSchool = schools.find(
        (school) => school.slug === formData.school_slug
      );
      await apiClient.forgetPassword({
        identifier: formData.identifier,
        password: formData.password,
        confirmed_password: formData.confirmed_password,
        otp: formData.otp,
        school_id: selectedSchool?.id
      });

      setStep('success');
      setMessage(t('forgotPassword.passwordResetSuccess'));
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t('forgotPassword.passwordResetFailed');
      setErrors({ password: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setStep('identifier');
    setFormData({
      identifier: '',
      password: '',
      confirmed_password: '',
      otp: '',
      school_slug: ''
    });
    setErrors({});
    setMessage('');
  };

  return (
    <>
      <LanguageDetector />
      <div className="relative flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        {/* Language Switcher - Top Right */}
        <div className="absolute right-4 top-4 z-50">
          <LanguageSwitcher />
        </div>
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              {t('forgotPassword.title')}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {step === 'identifier' && t('forgotPassword.enterIdentifier')}
              {step === 'otp' && t('forgotPassword.enterOtp')}
              {step === 'password' && t('forgotPassword.enterNewPassword')}
              {step === 'success' && t('forgotPassword.passwordResetSuccess')}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">
                {t('forgotPassword.title')}
              </CardTitle>
              <CardDescription className="text-center">
                {step === 'identifier' &&
                  t('forgotPassword.selectSchoolDescription')}
                {step === 'otp' && t('forgotPassword.checkDeviceForCode')}
                {step === 'password' && t('forgotPassword.createNewPassword')}
                {step === 'success' && t('forgotPassword.canLoginNow')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {step === 'identifier' && (
                <div className="space-y-4">
                  <Tabs
                    value={authMethod}
                    onValueChange={(value) =>
                      setAuthMethod(value as 'email' | 'phone')
                    }
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="email">{t('auth.email')}</TabsTrigger>
                      <TabsTrigger value="phone">{t('auth.phone')}</TabsTrigger>
                    </TabsList>
                    <TabsContent value="email" className="space-y-4">
                      <InputWithIcon
                        id="email"
                        label={t('auth.emailAddress')}
                        type="email"
                        placeholder={t('auth.enterEmail')}
                        value={formData.identifier}
                        onChange={(value) =>
                          handleInputChange('identifier', value)
                        }
                        icon={Mail}
                        error={errors.identifier}
                      />
                    </TabsContent>
                    <TabsContent value="phone" className="space-y-4">
                      <PhoneInputWithCountry
                        id="phone"
                        label={t('auth.phoneNumber')}
                        placeholder={t('auth.enterPhone')}
                        value={formData.identifier}
                        onChange={(value) =>
                          handleInputChange('identifier', value)
                        }
                        error={errors.identifier}
                      />
                    </TabsContent>
                  </Tabs>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="school_slug">
                        {t('schools.title')} ({t('common.optional')})
                      </Label>
                      <select
                        id="school_slug"
                        value={formData.school_slug}
                        onChange={(e) =>
                          handleInputChange('school_slug', e.target.value)
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isLoadingSchools}
                      >
                        {schools.map((school) => (
                          <option key={school.id} value={school.slug}>
                            {school.name}
                          </option>
                        ))}
                      </select>
                      {isLoadingSchools && (
                        <p className="mt-1 text-sm text-gray-500">
                          {t('common.loading')}
                        </p>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={handleSendOtp}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {t('forgotPassword.sendOtp')}
                  </Button>
                </div>
              )}

              {step === 'otp' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="otp">
                      {t('forgotPassword.verificationCode')}
                    </Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder={t('forgotPassword.enter6DigitCode')}
                      value={formData.otp}
                      onChange={(e) => handleInputChange('otp', e.target.value)}
                      maxLength={6}
                    />
                    {errors.otp && (
                      <p className="mt-1 text-sm text-red-600">{errors.otp}</p>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setStep('identifier')}
                      className="flex-1"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      {t('common.back')}
                    </Button>
                    <Button
                      onClick={handleVerifyOtp}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      {t('forgotPassword.verifyOtp')}
                    </Button>
                  </div>
                </div>
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

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setStep('otp')}
                      className="flex-1"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      {t('common.back')}
                    </Button>
                    <Button
                      onClick={handleResetPassword}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      {t('forgotPassword.resetPassword')}
                    </Button>
                  </div>
                </div>
              )}

              {step === 'success' && (
                <div className="space-y-4 text-center">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                  <h3 className="text-lg font-medium text-gray-900">
                    {t('forgotPassword.passwordResetSuccessTitle')}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t('forgotPassword.passwordResetSuccessMessage')}
                  </p>
                  <div className="flex space-x-2">
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
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  {t('forgotPassword.backToLogin')}
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
