'use client';

import { CheckCircle } from 'lucide-react';
import { AuthSubmit } from '@/components/auth/auth-fields';
import { Button } from '@/components/ui/button';
import type { useAdminForgetPassword } from '../use-admin-forget-password';

type Fp = ReturnType<typeof useAdminForgetPassword>;

export function SuccessStep({ fp }: { fp: Fp }) {
  const { t } = fp;

  return (
    <div className="space-y-5 text-center">
      <CheckCircle className="mx-auto h-12 w-12 text-success" />
      <h3 className="text-lg font-semibold">
        {t('forgotPassword.passwordResetSuccessTitle')}
      </h3>
      <p className="text-sm text-muted-foreground">
        {t('forgotPassword.passwordResetSuccessMessage')}
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={fp.resetForm}
          className="flex-1"
        >
          {t('forgotPassword.resetAnotherPassword')}
        </Button>
        <AuthSubmit
          className="flex-1"
          onClick={() => fp.router.push('/admin-login')}
        >
          {t('forgotPassword.goToLogin')}
        </AuthSubmit>
      </div>
    </div>
  );
}
