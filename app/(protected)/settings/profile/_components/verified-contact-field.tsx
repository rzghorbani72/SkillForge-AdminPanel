'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OtpPanel } from './otp-panel';
import { useTranslation } from '@/lib/i18n/hooks';
import type { OtpState } from '../_hooks/use-contact-otp';

interface VerifiedContactFieldProps {
  id: string;
  label: string;
  value: string;
  displayValue?: string;
  savedValue: string;
  isConfirmed: boolean;
  otp: OtpState;
  changeLabel: string;
  verifyLabel: string;
  onCodeChange: (code: string) => void;
  onVerify: () => void;
  onSend: () => void;
  onRevert: () => void;
  children: ReactNode;
}

/** Confirmed contacts stay locked; change opens a new-value + OTP flow. */
export function VerifiedContactField({
  id,
  label,
  value,
  displayValue,
  savedValue,
  isConfirmed,
  otp,
  changeLabel,
  verifyLabel,
  onCodeChange,
  onVerify,
  onSend,
  onRevert,
  children
}: VerifiedContactFieldProps) {
  const { t } = useTranslation();
  const [changing, setChanging] = useState(false);
  const locked = isConfirmed && !changing;
  const canSend = Boolean(value) && otp.step === 'idle' && !locked;

  useEffect(() => {
    setChanging(false);
  }, [savedValue]);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Label htmlFor={id}>{label}</Label>
        {locked ? (
          <Badge className="gap-1 border-transparent bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 hover:bg-emerald-500/10">
            <CheckCircle2 className="h-3 w-3" />
            {t('settings.emailVerified')}
          </Badge>
        ) : !isConfirmed && otp.step === 'idle' ? (
          <Badge className="gap-1 border-transparent bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-600 hover:bg-amber-500/10">
            <AlertCircle className="h-3 w-3" />
            {t('settings.emailNotVerified')}
          </Badge>
        ) : null}
      </div>

      <div className="flex gap-2">
        {locked ? (
          <Input
            id={id}
            value={displayValue ?? value}
            readOnly
            disabled
            dir="ltr"
            className="flex-1 bg-muted"
          />
        ) : (
          children
        )}
        {locked ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setChanging(true)}
            className="h-9 shrink-0"
          >
            {changeLabel}
          </Button>
        ) : null}
        {canSend ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onSend}
            className="h-9 shrink-0"
          >
            {changing ? t('settings.sendCode') : verifyLabel}
          </Button>
        ) : null}
        {changing ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setChanging(false);
              onRevert();
            }}
            className="h-9 shrink-0"
          >
            {t('common.cancel')}
          </Button>
        ) : null}
      </div>

      {locked ? null : (
        <OtpPanel
          state={otp}
          sentTo={value}
          onCodeChange={onCodeChange}
          onVerify={onVerify}
          onResend={onSend}
        />
      )}
    </div>
  );
}
