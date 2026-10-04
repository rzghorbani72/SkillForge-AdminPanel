'use client';

import { AuthPhoneField, AuthSubmit } from '@/components/auth/auth-fields';
import { toE164Iran } from '@/lib/phone-utils';
import { HumanCheck } from '@/components/auth/human-check';
import { useHumanCheck } from '@/hooks/use-human-check';
import type { useForgetPassword } from '../use-forget-password';

type Fp = ReturnType<typeof useForgetPassword>;

export function IdentifierStep({ fp }: { fp: Fp }) {
  const { t } = fp;
  const captcha = useHumanCheck();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void captcha.run(fp.handleSendOtp);
      }}
      className="space-y-5"
      noValidate
    >
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

      <AuthSubmit
        loading={fp.isLoading}
        disabled={fp.isLoading || fp.formData.phoneNumber.trim() === '' || !captcha.solved}
      >
        {t('forgotPassword.sendOtp')}
      </AuthSubmit>
    </form>
  );
}
