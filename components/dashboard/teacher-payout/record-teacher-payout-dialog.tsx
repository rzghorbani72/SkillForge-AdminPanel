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
import { PriceInput } from '@/components/ui/price-input';
import { apiClient } from '@/lib/api';
import { apiErrorMessage } from '@/lib/api-error-message';
import { useTranslation } from '@/lib/i18n/hooks';
import { useCurrentAcademy } from '@/hooks/useCurrentAcademy';
import { formatCurrencyWithStore } from '@/lib/utils';
import { logger } from '@/lib/logging/app-logger';
import type { TeacherMoneyRow } from '@/types/dashboard';

type Props = {
  teacher: TeacherMoneyRow | null;
  onOpenChange: (open: boolean) => void;
  onRecorded: () => void;
};

/**
 * The manager paid a teacher by bank transfer and records it here. The tracking
 * code is the teacher's evidence, so it is required; amount defaults to the
 * full owed balance and can never exceed it.
 */
export function RecordTeacherPayoutDialog({
  teacher,
  onOpenChange,
  onRecorded
}: Props) {
  const { t, language } = useTranslation();
  const academy = useCurrentAcademy();
  const [amount, setAmount] = useState('');
  const [trackingCode, setTrackingCode] = useState('');
  const [bankResponse, setBankResponse] = useState('');
  const [saving, setSaving] = useState(false);

  const owed = teacher?.pending_payout ?? 0;
  const parsedAmount = Number(amount || owed);
  const canSubmit =
    !!teacher &&
    parsedAmount > 0 &&
    parsedAmount <= owed &&
    trackingCode.trim().length > 0;

  const reset = () => {
    setAmount('');
    setTrackingCode('');
    setBankResponse('');
  };

  const submit = async () => {
    if (!teacher || !canSubmit) return;
    setSaving(true);
    try {
      await apiClient.recordTeacherPayout({
        teacher_profile_id: teacher.profile_id,
        amount: parsedAmount,
        tracking_code: trackingCode.trim(),
        bank_response: bankResponse.trim() || undefined
      });
      logger.ok('TeacherPayout', 'Recorded', { amount: parsedAmount });
      toast.success(t('dashboard.teacherPayout.success'));
      reset();
      onOpenChange(false);
      onRecorded();
    } catch (error) {
      toast.error(apiErrorMessage(error, t('dashboard.teacherPayout.failed')));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={!!teacher} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {t('dashboard.teacherPayout.title', {
              name: teacher?.name ?? t('dashboard.money.unnamed')
            })}
          </DialogTitle>
          <DialogDescription>
            {t('dashboard.teacherPayout.description', {
              owed: formatCurrencyWithStore(owed, academy, undefined, language)
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="payout-amount">
              {t('dashboard.teacherPayout.amount')}
            </Label>
            <PriceInput
              id="payout-amount"
              value={amount}
              onChange={setAmount}
              placeholder={String(owed)}
              suffix={t('common.toman')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="payout-tracking">
              {t('dashboard.teacherPayout.trackingCode')}
            </Label>
            <Input
              id="payout-tracking"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              dir="ltr"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="payout-bank">
              {t('dashboard.teacherPayout.bankResponse')}
            </Label>
            <Input
              id="payout-bank"
              value={bankResponse}
              onChange={(e) => setBankResponse(e.target.value)}
              placeholder={t('dashboard.teacherPayout.bankResponseHint')}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            {t('common.cancel')}
          </Button>
          <Button onClick={submit} disabled={!canSubmit || saving}>
            {t('dashboard.teacherPayout.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
