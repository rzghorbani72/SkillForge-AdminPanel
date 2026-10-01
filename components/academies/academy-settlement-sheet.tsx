'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { apiClient, type AcademyHealthView } from '@/lib/api';
import { settlementApi, type SettlementSummary } from '@/lib/api-settlement';
import { Sheet } from '@/components/ui/sheet';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import { apiErrorMessage } from '@/lib/api-error-message';
import { SettlementSheetContent } from './academy-settlement-sheet/settlement-sheet-content';
import { StaffWithdrawal } from './_lib/academy-settlement-sheet-helpers';

type Props = {
  academy: AcademyHealthView | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSettled: () => void;
};

function asList(data: unknown): StaffWithdrawal[] {
  if (Array.isArray(data)) return data as StaffWithdrawal[];
  if (
    data &&
    typeof data === 'object' &&
    Array.isArray((data as { withdrawals?: unknown }).withdrawals)
  ) {
    return (data as { withdrawals: StaffWithdrawal[] }).withdrawals;
  }
  return [];
}

export function AcademySettlementSheet({ academy, open, onOpenChange, onSettled }: Props) {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const formatDate = useDateFormat();
  const [summary, setSummary] = useState<SettlementSummary | null>(null);
  const [pending, setPending] = useState<StaffWithdrawal[]>([]);
  const [history, setHistory] = useState<StaffWithdrawal[]>([]);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [trackingCode, setTrackingCode] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [approveCode, setApproveCode] = useState<Record<string, string>>({});

  const load = useCallback(
    async (academyId: string) => {
      setLoading(true);
      try {
        const [sum, pendingRows, paidRows] = await Promise.all([
          settlementApi.getSummary(academyId),
          apiClient.getSettlementWithdrawals({
            academy_id: academyId,
            status: 'PENDING',
          }),
          apiClient.getSettlementWithdrawals({
            academy_id: academyId,
            status: 'PAID',
          }),
        ]);
        setSummary(sum);
        setPending(asList(pendingRows));
        setHistory(asList(paidRows).slice(0, 12));
        setAmount(String(Math.floor(sum.balance.available || 0)));
      } catch (error) {
        setSummary(null);
        setPending([]);
        setHistory([]);
        toast.error(apiErrorMessage(error, t('common.error')));
      } finally {
        setLoading(false);
      }
    },
    [t],
  );

  useEffect(() => {
    if (!open || !academy?.id) return;
    void load(academy.id);
    setTrackingCode('');
    setNote('');
  }, [open, academy?.id, load]);

  async function handleSettle() {
    if (!academy) return;
    const parsed = Number(amount);
    if (!trackingCode.trim()) {
      toast.error(t('academiesHealth.settle.trackingCode'));
      return;
    }
    if (!Number.isFinite(parsed) || parsed <= 0) {
      toast.error(t('academiesHealth.settle.nothingToSettle'));
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.settleAcademy(academy.id, {
        bank_transaction_code: trackingCode.trim(),
        amount: parsed,
        note: note.trim() || undefined,
      });
      toast.success(t('academiesHealth.settle.settledOk'));
      onSettled();
      await load(academy.id);
      setTrackingCode('');
      setNote('');
    } catch (err: unknown) {
      toast.error(apiErrorMessage(err, t('common.error')));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleApprove(requestId: string) {
    const code = (approveCode[requestId] ?? '').trim();
    if (!code) {
      toast.error(t('academiesHealth.settle.trackingCode'));
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.approveWithdrawal(requestId, {
        bank_transaction_code: code,
      });
      toast.success(t('academiesHealth.settle.settledOk'));
      onSettled();
      if (academy) await load(academy.id);
    } catch (err: unknown) {
      toast.error(apiErrorMessage(err, t('common.error')));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReject(requestId: string) {
    setSubmitting(true);
    try {
      await apiClient.rejectWithdrawal(requestId, {});
      toast.success(t('common.success'));
      onSettled();
      if (academy) await load(academy.id);
    } catch (err: unknown) {
      toast.error(apiErrorMessage(err, t('common.error')));
    } finally {
      setSubmitting(false);
    }
  }

  const bankOk = summary?.bank_account?.status === 'APPROVED';
  const available = summary?.balance.available ?? academy?.to_deposit ?? 0;
  const kycOk = summary ? !summary.blockers.includes('KYC_REQUIRED') : false;
  const lockedReason = !kycOk
    ? t('academiesHealth.settle.lockedNoKyc')
    : !bankOk
      ? t('academiesHealth.settle.lockedNoBank')
      : available <= 0
        ? t('academiesHealth.settle.lockedNoBalance')
        : null;
  const ticketCount = academy?.open_ticket_count ?? 0;
  const closedTicketCount = academy?.closed_ticket_count ?? 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SettlementSheetContent
        academy={academy}
        amount={amount}
        approveCode={approveCode}
        available={available}
        bankOk={bankOk}
        closedTicketCount={closedTicketCount}
        formatDate={formatDate}
        formatNumber={formatNumber}
        handleApprove={handleApprove}
        handleReject={handleReject}
        handleSettle={handleSettle}
        history={history}
        kycOk={kycOk}
        loading={loading}
        lockedReason={lockedReason}
        note={note}
        pending={pending}
        setAmount={setAmount}
        setApproveCode={setApproveCode}
        setNote={setNote}
        setTrackingCode={setTrackingCode}
        submitting={submitting}
        summary={summary}
        ticketCount={ticketCount}
        trackingCode={trackingCode}
      />
    </Sheet>
  );
}
