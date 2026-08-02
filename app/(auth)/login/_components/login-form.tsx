'use client';

import { useRouter } from 'next/navigation';
import { AuthShell } from '@/components/auth/auth-shell';
import {
  AuthField,
  AuthSubmit,
  AuthSecondaryButton
} from '@/components/auth/auth-fields';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  registrationRequired?: boolean;
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
  registrationRequired = false,
  onPhoneChange,
  onPasswordChange,
  onSubmit
}: LoginFormProps) {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <AuthShell activeTab="login" title={t('auth.loginTitle')}>
      {unauthorizedError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{unauthorizedError}</AlertDescription>
        </Alert>
      )}

      {registrationRequired && (
        <Alert className="mb-4 border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
          <AlertDescription className="space-y-2">
            <p>{t('auth.accountNotRegisteredForLogin')}</p>
            <p className="text-sm">{t('auth.registerToLoginHint')}</p>
            <Link
              href="/register"
              className="inline-block text-sm font-semibold text-primary hover:underline"
            >
              {t('auth.createAccountToContinue')} →
            </Link>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex gap-4">
        {(['password', 'otp'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onLoginMethodChange(m)}
            className={cn(
              'h-12 flex-1 border-b-2 text-base transition-colors',
              loginMethod === m
                ? 'border-[#1B98E0] font-medium text-[#181C20]'
                : 'border-transparent text-[#727272] hover:text-[#181C20]'
            )}
          >
            {m === 'password'
              ? t('auth.loginWithPassword')
              : t('auth.loginWithOtp')}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <AuthField
          id="phone"
          label={t('auth.phoneNumber')}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => onPhoneChange(toEnglishDigits(e.target.value))}
          error={errors.phone}
          disabled={isLoading}
        />

        {loginMethod === 'password' && (
          <>
            <AuthField
              label={t('auth.password')}
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) =>
                onPasswordChange(toEnglishDigits(e.target.value))
              }
              error={errors.password}
              disabled={isLoading}
            />
            <div className="px-3 text-end">
              <Link
                href="/forget-password"
                className="text-base text-[#181C20] hover:underline"
              >
                {t('auth.forgotPassword')}
              </Link>
            </div>
          </>
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

      <AuthSecondaryButton onClick={() => router.push('/register')}>
        {t('auth.signUp')}
      </AuthSecondaryButton>
    </AuthShell>
  );
}
