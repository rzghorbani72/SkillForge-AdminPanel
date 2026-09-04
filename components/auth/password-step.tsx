'use client';

import { useState } from 'react';
import { AuthShell } from '@/components/auth/auth-shell';
import {
  AuthField,
  AuthSubmit,
  AuthSecondaryButton
} from '@/components/auth/auth-fields';
import { HCaptchaWidget } from '@/components/auth/hcaptcha-widget';
import Link from '@/components/ui/link';
import { sanitizePasswordInput } from '@/lib/password-utils';
import { useTranslation, useLanguage } from '@/lib/i18n/hooks';
import { formatIdentifierDisplay } from '@/lib/format-identifier';

interface PasswordStepProps {
  title: string;
  identifier: string;
  forgotPasswordHref: string;
  password: string;
  canUseOtp: boolean;
  isLoading: boolean;
  error?: string;
  captchaRequired: boolean;
  onCaptchaVerify: (token: string) => void;
  onPasswordChange: (v: string) => void;
  onUseOtp: () => void;
  onChangeIdentifier: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

/**
 * Login step 2, shared by every sign-in surface. The account is already known
 * here, so this screen only asks for the password and offers the other methods
 * that account really has.
 */
export function PasswordStep({
  title,
  identifier,
  forgotPasswordHref,
  password,
  canUseOtp,
  isLoading,
  error,
  captchaRequired,
  onCaptchaVerify,
  onPasswordChange,
  onUseOtp,
  onChangeIdentifier,
  onSubmit
}: PasswordStepProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [hasCaptchaToken, setHasCaptchaToken] = useState(false);

  function handleCaptchaVerify(token: string) {
    setHasCaptchaToken(token !== '');
    onCaptchaVerify(token);
  }

  const canSubmit = password !== '' && (!captchaRequired || hasCaptchaToken);

  return (
    <AuthShell activeTab="login" title={title}>
      <div className="flex items-center justify-between rounded-2xl bg-black/5 px-4 py-3 text-sm">
        <span dir="ltr" className="text-[#181C20]">
          {formatIdentifierDisplay(identifier, language)}
        </span>
        <button
          type="button"
          onClick={onChangeIdentifier}
          className="font-medium text-primary hover:underline"
        >
          {t('auth.changeIdentifier')}
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <AuthField
          label={t('auth.password')}
          type="password"
          autoComplete="current-password"
          autoFocus
          value={password}
          onChange={(e) =>
            onPasswordChange(sanitizePasswordInput(e.target.value))
          }
          error={error}
          disabled={isLoading}
        />

        <div className="px-3 text-end">
          <Link
            href={forgotPasswordHref}
            className="text-base text-[#181C20] hover:underline"
          >
            {t('auth.forgotPassword')}
          </Link>
        </div>

        {captchaRequired && <HCaptchaWidget onVerify={handleCaptchaVerify} />}

        <AuthSubmit loading={isLoading} disabled={isLoading || !canSubmit}>
          {isLoading ? t('auth.signingIn') : t('auth.signIn')}
        </AuthSubmit>
      </form>

      {canUseOtp && (
        <AuthSecondaryButton onClick={onUseOtp} disabled={isLoading}>
          {t('auth.useOtpInstead')}
        </AuthSecondaryButton>
      )}
    </AuthShell>
  );
}
