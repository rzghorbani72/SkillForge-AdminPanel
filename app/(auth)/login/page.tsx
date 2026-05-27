'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Eye,
  EyeOff,
  Phone,
  Lock,
  Loader2,
  Sparkles,
  Check
} from 'lucide-react';
import { toE164Iran } from '@/lib/phone-utils';
import Link from '@/components/ui/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { authService } from '@/lib/auth';
import { ErrorHandler } from '@/lib/error-handler';
import { isDevelopmentMode, logDevInfo } from '@/lib/dev-utils';
import { useTranslation, useLanguage } from '@/lib/i18n/hooks';
import { LanguageDetector } from '@/components/providers/language-detector';
import { LanguageSwitcher } from '@/components/language-switcher';
import { cn } from '@/lib/utils';

// Deterministic avatar colour per academy id
const AVATAR_COLORS = [
  'bg-violet-500',
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500'
];
const avatarColor = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length];

export default function LoginPage() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [unauthorizedError, setUnauthorizedError] = useState<string | null>(
    null
  );

  // Multi-academy picker state
  const [academyPickerOpen, setAcademyPickerOpen] = useState(false);
  const [availableAcademies, setAvailableAcademies] = useState<
    Array<{ id: number; name: string; slug: string }>
  >([]);
  const [pickingAcademy, setPickingAcademy] = useState(false);

  // Phone OTP verification state (for admin-created affiliate accounts)
  const [otpRequired, setOtpRequired] = useState(false);
  const [otpTempToken, setOtpTempToken] = useState('');
  const [otpPhone, setOtpPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');

  // Unauthorized role message from URL
  useEffect(() => {
    const error = searchParams.get('error');
    const message = searchParams.get('message');
    if (error === 'unauthorized_role') {
      const msg = message || t('auth.loginTitle');
      setUnauthorizedError(msg);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [searchParams, t]);

  function validate() {
    const e: Record<string, string> = {};
    if (!phone) e.phone = t('auth.phoneRequired');
    else if (phone.replace(/\D/g, '').length < 7)
      e.phone = t('auth.validPhoneNumber');
    if (!password) e.password = t('auth.passwordRequired');
    else if (password.length < 6) e.password = t('auth.passwordTooShort');
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!otp.trim()) {
      setOtpError('Enter the OTP code');
      return;
    }
    setOtpLoading(true);
    setOtpError('');
    try {
      const { apiClient } = await import('@/lib/api');
      const result = await apiClient.confirmPhoneOtp(otpTempToken, otp.trim());
      ErrorHandler.showSuccess('Phone verified!');
      // Backend sets cookie; redirect to affiliate panel
      const redirectTo = (result as any)?.redirect_to ?? '/my-affiliate';
      window.location.href = redirectTo;
    } catch (err: any) {
      setOtpError(err?.message ?? 'Invalid OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  }

  function afterLogin(response: any) {
    const userRole = response.currentProfile?.Role?.name;
    const hasNoAcademy =
      !response.currentAcademy &&
      !response.currentProfile?.academy_id &&
      !(response.currentProfile as any)?.Academy;

    if (userRole === 'AFFILIATE') {
      window.location.href = '/my-affiliate';
      return;
    }
    if (userRole === 'STUDENT') {
      if (isDevelopmentMode()) {
        logDevInfo('Student → dashboard (dev)');
        window.location.href = '/dashboard';
      } else window.location.href = '/student-dashboard';
      return;
    }
    if (userRole === 'ADMIN' || userRole === 'SUPPORT') {
      window.location.href = '/admin-login';
      return;
    }
    // USER with no academy → create one first; USER with academy → dashboard
    if (
      userRole === 'USER' ||
      userRole === 'MANAGER' ||
      userRole === 'TEACHER'
    ) {
      window.location.href = hasNoAcademy
        ? '/onboarding/create-academy'
        : '/dashboard';
      return;
    }
    ErrorHandler.showWarning(
      t('auth.panelForStaff') + ' ' + t('auth.teachersManagersAdmins')
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      const response = await authService.login({
        identifier: toE164Iran(phone),
        password
      });
      if (response) {
        // Phone OTP required (admin-created affiliate account, first login)
        if ((response as any).phone_verification_required) {
          setOtpTempToken((response as any).temp_token ?? '');
          setOtpPhone((response as any).phone ?? '');
          setOtpRequired(true);
          setIsLoading(false);
          return;
        }

        const academies =
          (response as any).availableAcademies ||
          (response as any).available_academies ||
          [];
        if (
          (response as any).requires_academy_selection ||
          (Array.isArray(academies) && academies.length > 0)
        ) {
          setAvailableAcademies(academies);
          setAcademyPickerOpen(true);
          setIsLoading(false);
          return;
        }
        ErrorHandler.showSuccess('success.loginSuccess', true);
        afterLogin(response);
      }
    } catch (error: any) {
      const fieldErrors = ErrorHandler.handleFormError(error);
      if (Object.keys(fieldErrors).length > 0) setErrors(fieldErrors);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAcademySelect(academyId: number) {
    setPickingAcademy(true);
    try {
      const response = await authService.login({
        identifier: toE164Iran(phone),
        password,
        academy_id: academyId
      });
      if (response) {
        ErrorHandler.showSuccess('success.loginSuccess', true);
        afterLogin(response);
      }
    } catch (error: any) {
      ErrorHandler.handleFormError(error);
    } finally {
      setPickingAcademy(false);
    }
  }

  // ─── Phone OTP verification screen ──────────────────────────────────────

  if (otpRequired) {
    return (
      <>
        <LanguageDetector />
        <div
          className="flex min-h-screen flex-col items-center justify-center bg-background p-4"
          dir={'rtl'}
        >
          <div className="w-full max-w-sm">
            <div className="mb-8 text-center">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary/25">
                <Phone className="h-6 w-6 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold">Verify your phone</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                An OTP was sent to <strong>{otpPhone}</strong>. Enter it below
                to activate your account.
              </p>
            </div>

            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  OTP Code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="______"
                  className="w-full rounded-md border bg-background px-4 py-3 text-center font-mono text-2xl tracking-widest outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
                {otpError && (
                  <p className="mt-1 text-xs text-destructive">{otpError}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={otpLoading}>
                {otpLoading ? (
                  <Loader2 className="me-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="me-2 h-4 w-4" />
                )}
                Confirm & Enter Panel
              </Button>

              <button
                type="button"
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setOtpRequired(false);
                  setOtp('');
                  setOtpError('');
                }}
              >
                ← Back to login
              </button>
            </form>
          </div>
        </div>
      </>
    );
  }

  // ─── Academy picker screen ───────────────────────────────────────────────

  if (academyPickerOpen) {
    return (
      <>
        <LanguageDetector />
        <div
          className="flex min-h-screen flex-col items-center justify-center bg-background p-4"
          dir={'rtl'}
        >
          <div className="w-full max-w-md">
            {/* Brand */}
            <div className="mb-8 text-center">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary/25">
                <Sparkles className="h-6 w-6 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold">{t('auth.chooseAcademy')}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {t('auth.chooseAcademyDesc')}
              </p>
            </div>

            <div className="space-y-2">
              {availableAcademies.map((academy) => (
                <button
                  key={academy.id}
                  type="button"
                  disabled={pickingAcademy}
                  onClick={() => handleAcademySelect(academy.id)}
                  className={cn(
                    'group flex w-full items-center gap-4 rounded-xl border bg-card p-4 text-start transition-all',
                    'hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm',
                    'disabled:cursor-not-allowed disabled:opacity-60'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white',
                      avatarColor(academy.id)
                    )}
                  >
                    {academy.name[0].toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold group-hover:text-primary">
                      {academy.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {academy.slug}
                    </p>
                  </div>
                  {pickingAcademy ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : (
                    <Check className="h-4 w-4 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
                  )}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="mt-6 w-full text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setAcademyPickerOpen(false)}
            >
              ← {t('auth.backToLogin')}
            </button>
          </div>
        </div>
      </>
    );
  }

  // ─── Login form ──────────────────────────────────────────────────────────

  return (
    <>
      <LanguageDetector />
      <div
        className="flex min-h-screen flex-col items-center justify-center bg-background p-4"
        dir={'rtl'}
      >
        {/* Language switcher */}
        <div className={cn('fixed top-4 z-50', isRTL ? 'left-4' : 'right-4')}>
          <LanguageSwitcher />
        </div>

        <div className="w-full max-w-sm">
          {/* Brand */}
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary/25">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t('auth.loginTitle')}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('auth.loginSubtitle')}
            </p>
          </div>

          {/* Unauthorized error */}
          {unauthorizedError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{unauthorizedError}</AlertDescription>
            </Alert>
          )}

          {/* Card */}
          <div className="rounded-2xl border bg-card p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Phone */}
              <div className="space-y-1.5">
                <Label htmlFor="phone">{t('auth.phoneNumber')}</Label>
                <div className="relative">
                  <Phone
                    className={cn(
                      'absolute top-2.5 h-4 w-4 text-muted-foreground',
                      isRTL ? 'right-3' : 'left-3'
                    )}
                  />
                  <Input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder={t('auth.phonePlaceholder')}
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errors.phone) setErrors((p) => ({ ...p, phone: '' }));
                    }}
                    className={cn(
                      isRTL ? 'pr-9' : 'pl-9',
                      errors.phone && 'border-destructive'
                    )}
                    disabled={isLoading}
                    dir="ltr"
                  />
                </div>
                {errors.phone && (
                  <p className="text-xs text-destructive">{errors.phone}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">{t('auth.password')}</Label>
                  <Link
                    href="/forget-password"
                    className="text-xs text-primary hover:underline"
                  >
                    {t('auth.forgotPassword')}
                  </Link>
                </div>
                <div className="relative">
                  <Lock
                    className={cn(
                      'absolute top-2.5 h-4 w-4 text-muted-foreground',
                      isRTL ? 'right-3' : 'left-3'
                    )}
                  />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder={t('auth.enterPassword')}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password)
                        setErrors((p) => ({ ...p, password: '' }));
                    }}
                    className={cn(
                      isRTL ? 'pl-9 pr-9' : 'pl-9 pr-9',
                      errors.password && 'border-destructive'
                    )}
                    disabled={isLoading}
                    dir="rtl"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={
                      showPassword ? t('common.inactive') : t('common.active')
                    }
                    className={cn(
                      'absolute top-0 h-full w-9 text-muted-foreground hover:bg-transparent',
                      isRTL ? 'left-0' : 'right-0'
                    )}
                    onClick={() => setShowPassword((v) => !v)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('auth.signingIn')}
                  </>
                ) : (
                  t('auth.signIn')
                )}
              </Button>
            </form>
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t('auth.dontHaveAccountYet')}{' '}
            <Link
              href="/register"
              className="font-semibold text-primary hover:underline"
            >
              {t('auth.signUp')}
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
