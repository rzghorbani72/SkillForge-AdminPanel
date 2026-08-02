'use client';

import { CheckCircle2 } from 'lucide-react';
import { useEffect } from 'react';
import { AuthShell } from '@/components/auth/auth-shell';
import { AuthSubmit } from '@/components/auth/auth-fields';
import { OtpBoxInput } from '@/components/ui/otp-box-input';
import { useTranslation } from '@/lib/i18n/hooks';
import { useOtpTimer } from '@/hooks/use-otp-timer';

const DEFAULT_OTP_LENGTH = 5;

interface PhoneOtpScreenProps {
  otpPhone: string;
  otp: string;
  setOtp: (v: string) => void;
  otpLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
  otpError?: string;
  length?: number;
  title?: string;
  subtitle?: React.ReactNode;
  inputLabel?: string;
  submitLabel?: string;
  backLabel?: string;
  verified?: boolean;
  onResend?: () => void;
  resending?: boolean;
  embedded?: boolean;
  children?: React.ReactNode;
}

export function PhoneOtpScreen({
  otpPhone,
  otp,
  setOtp,
  otpLoading,
  onSubmit,
  onBack,
  otpError,
  length = DEFAULT_OTP_LENGTH,
  title,
  subtitle,
  submitLabel,
  backLabel,
  verified = false,
  onResend,
  resending = false,
  embedded = false,
  children
}: PhoneOtpScreenProps) {
  const { t } = useTranslation();
  const timer = useOtpTimer();

  useEffect(() => {
    if (onResend) timer.start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resolvedTitle = title ?? t('auth.verifyYourContact');
  const resolvedSubtitle = subtitle ?? (
    <>
      {t('auth.otpSentToPhone')} <strong>{otpPhone}</strong>
    </>
  );
  const showsSubtitleText = Boolean(subtitle) || !embedded;

  const header = showsSubtitleText ? (
    <div className="flex items-start justify-between gap-3 px-4">
      <p className="text-start text-base text-[#616579]">{resolvedSubtitle}</p>
      <button
        type="button"
        onClick={onBack}
        className="shrink-0 text-base text-primary hover:underline"
      >
        {backLabel ?? t('common.edit')}
      </button>
    </div>
  ) : null;

  const form = (
    <form onSubmit={onSubmit} className="space-y-4">
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
              onClick={() => {
                timer.start();
                onResend();
              }}
            >
              {resending ? t('auth.resending') : t('auth.resendCode')}
            </button>
          ) : (
            <span className="tabular-nums text-primary">{timer.formatted}</span>
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

      {!showsSubtitleText && (
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground"
          onClick={onBack}
        >
          ← {backLabel ?? t('auth.backToLogin')}
        </button>
      )}
    </form>
  );

  if (embedded) {
    return (
      <div className="space-y-4">
        {header}
        {form}
      </div>
    );
  }

  return (
    <AuthShell activeTab="login" title={resolvedTitle}>
      {header}
      {form}
    </AuthShell>
  );
}
