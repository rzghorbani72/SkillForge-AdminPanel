'use client';

import { Mail, Phone } from 'lucide-react';
import { AuthField, AuthSubmit } from '@/components/auth/auth-fields';
import { PhoneInputWithCountry } from '@/components/ui/phone-input-with-country';
import { cn } from '@/lib/utils';
import type { useForgetPassword } from '../use-forget-password';

type Fp = ReturnType<typeof useForgetPassword>;

const CHANNELS = [
  { key: 'email', labelKey: 'auth.email', Icon: Mail },
  { key: 'phone', labelKey: 'auth.phone', Icon: Phone }
] as const;

export function IdentifierStep({ fp }: { fp: Fp }) {
  const { t } = fp;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
        {CHANNELS.map(({ key, labelKey, Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => fp.setAuthMethod(key)}
            disabled={fp.isLoading}
            className={cn(
              'flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-colors',
              fp.authMethod === key
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {t(labelKey)}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          fp.handleSendOtp();
        }}
        className="space-y-5"
        noValidate
      >
        {fp.authMethod === 'email' ? (
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
        ) : (
          <PhoneInputWithCountry
            id="phone"
            label={t('auth.phoneNumber')}
            placeholder={t('auth.enterPhone')}
            value={fp.formData.phoneNumber}
            onChange={(v) => fp.handleInputChange('phoneNumber', v)}
            onFullPhoneChange={(v) =>
              fp.handleInputChange('fullPhoneNumber', v)
            }
            lockCountryCode="IR"
            error={fp.errors.phoneNumber}
            disabled={fp.isLoading}
            className="text-center"
          />
        )}

        <AuthSubmit loading={fp.isLoading} disabled={fp.isLoading}>
          {t('forgotPassword.sendOtp')}
        </AuthSubmit>
      </form>
    </div>
  );
}
