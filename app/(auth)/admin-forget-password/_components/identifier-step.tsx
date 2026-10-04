'use client';

import { AuthField, AuthPhoneField, AuthSubmit } from '@/components/auth/auth-fields';
import { toE164Iran } from '@/lib/phone-utils';
import { HumanCheck } from '@/components/auth/human-check';
import { useHumanCheck } from '@/hooks/use-human-check';
import type { useAdminForgetPassword } from '../use-admin-forget-password';

type Fp = ReturnType<typeof useAdminForgetPassword>;

export function IdentifierStep({ fp }: { fp: Fp }) {
  const { t } = fp;
  const captcha = useHumanCheck();
  const ready = fp.formData.email.trim() !== '' && fp.formData.phoneNumber.trim() !== '';

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void captcha.run(fp.handleSendOtp);
      }}
      className="space-y-5"
      noValidate
    >
      <AuthField
        label={t('auth.emailAddress')}
        type="email"
        dir="ltr"
        autoComplete="email"
        value={fp.formData.email}
        onChange={(e) => fp.handleInputChange('email', e.target.value)}
        error={fp.errors.email}
        disabled={fp.isLoading}
      />

      <AuthPhoneField
        id="phone"
        label={t('auth.phoneNumber')}
        value={fp.formData.phoneNumber}
        onValueChange={(v) => {
          fp.handleInputChange('phoneNumber', v);
          fp.handleInputChange('fullPhoneNumber', toE164Iran(v));
        }}
        error={fp.errors.phoneNumber}
        disabled={fp.isLoading}
      />

      <HumanCheck key={captcha.resetKey} onVerify={captcha.setToken} />

      <AuthSubmit loading={fp.isLoading} disabled={fp.isLoading || !ready || !captcha.solved}>
        {t('forgotPassword.sendOtp')}
      </AuthSubmit>
    </form>
  );
}
