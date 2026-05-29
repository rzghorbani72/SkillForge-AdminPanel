'use client';

import { CheckCircle2, Loader2, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OtpBoxInput } from '@/components/ui/otp-box-input';
import { useTranslation } from '@/lib/i18n/hooks';
import { toE164Iran } from '@/lib/phone-utils';

interface RegisterOtpStepProps {
  phone: string;
  otpCode: string;
  setOtpCode: (v: string) => void;
  otpLoading: boolean;
  verifying: boolean;
  phoneVerified: boolean;
  submitting: boolean;
  onVerify: () => void;
  onCreateAccount: () => void;
  onResend: () => void;
  onBack: () => void;
}

const OTP_LENGTH = 5;

export function RegisterOtpStep({
  phone,
  otpCode,
  setOtpCode,
  otpLoading,
  verifying,
  phoneVerified,
  submitting,
  onVerify,
  onCreateAccount,
  onResend,
  onBack
}: RegisterOtpStepProps) {
  const { t } = useTranslation();
  const [descBefore, descAfter] = t('auth.verifyPhoneDesc').split('{phone}');
  const normalizedPhone = toE164Iran(phone);

  return (
    <div className="space-y-5">
      <div className="space-y-1 rounded-xl bg-primary/5 p-4 text-center">
        <Phone className="mx-auto h-8 w-8 text-primary" />
        <p className="text-sm font-semibold">{t('auth.verifyPhoneTitle')}</p>
        <p className="pt-2 text-xs text-muted-foreground">
          {descBefore}
          <span className="font-semibold" dir="ltr">
            {normalizedPhone}
          </span>
          {descAfter}
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-center text-sm font-medium">
          {t('auth.enterVerificationCode')}
        </p>

        <OtpBoxInput
          length={OTP_LENGTH}
          value={otpCode}
          onChange={setOtpCode}
          disabled={phoneVerified}
        />

        {phoneVerified ? (
          <p className="flex items-center justify-center gap-1.5 text-sm text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
            {t('auth.verified')}
          </p>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={verifying || otpCode.length < OTP_LENGTH}
            onClick={onVerify}
          >
            {verifying ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              t('auth.verifySmsOtp')
            )}
          </Button>
        )}
      </div>

      {phoneVerified && (
        <Button
          type="button"
          className="w-full"
          disabled={submitting}
          onClick={onCreateAccount}
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('auth.creatingAccount')}
            </>
          ) : (
            t('auth.createAccount')
          )}
        </Button>
      )}

      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          className="text-muted-foreground transition-colors hover:text-foreground"
          onClick={onBack}
        >
          ← {t('auth.backToLogin')}
        </button>
        <button
          type="button"
          className="text-primary hover:underline disabled:opacity-50"
          disabled={otpLoading}
          onClick={onResend}
        >
          {otpLoading ? t('auth.resending') : t('auth.resendCode')}
        </button>
      </div>
    </div>
  );
}
