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
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Eye,
  EyeOff,
  Phone,
  Lock,
  Shield,
  Loader2,
  AlertCircle,
  ArrowRight,
  Building
} from 'lucide-react';
import { enhancedAuthService } from '@/lib/enhanced-auth';
import { isValidPhone } from '@/lib/utils';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    phone_number: '',
    password: '',
    school_id: '',
    profile_id: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const router = useRouter();

  // Set auth type to admin for staff
  enhancedAuthService.setAuthType('admin');

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.phone_number) {
      newErrors.phone_number = 'Phone number is required';
    } else if (!isValidPhone(formData.phone_number)) {
      newErrors.phone_number = 'Please enter a valid phone number';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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
        password: formData.password,
        ...(formData.school_id && { school_id: parseInt(formData.school_id) }),
        ...(formData.profile_id && {
          profile_id: parseInt(formData.profile_id)
        })
      };

      const user = await enhancedAuthService.enhancedLogin(credentials);

      if (user) {
        toast.success('Login successful! Welcome to the admin panel!');

        // Check if user is staff
        if (user.isStaff) {
          // Redirect to admin dashboard
          router.push('/admin/dashboard');
        } else {
          // User is a student, redirect to student dashboard
          router.push('/student/dashboard');
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed. Please try again.');
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-gray-100 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center">
            <Shield className="h-12 w-12 text-slate-700" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Admin Panel Access
          </h1>
          <p className="text-gray-600">
            Sign in to manage your school and courses
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="pb-4 text-center">
            <CardTitle className="text-2xl font-semibold text-gray-900">
              Staff Login
            </CardTitle>
            <CardDescription className="text-gray-600">
              For teachers, managers, and administrators
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
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="school_id"
                    type="number"
                    placeholder="Enter school ID if you know it"
                    value={formData.school_id}
                    onChange={(e) =>
                      handleInputChange('school_id', e.target.value)
                    }
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Leave blank if you're not sure
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-slate-700 py-3 text-white hover:bg-slate-800"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Access Admin Panel
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Links */}
            <div className="space-y-4 border-t pt-4 text-center">
              <div className="space-y-2">
                <Link
                  href="/admin/forgot-password"
                  className="text-sm text-slate-600 hover:text-slate-700 hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link
                    href="/admin/register"
                    className="font-medium text-slate-600 hover:text-slate-700 hover:underline"
                  >
                    Register as staff
                  </Link>
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Are you a student?{' '}
                  <Link
                    href="/student/login"
                    className="font-medium text-slate-600 hover:text-slate-700 hover:underline"
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
