'use client';

import { AlertCircle } from 'lucide-react';
import { AuthShell } from '@/components/auth/auth-shell';
import { AuthField, AuthSubmit } from '@/components/auth/auth-fields';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PhoneInputWithCountry } from '@/components/ui/phone-input-with-country';
import Link from '@/components/ui/link';
import { cn } from '@/lib/utils';
import type { useAdminLogin } from '../use-admin-login';

type AdminLogin = ReturnType<typeof useAdminLogin>;

export function AdminLoginForm({ login }: { login: AdminLogin }) {
  const { t } = login;

  return (
    <AuthShell
      activeTab="login"
      title={t('auth.adminLogin')}
      subtitle={t('auth.signInAsAdmin')}
    >
      {login.unauthorizedError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{login.unauthorizedError}</AlertDescription>
        </Alert>
      )}

      <Alert className="mb-5" dir="rtl">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {t('auth.adminOnly')} <strong>{t('auth.adminsOnly')}</strong>
        </AlertDescription>
      </Alert>

      <div className="mb-5 grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
        {(['password', 'otp'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => login.changeMethod(m)}
            disabled={login.isLoading}
            className={cn(
              'rounded-md py-1.5 text-xs font-medium transition-colors',
              login.loginMethod === m
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {m === 'password'
              ? t('auth.loginWithPassword')
              : t('auth.loginWithOtp')}
          </button>
        ))}
      </div>

      <form onSubmit={login.handleSubmit} className="space-y-5" noValidate>
        <AuthField
          label={t('auth.emailAddress')}
          type="email"
          dir="ltr"
          autoComplete="email"
          value={login.formData.email}
          onChange={(e) => login.handleInputChange('email', e.target.value)}
          error={login.errors.email}
          disabled={login.isLoading}
        />

        <PhoneInputWithCountry
          id="phone"
          label={t('auth.phoneNumber')}
          placeholder="09121234567"
          value={login.formData.phone}
          onChange={(v) => login.handleInputChange('phone', v)}
          onFullPhoneChange={(v) =>
            login.handleInputChange('fullPhoneNumber', v)
          }
          lockCountryCode="IR"
          error={login.errors.phone}
          disabled={login.isLoading}
          className="text-center"
        />

        {login.loginMethod === 'password' && (
          <div className="space-y-2">
            <AuthField
              label={t('auth.password')}
              type="password"
              dir="ltr"
              autoComplete="current-password"
              value={login.formData.password}
              onChange={(e) =>
                login.handleInputChange('password', e.target.value)
              }
              error={login.errors.password}
              disabled={login.isLoading}
            />
            <div className="text-left">
              <Link
                href="/admin-forget-password"
                className="text-xs text-primary hover:underline"
              >
                {t('auth.forgotPassword')}
              </Link>
            </div>
          </div>
        )}

        <AuthSubmit loading={login.isLoading} disabled={login.isLoading}>
          {login.isLoading
            ? login.loginMethod === 'otp'
              ? t('auth.sendingCode')
              : t('auth.signingIn')
            : login.loginMethod === 'otp'
              ? t('auth.sendLoginCode')
              : t('auth.signIn')}
        </AuthSubmit>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t('auth.notAdmin')}{' '}
        <Link
          href="/login"
          className="font-semibold text-primary hover:underline"
        >
          {t('auth.regularLogin')}
        </Link>
      </p>
    </AuthShell>
  );
}
