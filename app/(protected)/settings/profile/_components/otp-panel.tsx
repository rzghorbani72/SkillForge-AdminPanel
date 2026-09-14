'use client';

import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OtpBoxInput } from '@/components/ui/otp-box-input';
import { useTranslation } from '@/lib/i18n/hooks';
import type { OtpState } from '../_hooks/use-contact-otp';

interface OtpPanelProps {
  state: OtpState;
  sentTo: string;
  onCodeChange: (code: string) => void;
  onVerify: () => void;
  onResend: () => void;
}

export function OtpPanel({ state, sentTo, onCodeChange, onVerify, onResend }: OtpPanelProps) {
  const { t } = useTranslation();
  if (state.step === 'idle') return null;

  const isVerifying = state.step === 'verifying';

  return (
    <div className="space-y-3 rounded-lg border bg-muted/40 p-3">
      {state.step === 'sending' ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t('settings.sendingCode')}
        </div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            {t('settings.codeSentTo').replace('{{value}}', sentTo)}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <OtpBoxInput
              value={state.code}
              onChange={onCodeChange}
              disabled={isVerifying}
              onComplete={() => {
                if (!isVerifying) onVerify();
              }}
            />
            <Button size="sm" onClick={onVerify} disabled={state.code.length < 4 || isVerifying}>
              {isVerifying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t('settings.verifyCode')
              )}
            </Button>
            <Button variant="ghost" size="sm" onClick={onResend} disabled={isVerifying}>
              {t('settings.resendCode')}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
