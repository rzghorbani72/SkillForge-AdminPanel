'use client';

import { toast } from 'react-toastify';
import { AuthShell } from '@/components/auth/auth-shell';
import {
  AuthField,
  AuthSubmit,
  AuthDivider,
  AuthGoogleButton
} from '@/components/auth/auth-fields';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PhoneInputWithCountry } from '@/components/ui/phone-input-with-country';
import Link from '@/components/ui/link';
import { toEnglishDigits } from '@/lib/phone-utils';
import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';

type LoginMethod = 'password' | 'otp';

interface LoginFormProps {
  loginMethod: LoginMethod;
  onLoginMethodChange: (m: LoginMethod) => void;
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
  loginMethod,
  onLoginMethodChange,
  phone,
  password,
  isLoading,
  errors,
  unauthorizedError,
  onPhoneChange,
  onPasswordChange,
  onSubmit
}: LoginFormProps) {
  const { t } = useTranslation();

  return (
    <AuthShell
      activeTab="login"
      title={t('auth.loginTitle')}
      subtitle={t('auth.loginSubtitle')}
    >
      {unauthorizedError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{unauthorizedError}</AlertDescription>
        </Alert>
      )}

      <div className="mb-5 grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
        {(['password', 'otp'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onLoginMethodChange(m)}
            className={cn(
              'rounded-md py-1.5 text-xs font-medium transition-colors',
              loginMethod === m
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

      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <PhoneInputWithCountry
          id="phone"
          label={t('auth.phoneNumber')}
          placeholder="09121234567"
          value={phone}
          onChange={onPhoneChange}
          error={errors.phone}
          disabled={isLoading}
          lockCountryCode="IR"
        />

        {loginMethod === 'password' && (
          <div className="space-y-2">
            <AuthField
              label={t('auth.password')}
              type="password"
              dir="ltr"
              autoComplete="current-password"
              value={password}
              onChange={(e) =>
                onPasswordChange(toEnglishDigits(e.target.value))
              }
              error={errors.password}
              disabled={isLoading}
            />
            <div className="text-left">
              <Link
                href="/forget-password"
                className="text-xs text-primary hover:underline"
              >
                {t('auth.forgotPassword')}
              </Link>
            </div>
          </div>
        )}

        <AuthSubmit loading={isLoading} disabled={isLoading}>
          {isLoading
            ? loginMethod === 'otp'
              ? t('auth.sendingCode')
              : t('auth.signingIn')
            : loginMethod === 'otp'
              ? t('auth.sendLoginCode')
              : t('auth.signIn')}
        </AuthSubmit>
      </form>

      <div className="mt-6 space-y-5">
        <AuthDivider />
        <AuthGoogleButton onClick={() => toast.info(t('auth.googleSoon'))} />
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
    </AuthShell>
  );
}
