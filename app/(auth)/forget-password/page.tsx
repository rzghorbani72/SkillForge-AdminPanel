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

export default function ForgetPasswordPage() {
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
      setErrors({ identifier: 'Email or phone number is required' });
      return false;
    }

    if (authMethod === 'email' && !isValidEmail(identifier)) {
      setErrors({ identifier: 'Please enter a valid email address' });
      return false;
    }

    if (authMethod === 'phone' && !isValidPhone(identifier)) {
      setErrors({ identifier: 'Please enter a valid phone number' });
      return false;
    }

    return true;
  };

  const validatePassword = () => {
    const { password, confirmed_password } = formData;
    const newErrors: Record<string, string> = {};

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmed_password.trim()) {
      newErrors.confirmed_password = 'Please confirm your password';
    } else if (password !== confirmed_password) {
      newErrors.confirmed_password = 'Passwords do not match';
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
        setMessage('OTP sent to your email address');
      } else {
        await apiClient.sendPhoneOtp(
          formData.identifier,
          OtpType.RESET_PASSWORD_BY_PHONE
        );
        setMessage('OTP sent to your phone number');
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
      setErrors({ otp: 'OTP is required' });
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
      setMessage('OTP verified successfully');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Invalid OTP';
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
      setMessage('Password reset successfully');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to reset password';
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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Reset Password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {step === 'identifier' &&
              'Enter your email or phone number and select school (if applicable) to receive OTP'}
            {step === 'otp' && 'Enter the OTP sent to your device'}
            {step === 'password' && 'Enter your new password'}
            {step === 'success' && 'Password reset successfully'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Reset Password</CardTitle>
            <CardDescription className="text-center">
              {step === 'identifier' &&
                "Select your school if you're a student, or leave blank for manager/teacher"}
              {step === 'otp' && 'Check your device for the verification code'}
              {step === 'password' && 'Create a new secure password'}
              {step === 'success' && 'You can now login with your new password'}
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
                    <TabsTrigger value="email">Email</TabsTrigger>
                    <TabsTrigger value="phone">Phone</TabsTrigger>
                  </TabsList>
                  <TabsContent value="email" className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={formData.identifier}
                          onChange={(e) =>
                            handleInputChange('identifier', e.target.value)
                          }
                          className="pl-10"
                        />
                      </div>
                      {errors.identifier && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.identifier}
                        </p>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="phone" className="space-y-4">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="Enter your phone number"
                          value={formData.identifier}
                          onChange={(e) =>
                            handleInputChange('identifier', e.target.value)
                          }
                          className="pl-10"
                        />
                      </div>
                      {errors.identifier && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.identifier}
                        </p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="school_slug">School (Optional)</Label>
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
                        Loading schools...
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
                  Send OTP
                </Button>
              </div>
            )}

            {step === 'otp' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="otp">Verification Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
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
                    Back
                  </Button>
                  <Button
                    onClick={handleVerifyOtp}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Verify OTP
                  </Button>
                </div>
              </div>
            )}

            {step === 'password' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter new password"
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange('password', e.target.value)
                      }
                      className="pl-10"
                    />
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirmed_password">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmed_password"
                      type="password"
                      placeholder="Confirm new password"
                      value={formData.confirmed_password}
                      onChange={(e) =>
                        handleInputChange('confirmed_password', e.target.value)
                      }
                      className="pl-10"
                    />
                  </div>
                  {errors.confirmed_password && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.confirmed_password}
                    </p>
                  )}
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setStep('otp')}
                    className="flex-1"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={handleResetPassword}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Reset Password
                  </Button>
                </div>
              </div>
            )}

            {step === 'success' && (
              <div className="space-y-4 text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                <h3 className="text-lg font-medium text-gray-900">
                  Password Reset Successfully!
                </h3>
                <p className="text-sm text-gray-600">
                  Your password has been reset. You can now login with your new
                  password.
                </p>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={resetForm}
                    className="flex-1"
                  >
                    Reset Another Password
                  </Button>
                  <Button
                    onClick={() => router.push('/login')}
                    className="flex-1"
                  >
                    Go to Login
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
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
