'use client';

import { AuthField, AuthPhoneField, AuthSubmit } from '@/components/auth/auth-fields';
import { toE164Iran } from '@/lib/phone-utils';
import { cn } from '@/lib/utils';
import { HumanCheck } from '@/components/auth/human-check';
import { useHumanCheck } from '@/hooks/use-human-check';
import type { useAdminForgetPassword } from '../use-admin-forget-password';

type Fp = ReturnType<typeof useAdminForgetPassword>;

const CHANNELS = [
  { key: 'email', labelKey: 'auth.email' },
  { key: 'phone', labelKey: 'auth.phone' },
] as const;

export function IdentifierStep({ fp }: { fp: Fp }) {
  const { t } = fp;
  const captcha = useHumanCheck();
  // Only one identifier field is rendered at a time.
  const identifier = fp.authMethod === 'email' ? fp.formData.email : fp.formData.phoneNumber;

  return (
    <div className="space-y-5">
      <div className="flex gap-4">
        {CHANNELS.map(({ key, labelKey }) => (
          <button
            key={key}
            type="button"
            onClick={() => fp.setAuthMethod(key)}
            disabled={fp.isLoading}
            className={cn(
              'h-12 flex-1 rounded-2xl text-base transition-colors',
              fp.authMethod === key
                ? 'bg-white/50 font-medium text-[#181C20]'
                : 'text-[#727272] hover:bg-white/30',
            )}
          >
            {t(labelKey)}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const captchaToken = captcha.token;
          captcha.reset();
          void fp.handleSendOtp(captchaToken);
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

        <AuthSubmit
          loading={fp.isLoading}
          disabled={fp.isLoading || identifier.trim() === '' || !captcha.solved}
        >
          {t('forgotPassword.sendOtp')}
        </AuthSubmit>
      </form>
    </div>
  );
}
