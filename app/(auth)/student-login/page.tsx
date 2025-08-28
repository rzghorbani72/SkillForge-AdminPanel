'use client';

import { useState } from 'react';
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
import {
  Eye,
  EyeOff,
  Phone,
  Lock,
  GraduationCap,
  Loader2,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { enhancedAuthService } from '@/lib/enhanced-auth';
import { isValidPhone } from '@/lib/utils';
import { ErrorHandler } from '@/lib/error-handler';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function StudentLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>(
    'password'
  );
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone_number: '',
    password: '',
    otp: '',
    school_id: '',
    profile_id: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const router = useRouter();

  // Set auth type to public for students
  enhancedAuthService.setAuthType('public');

  // Send OTP for login
  const handleSendOtp = async () => {
    if (!formData.phone_number) {
      ErrorHandler.showWarning('Please enter your phone number first');
      return;
    }

    if (!isValidPhone(formData.phone_number)) {
      ErrorHandler.showWarning('Please enter a valid phone number');
      return;
    }

    setOtpLoading(true);
    try {
      const result = await enhancedAuthService.sendOtp(formData.phone_number);

      if (result.otp) {
        setOtpSent(true);
        ErrorHandler.showInfo(
          `OTP sent successfully! Your OTP is: ${result.otp}`
        );
      }
    } catch (error) {
      console.error('Failed to send OTP:', error);
      // Error handling is done in the service
    } finally {
      setOtpLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.phone_number) {
      newErrors.phone_number = 'Phone number is required';
    } else if (!isValidPhone(formData.phone_number)) {
      newErrors.phone_number = 'Please enter a valid phone number';
    }

    if (loginMethod === 'password') {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    } else {
      if (!formData.otp) {
        newErrors.otp = 'OTP is required';
      } else if (formData.otp.length < 4 || formData.otp.length > 6) {
        newErrors.otp = 'OTP must be 4-6 characters';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const credentials = {
        phone_number: formData.phone_number,
        ...(loginMethod === 'password'
          ? { password: formData.password }
          : { otp: formData.otp }),
        ...(formData.school_id && { school_id: parseInt(formData.school_id) }),
        ...(formData.profile_id && {
          profile_id: parseInt(formData.profile_id)
        })
      };

      const user = await enhancedAuthService.enhancedLogin(credentials);

      if (user) {
        ErrorHandler.showSuccess('Login successful! Welcome back!');

        // Check if user is a student
        if (user.isStudent) {
          // Redirect to student dashboard
          router.push('/student/dashboard');
        } else {
          // User is staff, redirect to admin panel
          router.push('/admin/dashboard');
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      // Error handling is now done in the enhanced auth service
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center">
            <GraduationCap className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Welcome Back, Student!
          </h1>
          <p className="text-gray-600">
            Sign in to continue your learning journey
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="pb-4 text-center">
            <CardTitle className="text-2xl font-semibold text-gray-900">
              Student Login
            </CardTitle>
            <CardDescription className="text-gray-600">
              Access your courses and learning materials
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Phone Number */}
              <div className="space-y-2">
                <Label
                  htmlFor="phone_number"
                  className="text-sm font-medium text-gray-700"
                >
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone_number"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone_number}
                    onChange={(e) =>
                      handleInputChange('phone_number', e.target.value)
                    }
                    className={`pl-10 ${errors.phone_number ? 'border-red-500' : ''}`}
                    disabled={isLoading}
                  />
                </div>
                {errors.phone_number && (
                  <p className="flex items-center gap-1 text-sm text-red-600">
                    <AlertCircle className="h-3 w-3" />
                    {errors.phone_number}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange('password', e.target.value)
                    }
                    className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="flex items-center gap-1 text-sm text-red-600">
                    <AlertCircle className="h-3 w-3" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Optional School ID */}
              <div className="space-y-2">
                <Label
                  htmlFor="school_id"
                  className="text-sm font-medium text-gray-700"
                >
                  School ID (Optional)
                </Label>
                <Input
                  id="school_id"
                  type="number"
                  placeholder="Enter school ID if you know it"
                  value={formData.school_id}
                  onChange={(e) =>
                    handleInputChange('school_id', e.target.value)
                  }
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500">
                  Leave blank if you're not sure
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-blue-600 py-3 text-white hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Links */}
            <div className="space-y-4 border-t pt-4 text-center">
              <div className="space-y-2">
                <Link
                  href="/student/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link
                    href="/student/register"
                    className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Sign up as a student
                  </Link>
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Are you a teacher or administrator?{' '}
                  <Link
                    href="/admin/login"
                    className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            © 2024 SkillForge. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
