'use client';

import { AuthField, AuthSubmit } from '@/components/auth/auth-fields';
import { Button } from '@/components/ui/button';
import { PasswordStrength } from '@/components/ui/password-strength';
import { sanitizePasswordInput } from '@/lib/password-utils';
import type { useAdminForgetPassword } from '../use-admin-forget-password';

type Fp = ReturnType<typeof useAdminForgetPassword>;

export function PasswordStep({ fp }: { fp: Fp }) {
  const { t } = fp;
  const allFieldsFilled = fp.formData.password !== '' && fp.formData.confirmed_password !== '';

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        fp.handleResetPassword();
      }}
      className="space-y-5"
      noValidate
    >
      <div className="space-y-1.5">
        <AuthField
          label={t('forgotPassword.newPassword')}
          type="password"
          dir="ltr"
          autoComplete="new-password"
          value={fp.formData.password}
          onChange={(e) => fp.handleInputChange('password', sanitizePasswordInput(e.target.value))}
          error={fp.errors.password}
          disabled={fp.isLoading}
        />
        <PasswordStrength password={fp.formData.password} />
      </div>

      <AuthField
        label={t('auth.confirmPassword')}
        type="password"
        dir="ltr"
        autoComplete="new-password"
        value={fp.formData.confirmed_password}
        onChange={(e) =>
          fp.handleInputChange('confirmed_password', sanitizePasswordInput(e.target.value))
        }
        error={fp.errors.confirmed_password}
        disabled={fp.isLoading}
      />

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => fp.setStep('otp')}
          className="flex-1"
          disabled={fp.isLoading}
        >
          {t('common.back')}
        </Button>
        <AuthSubmit
          loading={fp.isLoading}
          disabled={fp.isLoading || !allFieldsFilled}
          className="flex-1"
        >
          {t('forgotPassword.resetPassword')}
        </AuthSubmit>
      </div>
    </form>
  );
}
