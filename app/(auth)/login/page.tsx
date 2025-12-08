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
  Eye,
  EyeOff,
  Mail,
  Phone,
  Lock,
  Building2,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { authService } from '@/lib/auth';
import { isValidEmail, isValidPhone } from '@/lib/utils';
import { ErrorHandler } from '@/lib/error-handler';
import { useRouter, useSearchParams } from 'next/navigation';
// Note: Avoid client-side auth redirect here to prevent loops; middleware and protected layout handle it.
import { isDevelopmentMode, logDevInfo } from '@/lib/dev-utils';
import Link from 'next/link';
import { LanguageDetector } from '@/components/providers/language-detector';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useTranslation, useLanguage } from '@/lib/i18n/hooks';

export default function LoginPage() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    fullPhoneNumber: '',
    password: '',
    store_id: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [availableStores, setAvailableStores] = useState<
    Array<{ id: number; name: string; slug: string }>
  >([]);
  const [showStoreSelection, setShowStoreSelection] = useState(false);
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
        'You do not have permission to access the admin dashboard. Only ADMIN, MANAGER, and TEACHER roles are allowed.';
      setUnauthorizedError(errorMessage);
      ErrorHandler.handleValidationErrors({ message: errorMessage });

      // Clean up URL parameters
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams]);

  // Removed client-side redirect check to avoid infinite navigation loops on auth routes.

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (authMethod === 'email') {
      if (!formData.email) {
        newErrors.email = t('auth.emailRequired');
      } else if (!isValidEmail(formData.email)) {
        newErrors.email = t('auth.invalidEmail');
      }
    } else {
      if (!formData.phone) {
        newErrors.phone = t('auth.phoneRequired');
      } else if (!isValidPhone(formData.phone)) {
        newErrors.phone = t('auth.invalidPhone');
      }
    }

    if (!formData.password) {
      newErrors.password = t('auth.passwordRequired');
    } else if (formData.password.length < 6) {
      newErrors.password = t('auth.passwordTooShort');
    }

    if (showStoreSelection && !formData.store_id) {
      newErrors.store_id = t('auth.selectStore');
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
        identifier:
          authMethod === 'phone'
            ? formData.fullPhoneNumber || formData.phone
            : formData.email,
        password: formData.password,
        store_id: formData.store_id ? parseInt(formData.store_id) : undefined
      };

      const response = await authService.login(credentials);

      if (response) {
        // Check if store selection is required
        if (
          response.requires_store_selection ||
          (response.availableStores && response.availableStores.length > 0)
        ) {
          // Show store selection UI
          setAvailableStores(response.availableStores || []);
          setShowStoreSelection(true);
          return;
        }

        // Single store or specific store - proceed with normal login
        ErrorHandler.showSuccess('Login successful!');
        // Check user role and redirect accordingly
        const userRole = response.currentProfile?.role?.name;
        if (userRole === 'STUDENT' || userRole === 'USER') {
          // User is a student, redirect to their store
          if (isDevelopmentMode()) {
            // In development, show info instead of redirecting
            ErrorHandler.showInfo(
              'Development mode: Student would be redirected to store dashboard'
            );
            logDevInfo(
              'Development mode: Would redirect student to store dashboard'
            );
            // For development, redirect to dashboard instead
            router.push('/dashboard');
            return;
          } else {
            // In production, redirect to store
            ErrorHandler.showInfo('Redirecting to your store dashboard...');
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

  const handleStoreSelection = async (storeId: number) => {
    setFormData((prev) => ({ ...prev, store_id: storeId.toString() }));
    setShowStoreSelection(false);

    // Retry login with store_id
    try {
      const credentials = {
        identifier:
          authMethod === 'phone'
            ? formData.fullPhoneNumber || formData.phone
            : formData.email,
        password: formData.password,
        store_id: storeId
      };

      const response = await authService.login(credentials);

      if (response) {
        ErrorHandler.showSuccess('Login successful!');

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
    <>
      <LanguageDetector />
      <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        {/* Language Switcher - Top Right/Left based on RTL */}
        <div
          className={`absolute top-4 z-[100] ${isRTL ? 'left-4' : 'right-4'}`}
        >
          <LanguageSwitcher />
        </div>

        <div className="w-full max-w-md">
          {/* Logo/Brand */}
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-600">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">SkillForge</h1>
            <p className="text-gray-600">{t('auth.adminPanel')}</p>
          </div>

          {/* Unauthorized Role Error */}
          {unauthorizedError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{unauthorizedError}</AlertDescription>
            </Alert>
          )}

          {/* Access Notice */}
          <Alert className="mb-6" dir={isRTL ? 'rtl' : 'ltr'}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t('auth.panelForStaff')}{' '}
              <strong>{t('auth.teachersManagersAdmins')}</strong>{' '}
              {t('auth.staffOnly')} {t('auth.studentsLoginThroughStore')}
            </AlertDescription>
          </Alert>

          <Card className="shadow-xl" dir={isRTL ? 'rtl' : 'ltr'}>
            <CardHeader className="space-y-1">
              <CardTitle className="text-center text-2xl">
                {t('auth.welcomeBack')}
              </CardTitle>
              <CardDescription className="text-center">
                {t('auth.signInToAdmin')}
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

                <TabsContent
                  value="email"
                  className="space-y-4"
                  dir={isRTL ? 'rtl' : 'ltr'}
                >
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
                        <p className="text-sm text-red-500">
                          {errors.password}
                        </p>
                      )}
                    </div>

                    {showStoreSelection && (
                      <div className="space-y-2">
                        <Label htmlFor="store">{t('auth.selectStore')}</Label>
                        <div className="space-y-2">
                          {availableStores.map((store) => (
                            <button
                              key={store.id}
                              type="button"
                              onClick={() => handleStoreSelection(store.id)}
                              className={`w-full rounded-lg border p-3 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isRTL ? 'text-right' : 'text-left'}`}
                            >
                              <div className="font-medium">{store.name}</div>
                              <div className="text-sm text-gray-500">
                                {store.slug}
                              </div>
                            </button>
                          ))}
                        </div>
                        {errors.store_id && (
                          <p className="text-sm text-red-500">
                            {errors.store_id}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
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
                          {t('auth.rememberMe')}
                        </Label>
                      </div>
                      <Link
                        href="/forget-password"
                        className="text-sm text-blue-600 hover:text-blue-500"
                      >
                        {t('auth.forgotPassword')}
                      </Link>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
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
                </TabsContent>

                <TabsContent
                  value="phone"
                  className="space-y-4"
                  dir={isRTL ? 'rtl' : 'ltr'}
                >
                  <form onSubmit={handleSubmit} className="space-y-4">
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

                    <div className="space-y-2" dir={isRTL ? 'rtl' : 'ltr'}>
                      <Label htmlFor="password-phone">
                        {t('auth.password')}
                      </Label>
                      <div className="relative">
                        <Lock
                          className={`absolute top-3 h-4 w-4 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`}
                        />
                        <Input
                          id="password-phone"
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
                        <p className="text-sm text-red-500">
                          {errors.password}
                        </p>
                      )}
                    </div>

                    {showStoreSelection && (
                      <div className="space-y-2">
                        <Label htmlFor="store-phone">
                          {t('auth.selectStore')}
                        </Label>
                        <div className="space-y-2">
                          {availableStores.map((store) => (
                            <button
                              key={store.id}
                              type="button"
                              onClick={() => handleStoreSelection(store.id)}
                              className={`w-full rounded-lg border p-3 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isRTL ? 'text-right' : 'text-left'}`}
                            >
                              <div className="font-medium">{store.name}</div>
                              <div className="text-sm text-gray-500">
                                {store.slug}
                              </div>
                            </button>
                          ))}
                        </div>
                        {errors.store_id && (
                          <p className="text-sm text-red-500">
                            {errors.store_id}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
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
                          {t('auth.rememberMe')}
                        </Label>
                      </div>
                      <Link
                        href="/forget-password"
                        className="text-sm text-blue-600 hover:text-blue-500"
                      >
                        {t('auth.forgotPassword')}
                      </Link>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
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
                </TabsContent>
              </Tabs>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  {t('auth.dontHaveAccount')}{' '}
                  <Link
                    href="/register"
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    {t('auth.registerStore')}
                  </Link>
                </p>
              </div>

              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  {t('auth.areYouStudent')}{' '}
                  <Link
                    href="/find-store"
                    className="text-blue-600 hover:text-blue-500"
                  >
                    {t('auth.findStore')}
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
