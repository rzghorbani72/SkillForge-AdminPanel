'use client';

import { Loader2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import { Button } from '@/components/ui/button';
import { NumberInput } from '@/components/ui/number-input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import type { Dispatch, SetStateAction } from 'react';
import { AffiliateLink } from '../_lib/page-helpers';

export function AffiliateLinkDialog({
  amount,
  dialogLink,
  formatCurrency,
  requesting,
  setAmount,
  setDialogLink,
  submitWithdrawal,
}: {
  amount: string;
  dialogLink: AffiliateLink | null;
  formatCurrency: (amount: number, currency?: string) => string;
  requesting: boolean;
  setAmount: Dispatch<SetStateAction<string>>;
  setDialogLink: Dispatch<SetStateAction<AffiliateLink | null>>;
  submitWithdrawal: () => Promise<void>;
}) {
  const { t } = useTranslation();
  return (
    <Dialog
      open={!!dialogLink}
      onOpenChange={() => {
        setDialogLink(null);
        setAmount('');
      }}
    >
      <DialogContent className="max-w-sm" dir={'rtl'}>
        <DialogHeader>
          <DialogTitle>{t('affiliates.requestPayoutTitle')}</DialogTitle>
          <DialogDescription>
            {t('affiliates.payoutDialogDesc', {
              amount: formatCurrency(dialogLink?.available_balance ?? 0),
            })}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">{t('affiliates.amount')}</label>
            <div className="flex items-center gap-2">
              <NumberInput value={amount} onChange={(raw) => setAmount(raw)} dir="rtl" />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAmount(String(Math.floor(dialogLink?.available_balance ?? 0)))}
              >
                {t('affiliates.max')}
              </Button>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDialogLink(null);
                setAmount('');
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button onClick={submitWithdrawal} disabled={requesting}>
              {requesting && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
              {t('affiliates.submitRequest')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
