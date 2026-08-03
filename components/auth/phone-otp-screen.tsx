'use client';

import { CheckCircle2 } from 'lucide-react';
import { useEffect } from 'react';
import { AuthShell } from '@/components/auth/auth-shell';
import { AuthSubmit } from '@/components/auth/auth-fields';
import type { AuthTab } from '@/components/auth/auth-tabs';
import { OtpBoxInput } from '@/components/ui/otp-box-input';
import { useTranslation } from '@/lib/i18n/hooks';
import { useOtpTimer } from '@/hooks/use-otp-timer';

const DEFAULT_OTP_LENGTH = 5;

interface PhoneOtpScreenProps {
  otpPhone: string;
  otp: string;
  setOtp: (v: string) => void;
  otpLoading: boolean;
  onSubmit: () => void;
  onBack: () => void;
  activeTab?: AuthTab;
  otpError?: string;
  length?: number;
  title?: string;
  submitLabel?: string;
  backLabel?: string;
  verified?: boolean;
  onResend?: () => void;
  resending?: boolean;
  children?: React.ReactNode;
}

export function PhoneOtpScreen({
  otpPhone,
  otp,
  setOtp,
  otpLoading,
  onSubmit,
  onBack,
  activeTab = 'login',
  otpError,
  length = DEFAULT_OTP_LENGTH,
  title,
  submitLabel,
  backLabel,
  verified = false,
  onResend,
  resending = false,
  children
}: PhoneOtpScreenProps) {
  const { t } = useTranslation();
  const timer = useOtpTimer();

  useEffect(() => {
    if (onResend) timer.start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthShell
      activeTab={activeTab}
      title={title ?? t('auth.verifyYourContact')}
    >
      <div className="flex items-start justify-between gap-3 px-4">
        <p className="text-start text-base text-[#616579]">
          {t('auth.otpSentTo')} <strong dir="ltr">{otpPhone}</strong>
        </p>
        <button
          type="button"
          onClick={onBack}
          className="shrink-0 text-base text-primary hover:underline"
        >
          {backLabel ?? t('common.edit')}
        </button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="space-y-4"
      >
        <div className="space-y-2">
          <OtpBoxInput
            length={length}
            value={otp}
            onChange={setOtp}
            disabled={verified || otpLoading}
          />
          {otpError && (
            <p className="text-center text-xs text-destructive">{otpError}</p>
          )}
        </div>

        {onResend && (
          <div className="flex justify-center text-sm">
            {timer.canResend ? (
              <button
                type="button"
                className="text-primary hover:underline disabled:opacity-50"
                disabled={resending}
                onClick={async () => {
                  timer.start();
                  await onResend();
                }}
              >
                {resending ? t('auth.resending') : t('auth.resendCode')}
              </button>
            ) : (
              <span className="tabular-nums text-primary">
                {timer.formatted}
              </span>
            )}
          </div>
        )}

        {verified ? (
          <p className="flex items-center justify-center gap-1.5 text-sm text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
            {t('auth.verified')}
          </p>
        ) : (
          <AuthSubmit
            type="submit"
            loading={otpLoading}
            disabled={otpLoading || otp.length < length}
          >
            {submitLabel ?? t('auth.verifyAndLogin')}
          </AuthSubmit>
        )}

        {children}
      </form>
    </AuthShell>
  );
}
