'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { School, Loader2, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { OtpType } from '@/constants/data';
import { isValidEmail, isValidPhone } from '@/lib/utils';
import { ErrorHandler } from '@/lib/error-handler';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStores } from '@/hooks/useStores';
import { StepIndicator } from '@/components/auth/register/StepIndicator';
import { VerificationStep } from '@/components/auth/register/VerificationStep';
import { BaseDataForm } from '@/components/auth/register/BaseDataForm';
import { COUNTRY_CODES } from '@/lib/country-codes';
import { LanguageDetector } from '@/components/providers/language-detector';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useTranslation, useLanguage } from '@/lib/i18n/hooks';

export default function RegisterPage() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [registrationType, setRegistrationType] = useState<
    'new-store' | 'existing-store'
  >('new-store');
  const [joinAsTeacher, setJoinAsTeacher] = useState(false);

  // Fetch stores for the dropdown
  const { stores, isLoading: storesLoading, error: storesError } = useStores();

  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [phoneOtpVerified, setPhoneOtpVerified] = useState(false);
  const [emailOtpVerified, setEmailOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [step, setStep] = useState<'verification' | 'form'>('verification');
  const [primaryVerificationMethod, setPrimaryVerificationMethod] = useState<
    'phone' | 'email'
  >('phone');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    countryCode: 'IR', // Default to Iran
    password: '',
    confirmPassword: '',
    phoneOtp: '',
    emailOtp: '',
    storeName: '',
    storeDescription: '',
    storeSlug: '',
    existingStoreId: '',
    teacherRequestReason: ''
  });

  // Update primary verification method when store is selected
  useEffect(() => {
    if (registrationType === 'existing-store' && formData.existingStoreId) {
      const selectedStore = stores.find(
        (s) => s.id === parseInt(formData.existingStoreId)
      );
      if (selectedStore?.primary_verification_method) {
        setPrimaryVerificationMethod(selectedStore.primary_verification_method);
      } else {
        setPrimaryVerificationMethod('phone'); // Default
      }
    } else if (registrationType === 'new-store') {
      setPrimaryVerificationMethod('phone'); // Default for new stores
    }
  }, [formData.existingStoreId, registrationType, stores]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isSubmittingRef = useRef(false);

  const router = useRouter();

  // Helper function to get full phone number with country code
  const getFullPhoneNumber = (phone: string, countryCode?: string): string => {
    if (!phone) return phone;
    if (!countryCode) return phone;

    const country = COUNTRY_CODES.find((c) => c.code === countryCode);
    if (country) {
      return `${country.dialCode}${phone}`;
    }
    return phone;
  };

  // Send phone OTP
  const handleSendPhoneOtp = async () => {
    if (!formData.phone) {
      ErrorHandler.showWarning('Please enter your phone number first');
      return;
    }

    if (formData.phone.length < 7 || formData.phone.length > 15) {
      ErrorHandler.showWarning(
        'Please enter a valid phone number (7-15 digits)'
      );
      return;
    }

    setOtpLoading(true);
    try {
      // Combine country code with phone number
      const fullPhoneNumber = getFullPhoneNumber(
        formData.phone,
        formData.countryCode
      );

      const result = await apiClient.sendPhoneOtp(
        fullPhoneNumber,
        OtpType.REGISTER_PHONE_VERIFICATION
      );
      const responseData = result.data as any;

      if (responseData?.otp) {
        setPhoneOtpSent(true);
        ErrorHandler.showInfo(
          `SMS OTP sent successfully! Your phone OTP is: ${responseData.otp}`
        );
      }
    } catch (error) {
      console.error('Failed to send phone OTP:', error);
      // Error handling is done in the service
    } finally {
      setOtpLoading(false);
    }
  };

  // Send email OTP
  const handleSendEmailOtp = async () => {
    if (!formData.email) {
      ErrorHandler.showWarning('Please enter your email first');
      return;
    }

    if (!isValidEmail(formData.email)) {
      ErrorHandler.showWarning('Please enter a valid email');
      return;
    }

    setOtpLoading(true);
    try {
      const result = await apiClient.sendEmailOtp(
        formData.email,
        OtpType.REGISTER_EMAIL_VERIFICATION
      );
      const responseData = result.data as any;

      if (responseData?.otp) {
        setEmailOtpSent(true);
        ErrorHandler.showInfo(
          `Email OTP sent successfully! Your email OTP is: ${responseData.otp}`
        );
      }
    } catch (error) {
      console.error('Failed to send email OTP:', error);
      // Error handling is done in the service
    } finally {
      setOtpLoading(false);
    }
  };

  // Verify phone OTP
  const handleVerifyPhoneOtp = async () => {
    if (!formData.phoneOtp) {
      ErrorHandler.showWarning('Please enter the phone OTP');
      return;
    }

    setOtpLoading(true);
    try {
      // Combine country code with phone number
      const fullPhoneNumber = getFullPhoneNumber(
        formData.phone,
        formData.countryCode
      );

      const result = await apiClient.verifyPhoneOtp(
        fullPhoneNumber,
        formData.phoneOtp,
        OtpType.REGISTER_PHONE_VERIFICATION
      );
      const responseData = result.data as any;
      const isValid = responseData?.success;

      if (isValid) {
        setPhoneOtpVerified(true);
        ErrorHandler.showSuccess('Phone OTP verified successfully!');
      } else {
        ErrorHandler.showWarning('Invalid phone OTP. Please try again.');
      }
    } catch (error) {
      console.error('Failed to verify phone OTP:', error);
      // Error handling is done in the service
    } finally {
      setOtpLoading(false);
    }
  };

  // Verify email OTP
  const handleVerifyEmailOtp = async () => {
    if (!formData.emailOtp) {
      ErrorHandler.showWarning('Please enter the email OTP');
      return;
    }

    setOtpLoading(true);
    try {
      const result = await apiClient.verifyEmailOtp(
        formData.email,
        formData.emailOtp,
        OtpType.REGISTER_EMAIL_VERIFICATION
      );
      const responseData = result.data as any;
      const isValid = responseData?.success;

      if (isValid) {
        setEmailOtpVerified(true);
        ErrorHandler.showSuccess('Email OTP verified successfully!');
      } else {
        ErrorHandler.showWarning('Invalid email OTP. Please try again.');
      }
    } catch (error) {
      console.error('Failed to verify email OTP:', error);
      // Error handling is done in the service
    } finally {
      setOtpLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    console.log('Form Data:', formData);
    // Basic user validation
    if (!formData.name.trim()) {
      newErrors.name = t('auth.fullNameRequired');
    }

    // Validate based on primary verification method
    if (primaryVerificationMethod === 'phone') {
      // Phone is required, email is optional
      if (!formData.phone) {
        newErrors.phone = t('auth.phoneNumberRequired');
      } else if (formData.phone.length < 7 || formData.phone.length > 15) {
        newErrors.phone = t('auth.validPhoneNumber');
      }
      // Email is optional but must be valid if provided
      if (formData.email && !isValidEmail(formData.email)) {
        newErrors.email = t('auth.validEmailAddress');
      }
    } else {
      // Email is required, phone is optional
      if (!formData.email) {
        newErrors.email = t('auth.emailAddressRequired');
      } else if (!isValidEmail(formData.email)) {
        newErrors.email = t('auth.validEmailAddress');
      }
      // Phone is optional but must be valid if provided
      if (
        formData.phone &&
        (formData.phone.length < 7 || formData.phone.length > 15)
      ) {
        newErrors.phone = t('auth.validPhoneNumber');
      }
    }

    if (!formData.password) {
      newErrors.password = t('auth.passwordRequired');
    } else if (formData.password.length < 6) {
      newErrors.password = t('auth.passwordTooShort');
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.confirmPasswordRequired');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.passwordsDoNotMatch');
    }

    // Note: OTP verification is handled separately after form submission
    // Users can enter and verify OTPs after clicking "Create Account"

    // Store validation based on registration type
    if (registrationType === 'new-store') {
      if (!formData.storeName.trim()) {
        newErrors.storeName = t('auth.storeNameRequired');
      }
      if (!formData.storeSlug.trim()) {
        newErrors.storeSlug = t('auth.storeSlugRequired');
        // Note: When creating a new store, the user automatically becomes the manager
        // regardless of their selected user type. They can also be students/teachers in other stores.
      } else if (!/^[a-z0-9-]+$/.test(formData.storeSlug)) {
        newErrors.storeSlug = t('auth.storeSlugInvalid');
      }
    } else {
      if (!formData.existingStoreId) {
        newErrors.existingStoreId = t('auth.selectStoreRequired');
      }

      // Validate teacher request reason if requesting teacher role
      if (joinAsTeacher && !formData.teacherRequestReason.trim()) {
        newErrors.teacherRequestReason = t('auth.teacherRequestReasonRequired');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Final Step: Submit base data after verification
  const handleFormSubmission = async () => {
    setIsLoading(true);
    isSubmittingRef.current = true;

    try {
      // Ensure primary method OTP is verified
      const primaryVerified =
        primaryVerificationMethod === 'phone'
          ? phoneOtpVerified
          : emailOtpVerified;
      if (!primaryVerified) {
        const methodName =
          primaryVerificationMethod === 'phone' ? 'phone' : 'email';
        ErrorHandler.showWarning(`Please verify your ${methodName} OTP first`);
        return;
      }

      // Validate form data
      if (!validateForm()) {
        return;
      }

      // Determine role based on registration type
      let role: string;
      if (registrationType === 'new-store') {
        role = 'MANAGER';
      } else {
        // When joining existing store, register as teacher
        // Only teachers, managers, and admins can access this panel
        role = 'TEACHER';
      }

      // Create user with verified contact info
      const userData: any = {
        name: formData.name,
        phone_number: formData.phone,
        email: formData.email || undefined,
        password: formData.password,
        confirmed_password: formData.confirmPassword,
        role: role,
        store_id:
          registrationType === 'existing-store'
            ? parseInt(formData.existingStoreId)
            : undefined,
        display_name: formData.name,
        ...(phoneOtpVerified &&
          formData.phoneOtp?.trim() && { phone_otp: formData.phoneOtp.trim() }),
        ...(formData.email &&
          emailOtpVerified &&
          formData.emailOtp?.trim() && { email_otp: formData.emailOtp.trim() }),
        // Teacher request data (only when requesting teacher role)
        ...(registrationType === 'existing-store' &&
          joinAsTeacher && {
            teacher_request: true,
            teacher_request_reason: formData.teacherRequestReason
          }),
        // Store creation data (only when creating new store)
        ...(registrationType === 'new-store' && {
          store_name: formData.storeName,
          store_slug: formData.storeSlug,
          store_description: formData.storeDescription
        })
      };

      // Register user with verified OTPs
      const user = await apiClient.register(userData);

      if (user) {
        ErrorHandler.showSuccess('Registration completed successfully!');
      }
    } catch (error: unknown) {
      console.error('User registration error:', error);
      ErrorHandler.handleApiError(error);
    } finally {
      setIsLoading(false);
      isSubmittingRef.current = false;
    }
  };

  // removed unused handleFinalRegistration

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent double submission
    if (isLoading || isSubmittingRef.current) {
      return;
    }

    if (step === 'verification') {
      // Only verify primary method during registration
      if (primaryVerificationMethod === 'phone') {
        if (!phoneOtpSent) {
          await handleSendPhoneOtp();
          return;
        }
        if (!phoneOtpVerified) {
          ErrorHandler.showWarning('Please verify your phone OTP first');
          return;
        }
      } else {
        // Email is primary
        if (!emailOtpSent) {
          await handleSendEmailOtp();
          return;
        }
        if (!emailOtpVerified) {
          ErrorHandler.showWarning('Please verify your email OTP first');
          return;
        }
      }
      setStep('form');
      return;
    }

    // Determine role based on registration type
    let role: string;
    if (registrationType === 'new-store') {
      // When creating a new store, the user automatically becomes the manager
      role = 'MANAGER';
    } else {
      // Anyone joining an existing store becomes a teacher by default
      // Only teachers, managers, and admins can access this panel
      role = 'TEACHER';
    }

    setIsLoading(true);
    isSubmittingRef.current = true;

    try {
      // Register the user with auth service
      // Debug: Log the OTP values
      console.log(
        'Phone OTP:',
        formData.phoneOtp,
        'Type:',
        typeof formData.phoneOtp,
        'Length:',
        formData.phoneOtp?.length
      );
      console.log(
        'Email OTP:',
        formData.emailOtp,
        'Type:',
        typeof formData.emailOtp,
        'Length:',
        formData.emailOtp?.length
      );
      console.log('Phone OTP Verified:', phoneOtpVerified);
      console.log('Email OTP Verified:', emailOtpVerified);
      console.log('Form Data:', formData);

      // In step 2, we send the verified OTP data
      // Combine country code with phone number for backend
      const fullPhoneNumber = getFullPhoneNumber(
        formData.phone,
        formData.countryCode
      );

      const userData: any = {
        name: formData.name,
        phone_number: fullPhoneNumber, // Send full phone with country code
        email: formData.email || undefined,
        password: formData.password,
        confirmed_password: formData.confirmPassword,
        role: role,
        store_id:
          registrationType === 'existing-store'
            ? parseInt(formData.existingStoreId)
            : undefined, // No store ID when creating new store
        display_name: formData.name,
        // Store creation data (only when creating new store)
        ...(registrationType === 'new-store' && {
          store_name: formData.storeName,
          store_slug: formData.storeSlug,
          store_description: formData.storeDescription
        })
      };

      // Only add OTP fields if they are verified and not empty
      if (phoneOtpVerified && formData.phoneOtp?.trim()) {
        userData.phone_otp = formData.phoneOtp.trim();
      }

      if (formData.email && emailOtpVerified && formData.emailOtp?.trim()) {
        userData.email_otp = formData.emailOtp.trim();
      }

      console.log('Final userData being sent:', userData);
      console.log(
        'Phone OTP in userData:',
        userData.phone_otp,
        'Type:',
        typeof userData.phone_otp
      );

      const user = await apiClient.register(userData);

      if (user) {
        ErrorHandler.showSuccess('Registration successful!');

        console.log('success registrationType', user, registrationType);
        // Handle store creation or joining

        const nextStep = (user as any)?.data?.next_step as string | undefined;
        if (registrationType === 'new-store') {
          // Create new store - user becomes manager automatically
          ErrorHandler.showInfo(
            'Registration completed! Your store has been created and you are the manager. You can now login.'
          );
          // Redirect to login
          router.push('/login');
        } else {
          // Join existing store - becomes teacher
          ErrorHandler.showInfo(
            'Registration completed! You have been registered as a teacher. You can now login.'
          );
          // Redirect to login
          router.push('/login');
        }
      }
    } catch (error: unknown) {
      console.error('Registration error:', error);

      // Parse backend validation errors and map to form fields
      const fieldErrors = ErrorHandler.handleFormError(error);

      // Update form errors
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
      }
    } finally {
      setIsLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const generateStoreSlug = (storeName: string) => {
    const slug = storeName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    handleInputChange('storeSlug', slug);
  };

  return (
    <>
      <LanguageDetector />
      <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        {/* Language Switcher - Top Right/Left based on RTL */}
        <div
          className={`absolute top-4 z-[100] ${isRTL ? 'left-4' : 'right-4'}`}
        >
          <LanguageSwitcher />
        </div>

        <div className="w-full max-w-2xl">
          {/* Logo/Brand */}
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-600">
              <School className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">SkillForge</h1>
            <p className="text-gray-600">{t('auth.register')}</p>
          </div>

          {/* Access Notice */}
          <Alert className="mb-6" dir={isRTL ? 'rtl' : 'ltr'}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t('auth.panelForStaff')}{' '}
              <strong>{t('auth.teachersManagersAdmins')}</strong>.{' '}
              {t('auth.studentsLoginThroughStore')}
            </AlertDescription>
          </Alert>

          <Card className="shadow-xl" dir={isRTL ? 'rtl' : 'ltr'}>
            <StepIndicator current={step} />

            <CardHeader className="space-y-1">
              <CardTitle className="text-center text-2xl">
                {step === 'verification'
                  ? t('auth.verifyYourContact')
                  : t('auth.createStoreAccount')}
              </CardTitle>
              <CardDescription className="text-center">
                {step === 'verification'
                  ? t('auth.verifyContactDescription')
                  : t('auth.registerDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {step === 'verification' && (
                  <VerificationStep
                    formData={formData}
                    errors={errors}
                    otpLoading={otpLoading}
                    isLoading={isLoading}
                    emailOtpSent={emailOtpSent}
                    phoneOtpSent={phoneOtpSent}
                    emailOtpVerified={emailOtpVerified}
                    phoneOtpVerified={phoneOtpVerified}
                    primaryMethod={primaryVerificationMethod}
                    onChange={handleInputChange}
                    onSendPhone={handleSendPhoneOtp}
                    onVerifyPhone={handleVerifyPhoneOtp}
                    onSendEmail={handleSendEmailOtp}
                    onVerifyEmail={handleVerifyEmailOtp}
                  />
                )}

                {step === 'form' && (
                  <BaseDataForm
                    registrationType={registrationType}
                    setRegistrationType={setRegistrationType}
                    formData={formData}
                    errors={errors}
                    isLoading={isLoading}
                    stores={stores}
                    storesLoading={storesLoading}
                    storesError={storesError as any}
                    joinAsTeacher={joinAsTeacher}
                    setJoinAsTeacher={setJoinAsTeacher}
                    onChange={handleInputChange}
                    onGenerateSlug={generateStoreSlug}
                  />
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2
                        className={`h-4 w-4 animate-spin ${isRTL ? 'ml-2' : 'mr-2'}`}
                      />
                      {step === 'verification'
                        ? t('common.loading')
                        : t('auth.registering')}
                    </>
                  ) : step === 'verification' ? (
                    t('auth.continueToBaseData')
                  ) : (
                    t('auth.registerUser')
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  {t('auth.alreadyHaveAccount')}{' '}
                  <Link
                    href="/login"
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    {t('auth.signIn')}
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                href="/privacy"
                className="text-blue-600 hover:text-blue-500"
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
