'use client';

import { CheckCircle, Loader2 } from 'lucide-react';
import { AuthSubmit } from '@/components/auth/auth-fields';
import { Button } from '@/components/ui/button';
import type { useForgetPassword } from '../use-forget-password';

type Fp = ReturnType<typeof useForgetPassword>;

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
      {fp.autoRedirecting && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{t('forgotPassword.redirectingToLogin')}</span>
        </div>
      )}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={fp.resetForm}
          className="h-12 flex-1 rounded-[14px] text-[17px] font-medium"
        >
          {t('forgotPassword.resetAnotherPassword')}
        </Button>
        <AuthSubmit className="flex-1" onClick={() => fp.router.push('/login')}>
          {t('forgotPassword.goToLogin')}
        </AuthSubmit>
      </div>
    </div>
  );
}
