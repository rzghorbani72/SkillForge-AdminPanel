'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OtpBoxInput } from '@/components/ui/otp-box-input';
import { settlementApi } from '@/lib/api-settlement';
import { useTranslation } from '@/lib/i18n/hooks';
import { toEnglishDigits } from '@/lib/phone-utils';

const OTP_LENGTH = 5;
const SHEBA_PATTERN = /^IR\d{24}$/;

interface BankAccountDialogProps {
  academyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

/**
 * Two steps in one dialog (never a scroll): enter the Sheba, then confirm with
 * the code sent to the manager. Changing where money lands must cost an OTP.
 */
export function BankAccountDialog({
  academyId,
  open,
  onOpenChange,
  onSaved
}: BankAccountDialogProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [sheba, setSheba] = useState('');
  const [holder, setHolder] = useState('');
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const normalizedSheba = toEnglishDigits(sheba)
    .replace(/\s/g, '')
    .toUpperCase();
  const isShebaValid = SHEBA_PATTERN.test(normalizedSheba);

  function reset() {
    setStep('details');
    setSheba('');
    setHolder('');
    setOtp('');
  }

  function close(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  async function sendCode() {
    setIsSubmitting(true);
    try {
      await settlementApi.requestOtp(academyId);
      setStep('otp');
      toast.success(t('settlement.bank.codeSent'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function save() {
    setIsSubmitting(true);
    try {
      await settlementApi.submitBankAccount(academyId, {
        sheba_number: normalizedSheba,
        account_holder_name: holder.trim(),
        otp: toEnglishDigits(otp)
      });
      toast.success(t('settlement.bank.submitted'));
      close(false);
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('settlement.bank.dialogTitle')}</DialogTitle>
          <DialogDescription>
            {step === 'details'
              ? t('settlement.bank.dialogDescription')
              : t('settlement.bank.otpDescription')}
          </DialogDescription>
        </DialogHeader>

        {step === 'details' ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sheba">{t('settlement.bank.shebaLabel')}</Label>
              <Input
                id="sheba"
                dir="ltr"
                placeholder="IR000000000000000000000000"
                value={sheba}
                onChange={(e) => setSheba(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {t('settlement.bank.shebaHint')}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="holder">{t('settlement.bank.holderLabel')}</Label>
              <Input
                id="holder"
                value={holder}
                onChange={(e) => setHolder(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {t('settlement.bank.holderRule')}
              </p>
            </div>
          </div>
        ) : (
          <OtpBoxInput
            length={OTP_LENGTH}
            value={otp}
            onChange={setOtp}
            disabled={isSubmitting}
            onComplete={() => {
              if (!isSubmitting) void save();
            }}
          />
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => close(false)}>
            {t('common.cancel')}
          </Button>
          {step === 'details' ? (
            <Button
              onClick={sendCode}
              disabled={
                isSubmitting || !isShebaValid || holder.trim().length < 2
              }
            >
              {t('settlement.bank.sendCode')}
            </Button>
          ) : (
            <Button
              onClick={save}
              disabled={isSubmitting || otp.length !== OTP_LENGTH}
            >
              {t('common.save')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
