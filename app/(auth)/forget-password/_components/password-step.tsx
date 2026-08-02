'use client';

import { AuthField, AuthSubmit } from '@/components/auth/auth-fields';
import { Button } from '@/components/ui/button';
import type { useForgetPassword } from '../use-forget-password';

type Fp = ReturnType<typeof useForgetPassword>;

export function PasswordStep({ fp }: { fp: Fp }) {
  const { t } = fp;
  const allFieldsFilled =
    fp.formData.password !== '' && fp.formData.confirmed_password !== '';

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        fp.handleResetPassword();
      }}
      className="space-y-5"
      noValidate
    >
      <AuthField
        label={t('forgotPassword.newPassword')}
        type="password"
        dir="ltr"
        autoComplete="new-password"
        value={fp.formData.password}
        onChange={(e) => fp.handleInputChange('password', e.target.value)}
        error={fp.errors.password}
        disabled={fp.isLoading}
      />

      <AuthField
        label={t('auth.confirmPassword')}
        type="password"
        dir="ltr"
        autoComplete="new-password"
        value={fp.formData.confirmed_password}
        onChange={(e) =>
          fp.handleInputChange('confirmed_password', e.target.value)
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
