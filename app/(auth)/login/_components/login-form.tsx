'use client';

import { Eye, EyeOff, Lock, Loader2, Phone, Sparkles } from 'lucide-react';
import { AuthLayout } from '@/components/auth/auth-layout';
import { AuthBrand } from '@/components/auth/auth-brand';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from '@/components/ui/link';
import { LanguageSwitcher } from '@/components/language-switcher';
import { toEnglishDigits } from '@/lib/phone-utils';
import { useTranslation, useLanguage } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';

interface LoginFormProps {
  phone: string;
  password: string;
  showPassword: boolean;
  isLoading: boolean;
  errors: Record<string, string>;
  unauthorizedError: string | null;
  onPhoneChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onTogglePassword: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function LoginForm({
  phone,
  password,
  showPassword,
  isLoading,
  errors,
  unauthorizedError,
  onPhoneChange,
  onPasswordChange,
  onTogglePassword,
  onSubmit
}: LoginFormProps) {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  return (
    <AuthLayout>
      <div className={cn('fixed top-4 z-50', isRTL ? 'left-4' : 'right-4')}>
        <LanguageSwitcher />
      </div>

      <AuthBrand
        icon={<Sparkles className="h-6 w-6 text-primary-foreground" />}
        title={t('auth.loginTitle')}
        subtitle={t('auth.loginSubtitle')}
        large
      />

      {unauthorizedError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{unauthorizedError}</AlertDescription>
        </Alert>
      )}

      <div className="rounded-2xl border bg-card p-8 shadow-sm">
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
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
                onChange={(e) => onPhoneChange(toEnglishDigits(e.target.value))}
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
                onChange={(e) =>
                  onPasswordChange(toEnglishDigits(e.target.value))
                }
                className={cn(
                  'pl-9 pr-9',
                  errors.password && 'border-destructive'
                )}
                disabled={isLoading}
                dir="ltr"
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
                onClick={onTogglePassword}
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

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t('auth.dontHaveAccountYet')}{' '}
        <Link
          href="/register"
          className="font-semibold text-primary hover:underline"
        >
          {t('auth.signUp')}
        </Link>
      </p>
    </AuthLayout>
  );
}
