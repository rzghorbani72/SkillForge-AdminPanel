'use client';

import { useState } from 'react';
import { AuthShell } from '@/components/auth/auth-shell';
import { AuthField, AuthSubmit } from '@/components/auth/auth-fields';
import { PasswordStrength } from '@/components/ui/password-strength';
import { isPasswordValid, sanitizePasswordInput } from '@/lib/password-utils';
import { useTranslation } from '@/lib/i18n/hooks';

interface SetNewPasswordScreenProps {
  loading: boolean;
  error?: string;
  onSubmit: (newPassword: string) => void;
}

/**
 * Shown after an admin-created account confirms it's really the right person
 * (password + OTP already checked) but is still carrying the one-time
 * password the admin generated. The account only gets a real session once
 * this step replaces it with a password only the user knows.
 */
export function SetNewPasswordScreen({
  loading,
  error,
  onSubmit
}: SetNewPasswordScreenProps) {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const isConfirmReady =
    password === confirmPassword && confirmPassword.length > 0;
  const canSubmit = isPasswordValid(password) && isConfirmReady && !loading;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit(password);
  }

  return (
    <AuthShell activeTab="login" title={t('auth.setNewPasswordTitle')}>
      <p className="px-3 text-start text-base text-[#616579]">
        {t('auth.setNewPasswordDescription')}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <AuthField
            label={t('auth.newPassword')}
            type="password"
            autoComplete="new-password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(sanitizePasswordInput(e.target.value))}
            disabled={loading}
          />
          <PasswordStrength password={password} />
        </div>

        <AuthField
          label={t('auth.confirmPassword')}
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) =>
            setConfirmPassword(sanitizePasswordInput(e.target.value))
          }
          error={
            confirmPassword && !isConfirmReady
              ? t('auth.passwordsDoNotMatch')
              : undefined
          }
          disabled={loading}
        />

        {error && (
          <p className="text-center text-sm text-destructive">{error}</p>
        )}

        <AuthSubmit loading={loading} disabled={!canSubmit}>
          {loading
            ? t('auth.settingPassword')
            : t('auth.setPasswordAndContinue')}
        </AuthSubmit>
      </form>
    </AuthShell>
  );
}
