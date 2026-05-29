'use client';

import { Check, Loader2, Phone } from 'lucide-react';
import { AuthLayout } from '@/components/auth/auth-layout';
import { AuthBrand } from '@/components/auth/auth-brand';
import { Button } from '@/components/ui/button';
import { OtpBoxInput } from '@/components/ui/otp-box-input';
import { useTranslation } from '@/lib/i18n/hooks';

const OTP_LENGTH = 5;

interface PhoneOtpScreenProps {
  otpPhone: string;
  otp: string;
  setOtp: (v: string) => void;
  otpError: string;
  otpLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

export function PhoneOtpScreen({
  otpPhone,
  otp,
  setOtp,
  otpError,
  otpLoading,
  onSubmit,
  onBack
}: PhoneOtpScreenProps) {
  const { t } = useTranslation();

  return (
    <AuthLayout>
      <AuthBrand
        icon={<Phone className="h-6 w-6 text-primary-foreground" />}
        title={t('auth.verifyYourContact')}
        subtitle={
          <>
            {t('auth.otpSentToPhone')} <strong>{otpPhone}</strong>
          </>
        }
      />

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-center text-sm font-medium">
            {t('auth.phoneOtp')}
          </label>
          <OtpBoxInput length={OTP_LENGTH} value={otp} onChange={setOtp} />
          {otpError && (
            <p className="text-center text-xs text-destructive">{otpError}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={otpLoading || otp.length < OTP_LENGTH}
        >
          {otpLoading ? (
            <Loader2 className="me-2 h-4 w-4 animate-spin" />
          ) : (
            <Check className="me-2 h-4 w-4" />
          )}
          {t('auth.verifyAndLogin')}
        </Button>

        <button
          type="button"
          className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
          onClick={onBack}
        >
          ← {t('auth.backToLogin')}
        </button>
      </form>
    </AuthLayout>
  );
}
