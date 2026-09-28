'use client';

import { AuthShell } from '@/components/auth/auth-shell';
import {
  AuthField,
  AuthPhoneField,
  AuthSecondaryLink,
  AuthSubmit,
} from '@/components/auth/auth-fields';
import { HumanCheck } from '@/components/auth/human-check';
import { LoginMethodToggle, type LoginMethod } from '@/components/auth/login-method-toggle';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from '@/components/ui/link';
import type { HumanCheckState } from '@/hooks/use-human-check';
import { useTranslation } from '@/lib/i18n/hooks';
import { sanitizePasswordInput } from '@/lib/password-utils';

interface LoginStepProps {
  title: string;
  phone: string;
  password: string;
  method: LoginMethod;
  captcha: HumanCheckState;
  isLoading: boolean;
  errors: Record<string, string>;
  notice?: string | null;
  notRegistered: boolean;
  registerHref: string;
  forgotPasswordHref: string;
  onPhoneChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onMethodChange: (method: LoginMethod) => void;
  onSubmit: (e: React.FormEvent) => void;
}

/** One-step sign-in: phone, password or one-time code, and a human check. */
export function LoginStep({
  title,
  phone,
  password,
  method,
  captcha,
  isLoading,
  errors,
  notice,
  notRegistered,
  registerHref,
  forgotPasswordHref,
  onPhoneChange,
  onPasswordChange,
  onMethodChange,
  onSubmit,
}: LoginStepProps) {
  const { t } = useTranslation();
  const canSubmit = phone.trim() !== '' && (method === 'otp' || password !== '') && captcha.solved;

  return (
    <AuthShell activeTab="login" title={title}>
      {notice && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{notice}</AlertDescription>
        </Alert>
      )}

      {notRegistered && (
        <Alert className="mb-4 border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
          <AlertDescription className="space-y-2">
            <p>{t('auth.accountNotRegisteredForLogin')}</p>
            <p className="text-sm">{t('auth.registerToLoginHint')}</p>
            <Link
              href={registerHref}
              className="inline-block text-sm font-semibold text-primary hover:underline"
            >
              {t('auth.createAccountToContinue')} →
            </Link>
          </AlertDescription>
        </Alert>
      )}

      <LoginMethodToggle value={method} onChange={onMethodChange} disabled={isLoading} />

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <AuthPhoneField
          id="phone"
          label={t('auth.phoneNumber')}
          autoFocus
          value={phone}
          onValueChange={onPhoneChange}
          error={errors.phone}
          disabled={isLoading}
        />

        {method === 'password' && (
          <>
            <AuthField
              label={t('auth.password')}
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => onPasswordChange(sanitizePasswordInput(e.target.value))}
              error={errors.password}
              disabled={isLoading}
            />
            <div className="px-3 text-end">
              <Link href={forgotPasswordHref} className="text-base text-[#181C20] hover:underline">
                {t('auth.forgotPassword')}
              </Link>
            </div>
          </>
        )}

        <HumanCheck key={captcha.resetKey} onVerify={captcha.setToken} />

        <AuthSubmit loading={isLoading} disabled={isLoading || !canSubmit}>
          {method === 'otp'
            ? isLoading
              ? t('auth.sendingCode')
              : t('auth.sendLoginCode')
            : isLoading
              ? t('auth.signingIn')
              : t('auth.signIn')}
        </AuthSubmit>
      </form>

      <AuthSecondaryLink href={registerHref}>{t('auth.signUp')}</AuthSecondaryLink>
    </AuthShell>
  );
}
