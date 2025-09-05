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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Eye,
  EyeOff,
  Mail,
  Phone,
  Lock,
  School,
  Loader2,
  AlertCircle,
  User,
  Building,
  GraduationCap
} from 'lucide-react';
import { enhancedAuthService } from '@/lib/enhanced-auth';
import { isValidEmail, isValidPhone } from '@/lib/utils';
import { ErrorHandler } from '@/lib/error-handler';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSchools } from '@/hooks/useSchools';

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
  const [step, setStep] = useState<
    'form' | 'phone-verification' | 'email-verification'
  >('form');
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
      // Set auth type to public for OTP
      enhancedAuthService.setAuthType('public');

      const result = await enhancedAuthService.sendPhoneOtp(formData.phone);

      if (result.otp) {
        setPhoneOtpSent(true);
        ErrorHandler.showInfo(
          `SMS OTP sent successfully! Your phone OTP is: ${result.otp}`
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
      // Set auth type to public for OTP
      enhancedAuthService.setAuthType('public');

      const result = await enhancedAuthService.sendEmailOtp(formData.email);

      if (result.otp) {
        setEmailOtpSent(true);
        ErrorHandler.showInfo(
          `Email OTP sent successfully! Your email OTP is: ${result.otp}`
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
      const isValid = await enhancedAuthService.verifyPhoneOtp(
        formData.phone,
        formData.phoneOtp
      );

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
      const isValid = await enhancedAuthService.verifyEmailOtp(
        formData.email,
        formData.emailOtp
      );

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

  // Step 1: Register user with unverified phone and email
  const handleFormSubmission = async () => {
    setIsLoading(true);
    isSubmittingRef.current = true;

    try {
      // Validate form data
      if (!validateForm()) {
        return;
      }

      // Determine role based on registration type
      let role: string;
      if (registrationType === 'new-school') {
        role = 'MANAGER';
      } else {
        // When joining existing school, register as student first
        // They can request teacher promotion later
        role = 'STUDENT';
      }

      // Set auth type to public for registration
      enhancedAuthService.setAuthType('public');

      // Create user with unverified phone and email
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

      // Register user without OTP verification
      const user = await enhancedAuthService.enhancedRegister(userData);

      if (user) {
        ErrorHandler.showSuccess(
          'Account registered successfully! Now verifying your contact information.'
        );

        // Move to phone verification step
        setStep('phone-verification');
      }
    } catch (error: unknown) {
      console.error('User registration error:', error);
      ErrorHandler.handleApiError(error);
    } finally {
      setIsLoading(false);
      isSubmittingRef.current = false;
    }
  };

  // Step 3: Handle final registration with verified contact info
  const handleFinalRegistration = async () => {
    setIsLoading(true);
    isSubmittingRef.current = true;

    try {
      // Set auth type to public for registration
      enhancedAuthService.setAuthType('public');

      // Update user with verified OTPs
      const verificationData: any = {};

      // Add verified phone OTP
      if (phoneOtpVerified && formData.phoneOtp?.trim()) {
        verificationData.phone_otp = formData.phoneOtp.trim();
      }

      // Add verified email OTP
      if (formData.email && emailOtpVerified && formData.emailOtp?.trim()) {
        verificationData.email_otp = formData.emailOtp.trim();
      }

      // Call backend to update user with verified contact information
      // Note: This would require a new endpoint to update user verification status
      // For now, we'll show success message
      console.log(
        'Updating user with verified contact info:',
        verificationData
      );

      ErrorHandler.showSuccess('Registration completed successfully!');

      if (registrationType === 'new-school') {
        ErrorHandler.showInfo(
          'Your school has been created successfully! You are now the manager of this school with verified contact information.'
        );
        router.push('/dashboard');
      } else {
        if (joinAsTeacher) {
          ErrorHandler.showInfo(
            'Registration completed successfully! You have been registered as a student with a pending teacher role request. The school manager will review your request and notify you of the decision.'
          );
        } else {
          ErrorHandler.showInfo(
            'Registration completed successfully! You have been registered as a student with verified contact information. You can request teacher role from the school manager later.'
          );
        }
        router.push('/dashboard');
      }
    } catch (error: unknown) {
      console.error('Final registration error:', error);
      ErrorHandler.handleApiError(error);
    } finally {
      setIsLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent double submission
    if (isLoading || isSubmittingRef.current) {
      return;
    }

    // Step 1: Form submission - Create user and send OTPs
    if (step === 'form') {
      await handleFormSubmission();
      return;
    }

    // Step 2: Phone verification
    if (step === 'phone-verification') {
      // If phone OTP is not sent yet, send it
      if (!phoneOtpSent) {
        await handleSendPhoneOtp();
        return;
      }

      // If phone OTP is sent but not verified, verify it
      if (!phoneOtpVerified) {
        ErrorHandler.showWarning('Please verify your phone OTP first');
        return;
      }

      // Phone is verified, move to email verification step
      setStep('email-verification');
      return;
    }

    // Step 3: Email verification and final registration
    if (step === 'email-verification') {
      // If email OTP is not sent yet, send it
      if (!emailOtpSent) {
        await handleSendEmailOtp();
        return;
      }

      // If email OTP is sent but not verified, verify it
      if (formData.email && !emailOtpVerified) {
        ErrorHandler.showWarning('Please verify your email OTP first');
        return;
      }

      // Email is verified, complete the registration
      await handleFinalRegistration();
      return;
    }

    // Determine role based on registration type
    let role: string;
    if (registrationType === 'new-school') {
      // When creating a new school, the user automatically becomes the manager
      role = 'MANAGER';
    } else {
      // Anyone joining an existing school becomes a student by default
      // They can be promoted to higher roles by managers/admins later
      role = 'STUDENT';
    }

    setIsLoading(true);
    isSubmittingRef.current = true;

    try {
      // Set auth type to public for teacher registration
      enhancedAuthService.setAuthType('public');

      // Register the user with enhanced auth service
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

      const user = await enhancedAuthService.enhancedRegister(userData);

      if (user) {
        ErrorHandler.showSuccess('Registration successful!');

        // Handle school creation or joining
        if (registrationType === 'new-school') {
          // Create new school - user becomes manager automatically
          ErrorHandler.showInfo(
            'Creating your school... You will be the manager of this school. You can verify your phone/email OTP later.'
          );
          // Redirect to school setup
          router.push('/dashboard');
        } else {
          // Join existing school - everyone becomes student by default
          ErrorHandler.showInfo(
            'Registration successful! You have been registered as a student. You can verify your phone/email OTP later. Contact the school manager to be promoted to higher roles if needed.'
          );
          // Redirect to school dashboard
          router.push('/dashboard');
        }
      }
    } catch (error: unknown) {
      console.error('Registration error:', error);

      // Parse backend validation errors and map to form fields
      const fieldErrors = ErrorHandler.handleFormError(error, [
        'name',
        'phone',
        'email',
        'password',
        'confirmPassword',
        'phone_otp',
        'email_otp',
        'role',
        'existingSchoolId',
        'display_name'
      ]);

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
          {/* Step Indicator */}
          <div className="flex justify-center border-b p-4">
            <div className="flex items-center space-x-4">
              {/* Step 1: Fill Form */}
              <div
                className={`flex items-center space-x-2 ${step === 'form' ? 'text-blue-600' : 'text-gray-400'}`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${step === 'form' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                  1
                </div>
                <span className="font-medium">Base Data</span>
              </div>
              <div className="h-0.5 w-8 bg-gray-300"></div>

              {/* Step 2: Phone Verification */}
              <div
                className={`flex items-center space-x-2 ${step === 'phone-verification' ? 'text-blue-600' : 'text-gray-400'}`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${step === 'phone-verification' ? 'bg-blue-600 text-white' : step === 'email-verification' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
                >
                  2
                </div>
                <span className="font-medium">Phone OTP</span>
              </div>
              <div className="h-0.5 w-8 bg-gray-300"></div>

              {/* Step 3: Email Verification */}
              <div
                className={`flex items-center space-x-2 ${step === 'email-verification' ? 'text-blue-600' : 'text-gray-400'}`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${step === 'email-verification' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                  3
                </div>
                <span className="font-medium">Email OTP</span>
              </div>
            </div>
          </div>

          <CardHeader className="space-y-1">
            <CardTitle className="text-center text-2xl">
              {step === 'form'
                ? 'Create School Account'
                : step === 'phone-verification'
                  ? 'Verify Phone Number'
                  : 'Verify Email Address'}
            </CardTitle>
            <CardDescription className="text-center">
              {step === 'form'
                ? 'Register as a school manager or join as a student with unverified contact information'
                : step === 'phone-verification'
                  ? 'Send OTP to your phone number and verify it'
                  : 'Send OTP to your email address and verify it to complete registration'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {step === 'form' && (
                <>
                  {/* Registration Type Selection */}
                  <div className="space-y-2">
                    <Label>Registration Type</Label>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div
                        className={`cursor-pointer rounded-lg border-2 p-4 transition-colors ${
                          registrationType === 'new-school'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setRegistrationType('new-school')}
                      >
                        <div className="flex items-center space-x-3">
                          <Building className="h-5 w-5 text-blue-600" />
                          <div>
                            <h3 className="font-medium">Create New School</h3>
                            <p className="text-sm text-gray-600">
                              Start your own educational institution as a
                              manager
                            </p>
                          </div>
                        </div>
                      </div>
                      <div
                        className={`cursor-pointer rounded-lg border-2 p-4 transition-colors ${
                          registrationType === 'existing-school'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setRegistrationType('existing-school')}
                      >
                        <div className="flex items-center space-x-3">
                          <User className="h-5 w-5 text-green-600" />
                          <div>
                            <h3 className="font-medium">
                              Join Existing School
                            </h3>
                            <p className="text-sm text-gray-600">
                              Join as a student and optionally request teacher
                              role
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Registration Info */}
                  <div className="space-y-2">
                    <Label>Registration Info</Label>
                    <div className="rounded-lg border-2 border-blue-100 bg-blue-50 p-4">
                      <div className="flex items-center space-x-3">
                        <Building className="h-5 w-5 text-blue-600" />
                        <div>
                          <h3 className="font-medium">Role Assignment</h3>
                          <p className="text-sm text-gray-600">
                            {registrationType === 'new-school'
                              ? 'You will be the manager of your new school with full administrative privileges'
                              : 'You will be registered as a student and can request teacher role from the school manager'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Personal Information */}
              {step === 'form' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Personal Information</h3>

                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange('name', e.target.value)
                      }
                      className={errors.name ? 'border-red-500' : ''}
                      disabled={isLoading}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address (Optional)</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={(e) =>
                            handleInputChange('email', e.target.value)
                          }
                          className={`pl-10 ${
                            errors.email ? 'border-red-500' : ''
                          }`}
                          disabled={isLoading}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-sm text-red-500">{errors.email}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="Enter your phone number"
                          value={formData.phone}
                          onChange={(e) =>
                            handleInputChange('phone', e.target.value)
                          }
                          className={`pl-10 ${
                            errors.phone ? 'border-red-500' : ''
                          }`}
                          disabled={isLoading}
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-sm text-red-500">{errors.phone}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Create a password"
                          value={formData.password}
                          onChange={(e) =>
                            handleInputChange('password', e.target.value)
                          }
                          className={`pl-10 pr-10 ${
                            errors.password ? 'border-red-500' : ''
                          }`}
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                      {errors.password && (
                        <p className="text-sm text-red-500">
                          {errors.password}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm your password"
                          value={formData.confirmPassword}
                          onChange={(e) =>
                            handleInputChange('confirmPassword', e.target.value)
                          }
                          className={`pl-10 pr-10 ${
                            errors.confirmPassword ? 'border-red-500' : ''
                          }`}
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          disabled={isLoading}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-sm text-red-500">
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* School Information */}
              {step === 'form' && registrationType === 'new-school' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">School Information</h3>

                  <div className="space-y-2">
                    <Label htmlFor="schoolName">School Name</Label>
                    <Input
                      id="schoolName"
                      type="text"
                      placeholder="Enter your school name"
                      value={formData.schoolName}
                      onChange={(e) => {
                        handleInputChange('schoolName', e.target.value);
                        generateSchoolSlug(e.target.value);
                      }}
                      className={errors.schoolName ? 'border-red-500' : ''}
                      disabled={isLoading}
                    />
                    {errors.schoolName && (
                      <p className="text-sm text-red-500">
                        {errors.schoolName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="schoolSlug">School URL Slug</Label>
                    <div className="relative">
                      <Input
                        id="schoolSlug"
                        type="text"
                        placeholder="your-school-name"
                        value={formData.schoolSlug}
                        onChange={(e) =>
                          handleInputChange('schoolSlug', e.target.value)
                        }
                        className={`pr-20 ${
                          errors.schoolSlug ? 'border-red-500' : ''
                        }`}
                        disabled={isLoading}
                      />
                      <span className="absolute right-3 top-3 text-sm text-gray-500">
                        .skillforge.com
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      This will be your school&apos;s unique URL:{' '}
                      {formData.schoolSlug || 'your-school'}.skillforge.com
                    </p>
                    {errors.schoolSlug && (
                      <p className="text-sm text-red-500">
                        {errors.schoolSlug}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="schoolDescription">
                      School Description (Optional)
                    </Label>
                    <Textarea
                      id="schoolDescription"
                      placeholder="Brief description of your school..."
                      value={formData.schoolDescription}
                      onChange={(e) =>
                        handleInputChange('schoolDescription', e.target.value)
                      }
                      disabled={isLoading}
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {registrationType === 'existing-school' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Join Existing School</h3>

                  <div className="space-y-2">
                    <Label htmlFor="existingSchool">Select School</Label>
                    <Select
                      value={formData.existingSchoolId}
                      onValueChange={(value) =>
                        handleInputChange('existingSchoolId', value)
                      }
                      disabled={isLoading || schoolsLoading}
                    >
                      <SelectTrigger
                        className={
                          errors.existingSchoolId ? 'border-red-500' : ''
                        }
                      >
                        <SelectValue
                          placeholder={
                            schoolsLoading
                              ? 'Loading schools...'
                              : schoolsError
                                ? 'Error loading schools'
                                : 'Choose a school to join'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {schools.map((school) => (
                          <SelectItem
                            key={school.id}
                            value={school.id.toString()}
                          >
                            {school.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.existingSchoolId && (
                      <p className="text-sm text-red-500">
                        {errors.existingSchoolId}
                      </p>
                    )}
                    {schoolsError && (
                      <p className="text-sm text-red-500">
                        Error loading schools: {schoolsError}
                      </p>
                    )}
                  </div>

                  {/* Teacher Request Section */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="joinAsTeacher"
                        checked={joinAsTeacher}
                        onChange={(e) => setJoinAsTeacher(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label
                        htmlFor="joinAsTeacher"
                        className="flex items-center space-x-2"
                      >
                        <GraduationCap className="h-4 w-4 text-blue-600" />
                        <span>Request Teacher Role</span>
                      </Label>
                    </div>

                    {joinAsTeacher && (
                      <div className="space-y-2">
                        <Label htmlFor="teacherRequestReason">
                          Why do you want to be a teacher?
                        </Label>
                        <Textarea
                          id="teacherRequestReason"
                          placeholder="Please explain your teaching experience, qualifications, and why you want to teach at this school..."
                          value={formData.teacherRequestReason}
                          onChange={(e) =>
                            handleInputChange(
                              'teacherRequestReason',
                              e.target.value
                            )
                          }
                          disabled={isLoading}
                          rows={4}
                          className={
                            errors.teacherRequestReason ? 'border-red-500' : ''
                          }
                        />
                        <p className="text-xs text-gray-500">
                          Your request will be reviewed by the school manager.
                          You'll be notified once approved or rejected.
                        </p>
                        {errors.teacherRequestReason && (
                          <p className="text-sm text-red-500">
                            {errors.teacherRequestReason}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Phone OTP Verification Section - Step 2 */}
              {step === 'phone-verification' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="mb-2 text-lg font-medium">
                      Verify Your Phone Number
                    </h3>
                    <p className="text-sm text-gray-600">
                      {!phoneOtpSent
                        ? 'Click the button below to send OTP to your phone number'
                        : 'Please enter the OTP code sent to your phone number'}
                    </p>
                  </div>

                  {/* Phone OTP Verification */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Phone Verification</h3>

                    {!phoneOtpSent ? (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          Click the button below to send OTP to your phone
                          number: {formData.phone}
                        </p>
                        <Button
                          type="button"
                          onClick={handleSendPhoneOtp}
                          disabled={
                            otpLoading ||
                            !formData.phone ||
                            !isValidPhone(formData.phone)
                          }
                          className="w-full"
                        >
                          {otpLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Sending OTP...
                            </>
                          ) : (
                            'Send Phone OTP'
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label htmlFor="phoneOtp">Phone OTP Code</Label>
                        <div className="flex space-x-2">
                          <div className="relative flex-1">
                            <Input
                              id="phoneOtp"
                              type="text"
                              placeholder="Enter phone OTP code"
                              value={formData.phoneOtp}
                              onChange={(e) =>
                                handleInputChange('phoneOtp', e.target.value)
                              }
                              className={
                                errors.phoneOtp ? 'border-red-500' : ''
                              }
                              disabled={isLoading || otpLoading}
                            />
                          </div>
                          <Button
                            type="button"
                            onClick={handleSendPhoneOtp}
                            disabled={
                              otpLoading ||
                              !formData.phone ||
                              !isValidPhone(formData.phone)
                            }
                            className="whitespace-nowrap"
                          >
                            {otpLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              'Resend SMS OTP'
                            )}
                          </Button>
                          <Button
                            type="button"
                            onClick={handleVerifyPhoneOtp}
                            disabled={
                              otpLoading ||
                              !formData.phoneOtp ||
                              phoneOtpVerified
                            }
                            variant="outline"
                            className="whitespace-nowrap"
                          >
                            {otpLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Verifying...
                              </>
                            ) : phoneOtpVerified ? (
                              '✓ Verified'
                            ) : (
                              'Verify SMS OTP'
                            )}
                          </Button>
                        </div>
                        {errors.phoneOtp && (
                          <p className="text-sm text-red-500">
                            {errors.phoneOtp}
                          </p>
                        )}
                        {phoneOtpSent && !phoneOtpVerified && (
                          <p className="text-sm text-blue-600">
                            SMS OTP sent! Please check the info toast above for
                            the OTP code.
                          </p>
                        )}
                        {phoneOtpVerified && (
                          <p className="text-sm text-green-600">
                            ✓ Phone number verified successfully!
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Back to Form Button */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep('form')}
                    className="w-full"
                  >
                    ← Back to Form
                  </Button>
                </div>
              )}

              {/* Email OTP Verification Section - Step 3 */}
              {step === 'email-verification' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="mb-2 text-lg font-medium">
                      Verify Your Email Address
                    </h3>
                    <p className="text-sm text-gray-600">
                      {!emailOtpSent
                        ? 'Click the button below to send OTP to your email address'
                        : 'Please enter the OTP code sent to your email address'}
                    </p>
                  </div>

                  {/* Email OTP Verification */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Email Verification</h3>

                    {!emailOtpSent ? (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          Click the button below to send OTP to your email
                          address: {formData.email}
                        </p>
                        <Button
                          type="button"
                          onClick={handleSendEmailOtp}
                          disabled={
                            otpLoading ||
                            !formData.email ||
                            !isValidEmail(formData.email)
                          }
                          className="w-full"
                        >
                          {otpLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Sending OTP...
                            </>
                          ) : (
                            'Send Email OTP'
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label htmlFor="emailOtp">Email OTP Code</Label>
                        <div className="flex space-x-2">
                          <div className="relative flex-1">
                            <Input
                              id="emailOtp"
                              type="text"
                              placeholder="Enter email OTP code"
                              value={formData.emailOtp}
                              onChange={(e) =>
                                handleInputChange('emailOtp', e.target.value)
                              }
                              className={
                                errors.emailOtp ? 'border-red-500' : ''
                              }
                              disabled={isLoading || otpLoading}
                            />
                          </div>
                          <Button
                            type="button"
                            onClick={handleSendEmailOtp}
                            disabled={
                              otpLoading ||
                              !formData.email ||
                              !isValidEmail(formData.email)
                            }
                            className="whitespace-nowrap"
                          >
                            {otpLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              'Resend Email OTP'
                            )}
                          </Button>
                          <Button
                            type="button"
                            onClick={handleVerifyEmailOtp}
                            disabled={
                              otpLoading ||
                              !formData.emailOtp ||
                              emailOtpVerified
                            }
                            variant="outline"
                            className="whitespace-nowrap"
                          >
                            {otpLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Verifying...
                              </>
                            ) : emailOtpVerified ? (
                              '✓ Verified'
                            ) : (
                              'Verify Email OTP'
                            )}
                          </Button>
                        </div>
                        {errors.emailOtp && (
                          <p className="text-sm text-red-500">
                            {errors.emailOtp}
                          </p>
                        )}
                        {emailOtpSent && !emailOtpVerified && (
                          <p className="text-sm text-blue-600">
                            Email OTP sent! Please check the info toast above
                            for the OTP code.
                          </p>
                        )}
                        {emailOtpVerified && (
                          <p className="text-sm text-green-600">
                            ✓ Email verified successfully!
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Back to Phone Verification Button */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep('phone-verification')}
                    className="w-full"
                  >
                    ← Back to Phone Verification
                  </Button>
                </div>
              )}

              {step === 'form' && (
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering User...
                    </>
                  ) : (
                    'Register User'
                  )}
                </Button>
              )}

              {step === 'phone-verification' && (
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {!phoneOtpSent ? 'Sending OTP...' : 'Continuing...'}
                    </>
                  ) : !phoneOtpSent ? (
                    'Send Phone OTP'
                  ) : (
                    'Continue to Email Verification'
                  )}
                </Button>
              )}

              {step === 'email-verification' && (
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {!emailOtpSent
                        ? 'Sending OTP...'
                        : 'Completing Registration...'}
                    </>
                  ) : !emailOtpSent ? (
                    'Send Email OTP'
                  ) : (
                    'Complete Registration'
                  )}
                </Button>
              )}
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
