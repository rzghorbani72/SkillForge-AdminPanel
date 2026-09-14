'use client';

import { useState } from 'react';
import { KeyRound, Loader2, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { PasswordStrength } from '@/components/ui/password-strength';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { isPasswordValid } from '@/lib/password-utils';
import { useTranslation } from '@/lib/i18n/hooks';

export function PasswordCard() {
  const { t } = useTranslation();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const isStrong = isPasswordValid(newPassword);
  const isMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const canSubmit = isStrong && !isMismatch && confirmPassword.length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      setIsSaving(true);
      await apiClient.changeProfilePassword({
        new_password: newPassword,
        confirm_new_password: confirmPassword,
      });
      ErrorHandler.showSuccess(t('settings.passwordUpdatedSuccess'));
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
            <KeyRound className="h-4 w-4" />
          </span>
          {t('settings.changePassword')}
        </CardTitle>
        <CardDescription>{t('settings.changePasswordDescription')}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="newPassword">{t('settings.newPassword')}</Label>
            <PasswordInput
              id="newPassword"
              autoComplete="new-password"
              value={newPassword}
              onChange={setNewPassword}
              placeholder={t('settings.newPasswordPlaceholder')}
            />
            <PasswordStrength password={newPassword} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t('settings.confirmNewPassword')}</Label>
            <PasswordInput
              id="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder={t('settings.confirmNewPasswordPlaceholder')}
            />
            {isMismatch && (
              <p className="text-xs text-destructive">{t('settings.newPasswordsDoNotMatch')}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted/40 p-3">
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            {t('settings.passwordSessionNote')}
          </p>
          <Button onClick={handleSubmit} disabled={!canSubmit || isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSaving ? t('settings.updating') : t('settings.updatePassword')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
