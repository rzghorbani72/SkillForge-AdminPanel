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
import { InputWithIcon } from '@/components/ui/input-with-icon';
import { PhoneInputWithCountry } from '@/components/ui/phone-input-with-country';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Eye,
  EyeOff,
  Mail,
  Phone,
  Lock,
  School,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { authService } from '@/lib/auth';
import { isValidEmail, isValidPhone } from '@/lib/utils';
import { ErrorHandler } from '@/lib/error-handler';
import { useRouter } from 'next/navigation';
// Note: Avoid client-side auth redirect here to prevent loops; middleware and protected layout handle it.
import { isDevelopmentMode, logDevInfo } from '@/lib/dev-utils';
import Link from 'next/link';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    school_id: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [availableSchools, setAvailableSchools] = useState<
    Array<{ id: number; name: string; slug: string }>
  >([]);
  const [showSchoolSelection, setShowSchoolSelection] = useState(false);

  const router = useRouter();

  // Removed client-side redirect check to avoid infinite navigation loops on auth routes.

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (authMethod === 'email') {
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!isValidEmail(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    } else {
      if (!formData.phone) {
        newErrors.phone = 'Phone number is required';
      } else if (!isValidPhone(formData.phone)) {
        newErrors.phone = 'Please enter a valid phone number';
      }
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (showSchoolSelection && !formData.school_id) {
      newErrors.school_id = 'Please select a school';
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
        identifier: authMethod === 'phone' ? formData.phone : formData.email,
        password: formData.password,
        school_id: formData.school_id ? parseInt(formData.school_id) : undefined
      };

      const response = await authService.login(credentials);

      if (response) {
        // Check if school selection is required
        if (
          response.requires_school_selection ||
          (response.availableSchools && response.availableSchools.length > 0)
        ) {
          // Show school selection UI
          setAvailableSchools(response.availableSchools || []);
          setShowSchoolSelection(true);
          return;
        }

        // Single school or specific school - proceed with normal login
        ErrorHandler.showSuccess('Login successful!');
        // Check user role and redirect accordingly
        const userRole = response.currentProfile?.role?.name;
        if (userRole === 'STUDENT' || userRole === 'USER') {
          // User is a student, redirect to their school
          if (isDevelopmentMode()) {
            // In development, show info instead of redirecting
            ErrorHandler.showInfo(
              'Development mode: Student would be redirected to school dashboard'
            );
            logDevInfo(
              'Development mode: Would redirect student to school dashboard'
            );
            // For development, redirect to dashboard instead
            router.push('/dashboard');
            return;
          } else {
            // In production, redirect to school
            ErrorHandler.showInfo('Redirecting to your school dashboard...');
            window.location.href = '/student-dashboard';
            return;
          }
        } else if (
          userRole === 'ADMIN' ||
          userRole === 'MANAGER' ||
          userRole === 'TEACHER'
        ) {
          // User is admin/manager/teacher, redirect to admin dashboard
          router.push('/dashboard');
          return;
        } else {
          // User doesn't have proper permissions
          ErrorHandler.showWarning(
            'You do not have permission to access this panel'
          );
          return;
        }
      }
    } catch (error: unknown) {
      console.error('Login error:', error);

      // Parse backend validation errors and map to form fields
      const fieldErrors = ErrorHandler.handleFormError(error);

      // Update form errors
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
      }
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

  const handleSchoolSelection = async (schoolId: number) => {
    setFormData((prev) => ({ ...prev, school_id: schoolId.toString() }));
    setShowSchoolSelection(false);

    // Retry login with school_id
    try {
      const credentials = {
        identifier: authMethod === 'phone' ? formData.phone : formData.email,
        password: formData.password,
        school_id: schoolId
      };

      const response = await authService.login(credentials);

      if (response) {
        ErrorHandler.showSuccess('Login successful!');

        // Store auth data
        localStorage.setItem('auth_token', response.access_token);
        localStorage.setItem('user_data', JSON.stringify(response.user));
        localStorage.setItem(
          'current_profile',
          JSON.stringify(response.currentProfile)
        );
        localStorage.setItem(
          'current_school',
          JSON.stringify(response.currentSchool)
        );

        // Check user role and redirect accordingly
        const userRole = response.currentProfile?.role?.name;
        if (
          userRole === 'ADMIN' ||
          userRole === 'MANAGER' ||
          userRole === 'TEACHER'
        ) {
          router.push('/dashboard');
          return;
        } else {
          ErrorHandler.showWarning(
            'You do not have permission to access this panel. Only Teachers, Managers, and Admins can access this panel.'
          );
          return;
        }
      }
    } catch (error: unknown) {
      console.error('Login error:', error);
      ErrorHandler.handleFormError(error);
    }
  };

  // Middleware handles redirect for already-authenticated users.

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-600">
            <School className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">SkillForge</h1>
          <p className="text-gray-600">Admin Panel</p>
        </div>

        {/* Access Notice */}
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This panel is for{' '}
            <strong>Teachers, Managers, and Administrators</strong> only.
            Students should login through their school&apos;s website.
          </AlertDescription>
        </Alert>

        <Card className="shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-center text-2xl">Welcome back</CardTitle>
            <CardDescription className="text-center">
              Sign in to your admin account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={authMethod}
              onValueChange={(value: string) =>
                setAuthMethod(value as 'email' | 'phone')
              }
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                  value="email"
                  className="flex items-center space-x-2"
                >
                  <Mail className="h-4 w-4" />
                  <span>Email</span>
                </TabsTrigger>
                <TabsTrigger
                  value="phone"
                  className="flex items-center space-x-2"
                >
                  <Phone className="h-4 w-4" />
                  <span>Phone</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="email" className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <InputWithIcon
                    id="email"
                    label="Email address"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(value) => handleInputChange('email', value)}
                    icon={Mail}
                    error={errors.email}
                    disabled={isLoading}
                  />

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
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
                      <p className="text-sm text-red-500">{errors.password}</p>
                    )}
                  </div>

                  {showSchoolSelection && (
                    <div className="space-y-2">
                      <Label htmlFor="school">Select School</Label>
                      <div className="space-y-2">
                        {availableSchools.map((school) => (
                          <button
                            key={school.id}
                            type="button"
                            onClick={() => handleSchoolSelection(school.id)}
                            className="w-full rounded-lg border p-3 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <div className="font-medium">{school.name}</div>
                            <div className="text-sm text-gray-500">
                              {school.slug}
                            </div>
                          </button>
                        ))}
                      </div>
                      {errors.school_id && (
                        <p className="text-sm text-red-500">
                          {errors.school_id}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="remember"
                        aria-label="Remember me"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label
                        htmlFor="remember"
                        className="text-sm text-gray-600"
                      >
                        Remember me
                      </Label>
                    </div>
                    <Link
                      href="/forget-password"
                      className="text-sm text-blue-600 hover:text-blue-500"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign in'
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="phone" className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <PhoneInputWithCountry
                    id="phone"
                    label="Phone number"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={(value) => handleInputChange('phone', value)}
                    error={errors.phone}
                    disabled={isLoading}
                  />

                  <div className="space-y-2">
                    <Label htmlFor="password-phone">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password-phone"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
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
                      <p className="text-sm text-red-500">{errors.password}</p>
                    )}
                  </div>

                  {showSchoolSelection && (
                    <div className="space-y-2">
                      <Label htmlFor="school-phone">Select School</Label>
                      <div className="space-y-2">
                        {availableSchools.map((school) => (
                          <button
                            key={school.id}
                            type="button"
                            onClick={() => handleSchoolSelection(school.id)}
                            className="w-full rounded-lg border p-3 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <div className="font-medium">{school.name}</div>
                            <div className="text-sm text-gray-500">
                              {school.slug}
                            </div>
                          </button>
                        ))}
                      </div>
                      {errors.school_id && (
                        <p className="text-sm text-red-500">
                          {errors.school_id}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="remember-phone"
                        aria-label="Remember me"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label
                        htmlFor="remember-phone"
                        className="text-sm text-gray-600"
                      >
                        Remember me
                      </Label>
                    </div>
                    <Link
                      href="/forget-password"
                      className="text-sm text-blue-600 hover:text-blue-500"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign in'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don&apos;t have an admin account?{' '}
                <Link
                  href="/register"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Register your School
                </Link>
              </p>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                Are you a student?{' '}
                <Link
                  href="/find-school"
                  className="text-blue-600 hover:text-blue-500"
                >
                  Find your school
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our{' '}
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
