'use client';

import { useState } from 'react';
import { ArrowUpRight, Info, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Link from '@/components/ui/link';
import { settlementApi, type SettlementSummary } from '@/lib/api-settlement';
import { KYC_IDENTITY_PATH } from '@/lib/kyc-error';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { useTranslation } from '@/lib/i18n/hooks';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import { toEnglishDigits } from '@/lib/phone-utils';

interface SettlementRequestCardProps {
  academyId: string;
  summary: SettlementSummary;
  onRequested: () => void;
}

/** Asks the platform to transfer the payable balance to the verified Sheba. */
export function SettlementRequestCard({
  academyId,
  summary,
  onRequested
}: SettlementRequestCardProps) {
  const { t } = useTranslation();
  const formatCurrency = useFormatCurrency();
  const formatDate = useDateFormat();

  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const parsedAmount = Number(toEnglishDigits(amount).replace(/[^\d]/g, ''));
  const isAmountValid =
    parsedAmount >= summary.min_amount &&
    parsedAmount <= summary.balance.available;

  async function submit() {
    setIsSubmitting(true);
    try {
      await settlementApi.requestSettlement(academyId, {
        amount: parsedAmount,
        notes: notes.trim() || undefined
      });
      toast.success(t('settlement.request.submitted'));
      setAmount('');
      setNotes('');
      onRequested();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowUpRight className="h-5 w-5" />
          {t('settlement.request.title')}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {t('settlement.request.description')}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {summary.blockers.length > 0 ? (
          <ul className="space-y-2">
            {summary.blockers.map((blocker) => (
              <li
                key={blocker}
                className="flex items-start gap-2 rounded-md bg-muted p-3 text-sm"
              >
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <span>
                  {blocker === 'COOLDOWN' && summary.next_request_at
                    ? t('settlement.blockers.COOLDOWN_UNTIL', {
                        date: formatDate(summary.next_request_at)
                      })
                    : blocker === 'BELOW_MINIMUM'
                      ? t('settlement.blockers.BELOW_MINIMUM', {
                          amount: formatCurrency(summary.min_amount)
                        })
                      : t(`settlement.blockers.${blocker}`)}
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        {summary.blockers.includes('KYC_REQUIRED') ||
        summary.blockers.includes('KYC_PENDING') ? (
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link href={KYC_IDENTITY_PATH}>
              <ShieldCheck className="h-4 w-4" />
              {t('settings.kyc.goToIdentity')}
            </Link>
          </Button>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="settlement-amount">
              {t('settlement.request.amountLabel')}
            </Label>
            <Input
              id="settlement-amount"
              inputMode="numeric"
              dir="ltr"
              value={amount}
              disabled={!summary.can_request}
              onChange={(e) => setAmount(e.target.value)}
            />
            <button
              type="button"
              className="text-xs text-primary underline-offset-2 hover:underline disabled:opacity-50"
              disabled={!summary.can_request}
              onClick={() => setAmount(String(summary.balance.available))}
            >
              {t('settlement.request.useMax', {
                amount: formatCurrency(summary.balance.available)
              })}
            </button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="settlement-notes">
              {t('settlement.request.notesLabel')}
            </Label>
            <Textarea
              id="settlement-notes"
              rows={3}
              value={notes}
              disabled={!summary.can_request}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <Button
          onClick={submit}
          disabled={!summary.can_request || !isAmountValid || isSubmitting}
        >
          {t('settlement.request.submit')}
        </Button>
        <p className="text-xs text-muted-foreground">
          {t('settlement.request.manualHint')}
        </p>
      </CardContent>
    </Card>
  );
}
