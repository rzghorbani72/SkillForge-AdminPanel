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
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Eye,
  EyeOff,
  Mail,
  Phone,
  Lock,
  Shield,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { authService } from '@/lib/auth';
import { isValidEmail, isValidPhone } from '@/lib/utils';
import { ErrorHandler } from '@/lib/error-handler';
import { useRouter, useSearchParams } from 'next/navigation';
import { isDevelopmentMode, logDevInfo } from '@/lib/dev-utils';
import Link from 'next/link';
import { LanguageDetector } from '@/components/providers/language-detector';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useTranslation, useLanguage } from '@/lib/i18n/hooks';

export default function AdminLoginPage() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    fullPhoneNumber: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [unauthorizedError, setUnauthorizedError] = useState<string | null>(
    null
  );

  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for unauthorized role error from URL parameters
  useEffect(() => {
    const error = searchParams.get('error');
    const message = searchParams.get('message');

    if (error === 'unauthorized_role') {
      const errorMessage =
        message ||
        'You do not have permission to access the admin dashboard. Only ADMIN role is allowed.';
      setUnauthorizedError(errorMessage);
      ErrorHandler.handleValidationErrors({ message: errorMessage });

      // Clean up URL parameters
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = t('auth.emailRequired');
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = t('auth.invalidEmail');
    }

    if (!formData.phone) {
      newErrors.phone = t('auth.phoneRequired');
    } else if (!isValidPhone(formData.phone)) {
      newErrors.phone = t('auth.invalidPhone');
    }

    if (!formData.password) {
      newErrors.password = t('auth.passwordRequired');
    } else if (formData.password.length < 6) {
      newErrors.password = t('auth.passwordTooShort');
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
        email: formData.email,
        phone_number: formData.fullPhoneNumber || formData.phone,
        password: formData.password
      };

      const response = await authService.adminLogin(credentials);

      if (response) {
        ErrorHandler.showSuccess('success.loginSuccess', true);

        // Check user role - must be ADMIN
        const userRole = response.currentProfile?.role?.name;
        if (userRole === 'ADMIN') {
          // Admin login successful
          router.push('/dashboard');
          return;
        } else {
          // User doesn't have ADMIN role
          ErrorHandler.showWarning(
            'You do not have ADMIN permission. Please use regular login.'
          );
          router.push('/login');
          return;
        }
      }
    } catch (error: unknown) {
      console.error('Admin login error:', error);

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

  return (
    <>
      <LanguageDetector />
      <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
        {/* Language Switcher - Top Right/Left based on RTL */}
        <div
          className={`absolute top-4 z-[100] ${isRTL ? 'left-4' : 'right-4'}`}
        >
          <LanguageSwitcher />
        </div>

        <div className="w-full max-w-md">
          {/* Logo/Brand */}
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-purple-600">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">SkillForge</h1>
            <p className="text-gray-600">{t('auth.adminLogin')}</p>
          </div>

          {/* Unauthorized Role Error */}
          {unauthorizedError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{unauthorizedError}</AlertDescription>
            </Alert>
          )}

          {/* Admin Access Notice */}
          <Alert className="mb-6" dir={isRTL ? 'rtl' : 'ltr'}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t('auth.adminOnly')} <strong>{t('auth.adminsOnly')}</strong>
            </AlertDescription>
          </Alert>

          <Card className="shadow-xl" dir={isRTL ? 'rtl' : 'ltr'}>
            <CardHeader className="space-y-1">
              <CardTitle className="text-center text-2xl">
                {t('auth.adminLogin')}
              </CardTitle>
              <CardDescription className="text-center">
                {t('auth.signInAsAdmin')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
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

                <PhoneInputWithCountry
                  id="phone"
                  label={t('auth.phoneNumber')}
                  placeholder={t('auth.enterPhone')}
                  value={formData.phone}
                  onChange={(value) => handleInputChange('phone', value)}
                  onFullPhoneChange={(fullPhone) =>
                    handleInputChange('fullPhoneNumber', fullPhone)
                  }
                  error={errors.phone}
                  disabled={isLoading}
                />

                <div className="space-y-2">
                  <Label htmlFor="password">{t('auth.password')}</Label>
                  <div className="relative">
                    <Lock
                      className={`absolute top-3 h-4 w-4 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`}
                    />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('auth.enterPassword')}
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange('password', e.target.value)
                      }
                      className={`${isRTL ? 'pe-10 pr-10' : 'pl-10 ps-10'} ${
                        errors.password ? 'border-red-500' : ''
                      }`}
                      disabled={isLoading}
                      dir="ltr"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className={`absolute top-0 h-full px-3 py-2 hover:bg-transparent ${isRTL ? 'left-0' : 'right-0'}`}
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

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="remember"
                      aria-label="Remember me"
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <Label htmlFor="remember" className="text-sm text-gray-600">
                      {t('auth.rememberMe')}
                    </Label>
                  </div>
                  <Link
                    href="/admin-forget-password"
                    className="text-sm text-purple-600 hover:text-purple-500"
                  >
                    {t('auth.forgotPassword')}
                  </Link>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2
                        className={`h-4 w-4 animate-spin ${isRTL ? 'ml-2' : 'mr-2'}`}
                      />
                      {t('auth.signingIn')}
                    </>
                  ) : (
                    t('auth.signIn')
                  )}
                </Button>
              </form>
            </CardContent>

            <div className="px-6 pb-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  {t('auth.notAdmin')}{' '}
                  <Link
                    href="/login"
                    className="font-medium text-purple-600 hover:text-purple-500"
                  >
                    {t('auth.regularLogin')}
                  </Link>
                </p>
              </div>
            </div>
          </Card>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              By signing in, you agree to our{' '}
              <Link
                href="/terms"
                className="text-purple-600 hover:text-purple-500"
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                href="/privacy"
                className="text-purple-600 hover:text-purple-500"
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
