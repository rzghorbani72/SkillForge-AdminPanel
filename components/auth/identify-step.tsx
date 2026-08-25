'use client';

import { useState } from 'react';
import { AuthShell } from '@/components/auth/auth-shell';
import {
  AuthPhoneField,
  AuthSubmit,
  AuthSecondaryLink
} from '@/components/auth/auth-fields';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { HCaptchaWidget } from '@/components/auth/hcaptcha-widget';
import Link from '@/components/ui/link';
import { useTranslation } from '@/lib/i18n/hooks';

interface IdentifyStepProps {
  title: string;
  subtitle?: string;
  identifier: string;
  isLoading: boolean;
  error?: string;
  notice?: string | null;
  notRegistered: boolean;
  registerHref?: string;
  captchaRequired: boolean;
  onCaptchaVerify: (token: string) => void;
  onIdentifierChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  children?: React.ReactNode;
}

/**
 * Login step 1, shared by every sign-in surface. Asks for the phone alone so
 * the account is looked up before a password is ever requested — an unknown
 * number goes to signup instead of failing a login it could never pass.
 */
export function IdentifyStep({
  title,
  subtitle,
  identifier,
  isLoading,
  error,
  notice,
  notRegistered,
  registerHref,
  captchaRequired,
  onCaptchaVerify,
  onIdentifierChange,
  onSubmit,
  children
}: IdentifyStepProps) {
  const { t } = useTranslation();
  const [hasCaptchaToken, setHasCaptchaToken] = useState(false);

  function handleCaptchaVerify(token: string) {
    setHasCaptchaToken(token !== '');
    onCaptchaVerify(token);
  }

  const canSubmit =
    identifier.trim() !== '' && (!captchaRequired || hasCaptchaToken);

  return (
    <AuthShell activeTab="login" title={title} subtitle={subtitle}>
      {notice && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{notice}</AlertDescription>
        </Alert>
      )}

      {notRegistered && registerHref && (
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

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <AuthPhoneField
          id="phone"
          label={t('auth.phoneNumber')}
          autoFocus
          value={identifier}
          onValueChange={onIdentifierChange}
          error={error}
          disabled={isLoading}
        />

        {children}

        {captchaRequired && <HCaptchaWidget onVerify={handleCaptchaVerify} />}

        <AuthSubmit loading={isLoading} disabled={isLoading || !canSubmit}>
          {t('auth.continueLabel')}
        </AuthSubmit>
      </form>

      {registerHref && (
        <AuthSecondaryLink href={registerHref}>
          {t('auth.signUp')}
        </AuthSecondaryLink>
      )}
    </AuthShell>
  );
}
