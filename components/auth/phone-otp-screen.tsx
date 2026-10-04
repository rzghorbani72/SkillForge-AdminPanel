'use client';

import { CheckCircle2 } from 'lucide-react';
import { AuthShell } from '@/components/auth/auth-shell';
import { AuthSubmit } from '@/components/auth/auth-fields';
import type { AuthTab } from '@/components/auth/auth-tabs';
import { OtpBoxInput } from '@/components/ui/otp-box-input';
import { useTranslation, useLanguage } from '@/lib/i18n/hooks';
import { formatIdentifierDisplay } from '@/lib/format-identifier';
import { useOtpTimer } from '@/hooks/use-otp-timer';
import { useHumanCheck } from '@/hooks/use-human-check';
import { HumanCheck } from '@/components/auth/human-check';

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
  /** Every resend is a new anonymous SMS, so it carries a fresh captcha payload. */
  onResend?: (captchaToken: string) => void | Promise<void>;
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
  children,
}: PhoneOtpScreenProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const timer = useOtpTimer(120, { autoStart: Boolean(onResend) });
  const captcha = useHumanCheck();

  return (
    <AuthShell activeTab={activeTab} title={title ?? t('auth.verifyYourContact')}>
      <div className="flex items-start justify-between gap-3 px-4">
        <p className="text-start text-base text-[#616579]">
          {t('auth.otpSentTo')}{' '}
          <strong dir="ltr">{formatIdentifierDisplay(otpPhone, language)}</strong>
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
            onComplete={() => {
              if (!verified && !otpLoading) onSubmit();
            }}
          />
          {otpError && <p className="text-center text-xs text-destructive">{otpError}</p>}
        </div>

        {onResend && (
          <div className="flex flex-col items-center gap-2 text-sm">
            {timer.canResend ? (
              <>
                <HumanCheck key={captcha.resetKey} onVerify={captcha.setToken} />
                <button
                  type="button"
                  className="text-primary hover:underline disabled:opacity-50"
                  disabled={resending || !captcha.solved}
                  onClick={async () => {
                    timer.start();
                    await captcha.run(async (token) => onResend(token));
                  }}
                >
                  {resending ? t('auth.resending') : t('auth.resendCode')}
                </button>
              </>
            ) : (
              <span className="tabular-nums text-primary">
                <bdi>{timer.formatted}</bdi>
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
