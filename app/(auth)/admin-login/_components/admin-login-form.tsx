'use client';

import { AuthShell } from '@/components/auth/auth-shell';
import { AuthField, AuthPhoneField, AuthSubmit } from '@/components/auth/auth-fields';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toE164Iran } from '@/lib/phone-utils';
import Link from '@/components/ui/link';
import { HumanCheck } from '@/components/auth/human-check';
import { LoginMethodToggle } from '@/components/auth/login-method-toggle';
import type { useAdminLogin } from '../use-admin-login';

type AdminLogin = ReturnType<typeof useAdminLogin>;

export function AdminLoginForm({ login }: { login: AdminLogin }) {
  const { t } = login;
  // The password field only exists in password mode.
  const allFieldsFilled =
    login.formData.email.trim() !== '' &&
    login.formData.phone.trim() !== '' &&
    (login.loginMethod === 'otp' || login.formData.password !== '') &&
    login.captcha.solved;

  return (
    <AuthShell
      activeTab="login"
      title={t('auth.adminLogin')}
      subtitle={t('auth.signInAsAdmin')}
      centerTitle
    >
      {login.unauthorizedError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{login.unauthorizedError}</AlertDescription>
        </Alert>
      )}

      <LoginMethodToggle
        value={login.loginMethod}
        onChange={login.changeMethod}
        disabled={login.isLoading}
      />

      <form onSubmit={login.handleSubmit} className="space-y-4" noValidate>
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

        <AuthPhoneField
          id="phone"
          label={t('auth.phoneNumber')}
          value={login.formData.phone}
          onValueChange={(v) => {
            login.handleInputChange('phone', v);
            login.handleInputChange('fullPhoneNumber', toE164Iran(v));
          }}
          error={login.errors.phone}
          disabled={login.isLoading}
        />

        {login.loginMethod === 'password' && (
          <>
            <AuthField
              label={t('auth.password')}
              type="password"
              dir="ltr"
              autoComplete="current-password"
              value={login.formData.password}
              onChange={(e) => login.handleInputChange('password', e.target.value)}
              error={login.errors.password}
              disabled={login.isLoading}
            />
            <div className="px-3 text-end">
              <Link
                href="/admin-forget-password"
                className="text-base text-[#181C20] hover:underline"
              >
                {t('auth.forgotPassword')}
              </Link>
            </div>
          </>
        )}

        <HumanCheck key={login.captcha.resetKey} onVerify={login.captcha.setToken} />

        <AuthSubmit loading={login.isLoading} disabled={login.isLoading || !allFieldsFilled}>
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
        <Link href="/login" className="font-semibold text-primary hover:underline">
          {t('auth.regularLogin')}
        </Link>
      </p>
    </AuthShell>
  );
}
