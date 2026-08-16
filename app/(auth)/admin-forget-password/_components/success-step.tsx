'use client';

import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from '@/components/ui/link';
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
          className="h-12 flex-1 rounded-[14px] text-[17px] font-medium"
        >
          {t('forgotPassword.resetAnotherPassword')}
        </Button>
        <Link
          href="/admin-login"
          className="btn-brand inline-flex h-12 flex-1 items-center justify-center rounded-[14px] text-[17px] font-medium"
        >
          {t('forgotPassword.goToLogin')}
        </Link>
      </div>
    </div>
  );
}
