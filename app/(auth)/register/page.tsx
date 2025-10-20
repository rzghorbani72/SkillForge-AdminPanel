'use client';

import { useState, useRef } from 'react';
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
import { useSchools } from '@/hooks/useSchools';
import { StepIndicator } from '@/components/auth/register/StepIndicator';
import { VerificationStep } from '@/components/auth/register/VerificationStep';
import { BaseDataForm } from '@/components/auth/register/BaseDataForm';

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [registrationType, setRegistrationType] = useState<
    'new-school' | 'existing-school'
  >('new-school');
  const [joinAsTeacher, setJoinAsTeacher] = useState(false);

  // Fetch schools for the dropdown
  const {
    schools,
    isLoading: schoolsLoading,
    error: schoolsError
  } = useSchools();

  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [phoneOtpVerified, setPhoneOtpVerified] = useState(false);
  const [emailOtpVerified, setEmailOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [step, setStep] = useState<'verification' | 'form'>('verification');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    phoneOtp: '',
    emailOtp: '',
    schoolName: '',
    schoolDescription: '',
    schoolSlug: '',
    existingSchoolId: '',
    teacherRequestReason: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isSubmittingRef = useRef(false);

  const router = useRouter();

  // Send phone OTP
  const handleSendPhoneOtp = async () => {
    if (!formData.phone) {
      ErrorHandler.showWarning('Please enter your phone number first');
      return;
    }

    if (!isValidPhone(formData.phone)) {
      ErrorHandler.showWarning('Please enter a valid phone number');
      return;
    }

    setOtpLoading(true);
    try {
      const result = await apiClient.sendPhoneOtp(
        formData.phone,
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
      const result = await apiClient.verifyPhoneOtp(
        formData.phone,
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
      newErrors.name = 'Full name is required';
    }

    // Email is required for all users
    if (!formData.email) {
      newErrors.email = 'Email address is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone number is optional but must be valid if provided
    if (formData.phone && !isValidPhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Note: OTP verification is handled separately after form submission
    // Users can enter and verify OTPs after clicking "Create Account"

    // School validation based on registration type
    if (registrationType === 'new-school') {
      if (!formData.schoolName.trim()) {
        newErrors.schoolName = 'School name is required';
      }
      if (!formData.schoolSlug.trim()) {
        newErrors.schoolSlug = 'School slug is required';
        // Note: When creating a new school, the user automatically becomes the manager
        // regardless of their selected user type. They can also be students/teachers in other schools.
      } else if (!/^[a-z0-9-]+$/.test(formData.schoolSlug)) {
        newErrors.schoolSlug =
          'School slug can only contain lowercase letters, numbers, and hyphens';
      }
    } else {
      if (!formData.existingSchoolId) {
        newErrors.existingSchoolId = 'Please select a school';
      }

      // Validate teacher request reason if requesting teacher role
      if (joinAsTeacher && !formData.teacherRequestReason.trim()) {
        newErrors.teacherRequestReason =
          'Please explain why you want to be a teacher';
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
      // Ensure both OTPs are verified before allowing base data submission
      if (!phoneOtpVerified || (formData.email && !emailOtpVerified)) {
        ErrorHandler.showWarning('Please verify phone and email OTPs first');
        return;
      }

      // Validate form data
      if (!validateForm()) {
        return;
      }

      // Determine role based on registration type
      let role: string;
      if (registrationType === 'new-school') {
        role = 'MANAGER';
      } else {
        // When joining existing school, register as teacher
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
        school_id:
          registrationType === 'existing-school'
            ? parseInt(formData.existingSchoolId)
            : undefined,
        display_name: formData.name,
        ...(phoneOtpVerified &&
          formData.phoneOtp?.trim() && { phone_otp: formData.phoneOtp.trim() }),
        ...(formData.email &&
          emailOtpVerified &&
          formData.emailOtp?.trim() && { email_otp: formData.emailOtp.trim() }),
        // Teacher request data (only when requesting teacher role)
        ...(registrationType === 'existing-school' &&
          joinAsTeacher && {
            teacher_request: true,
            teacher_request_reason: formData.teacherRequestReason
          }),
        // School creation data (only when creating new school)
        ...(registrationType === 'new-school' && {
          school_name: formData.schoolName,
          school_slug: formData.schoolSlug,
          school_description: formData.schoolDescription
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
      if (!phoneOtpSent) {
        await handleSendPhoneOtp();
        return;
      }
      if (!phoneOtpVerified) {
        ErrorHandler.showWarning('Please verify your phone OTP first');
        return;
      }
      if (formData.email && !emailOtpSent) {
        await handleSendEmailOtp();
        return;
      }
      if (formData.email && !emailOtpVerified) {
        ErrorHandler.showWarning('Please verify your email OTP first');
        return;
      }
      setStep('form');
      return;
    }

    // Determine role based on registration type
    let role: string;
    if (registrationType === 'new-school') {
      // When creating a new school, the user automatically becomes the manager
      role = 'MANAGER';
    } else {
      // Anyone joining an existing school becomes a teacher by default
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
      const userData: any = {
        name: formData.name,
        phone_number: formData.phone,
        email: formData.email || undefined,
        password: formData.password,
        confirmed_password: formData.confirmPassword,
        role: role,
        school_id:
          registrationType === 'existing-school'
            ? parseInt(formData.existingSchoolId)
            : undefined, // No school ID when creating new school
        display_name: formData.name,
        // School creation data (only when creating new school)
        ...(registrationType === 'new-school' && {
          school_name: formData.schoolName,
          school_slug: formData.schoolSlug,
          school_description: formData.schoolDescription
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
        // Handle school creation or joining

        const nextStep = (user as any)?.data?.next_step as string | undefined;
        if (registrationType === 'new-school') {
          // Create new school - user becomes manager automatically
          ErrorHandler.showInfo(
            'Creating your school... You will be the manager of this school. You can verify your phone/email OTP later.'
          );
          // Redirect to school setup
          router.push(nextStep === 'login' ? '/login' : '/dashboard');
        } else {
          // Join existing school - everyone becomes student by default
          ErrorHandler.showInfo(
            'Registration successful! You have been registered as a student. You can verify your phone/email OTP later. Contact the school manager to be promoted to higher roles if needed.'
          );
          // Redirect to school dashboard
          router.push(nextStep === 'login' ? '/login' : '/dashboard');
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

  const generateSchoolSlug = (schoolName: string) => {
    const slug = schoolName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    handleInputChange('schoolSlug', slug);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-2xl">
        {/* Logo/Brand */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-600">
            <School className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">SkillForge</h1>
          <p className="text-gray-600">School Registration</p>
        </div>

        {/* Access Notice */}
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This registration is for{' '}
            <strong>School Managers and Potential Teachers</strong>. Students
            should register through their school&apos;s website.
          </AlertDescription>
        </Alert>

        <Card className="shadow-xl">
          <StepIndicator current={step} />

          <CardHeader className="space-y-1">
            <CardTitle className="text-center text-2xl">
              {step === 'verification'
                ? 'Verify Your Contact'
                : 'Create School Account'}
            </CardTitle>
            <CardDescription className="text-center">
              {step === 'verification'
                ? 'Verify phone (and email if provided) first. Then fill base data.'
                : 'Register as a school manager or join as a student'}
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
                  schools={schools}
                  schoolsLoading={schoolsLoading}
                  schoolsError={schoolsError as any}
                  joinAsTeacher={joinAsTeacher}
                  setJoinAsTeacher={setJoinAsTeacher}
                  onChange={handleInputChange}
                  onGenerateSlug={generateSchoolSlug}
                />
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {step === 'verification'
                      ? 'Checking...'
                      : 'Registering User...'}
                  </>
                ) : step === 'verification' ? (
                  'Continue to Base Data'
                ) : (
                  'Register User'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Sign in
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
            <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
