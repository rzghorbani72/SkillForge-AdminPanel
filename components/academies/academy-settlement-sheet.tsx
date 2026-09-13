'use client';

import { CopyableValue } from '@/components/shared/copyable-value';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import { apiClient, type AcademyHealthView } from '@/lib/api';
import {
  settlementApi,
  type SettlementSummary,
  type WithdrawalRecord
} from '@/lib/api-settlement';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LocalizedDigitsInput } from '@/components/ui/localized-digits-input';
import { PriceInput } from '@/components/ui/price-input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import { apiErrorMessage } from '@/lib/api-error-message';

type Props = {
  academy: AcademyHealthView | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSettled: () => void;
};

type StaffWithdrawal = WithdrawalRecord & {
  Academy?: { id: string; name: string; slug: string };
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

const statusKey = (status: string) =>
  status.charAt(0) + status.slice(1).toLowerCase();

export function AcademySettlementSheet({
  academy,
  open,
  onOpenChange,
  onSettled
}: Props) {
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
            status: 'PENDING'
          }),
          apiClient.getSettlementWithdrawals({
            academy_id: academyId,
            status: 'PAID'
          })
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
    [t]
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
        note: note.trim() || undefined
      });
      toast.success(t('academiesHealth.settle.settledOk'));
      onSettled();
      await load(academy.id);
      setTrackingCode('');
      setNote('');
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? t('common.error'));
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
        bank_transaction_code: code
      });
      toast.success(t('academiesHealth.settle.settledOk'));
      onSettled();
      if (academy) await load(academy.id);
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? t('common.error'));
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
      toast.error((err as { message?: string })?.message ?? t('common.error'));
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
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-4 overflow-y-auto sm:max-w-lg"
      >
        <SheetHeader>
          <SheetTitle>
            {t('academiesHealth.settle.title', {
              name: academy?.name ?? ''
            })}
          </SheetTitle>
          <SheetDescription>
            {t('academiesHealth.settle.intro')}
          </SheetDescription>
        </SheetHeader>

        {loading || !academy ? (
          <p className="text-sm text-muted-foreground">
            {t('support.loading')}
          </p>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2 text-center">
              <BalanceCell
                label={t('academiesHealth.settle.wallet')}
                hint={t('academiesHealth.settle.walletHint')}
                value={formatNumber(
                  summary?.balance.balance ?? academy.wallet_balance ?? 0
                )}
                suffix={t('common.toman')}
              />
              <BalanceCell
                label={t('academiesHealth.settle.pending')}
                hint={t('academiesHealth.settle.pendingHint')}
                value={formatNumber(
                  summary?.balance.pending ??
                    academy.pending_settlement_amount ??
                    0
                )}
                suffix={t('common.toman')}
              />
              <BalanceCell
                label={t('academiesHealth.settle.toDeposit')}
                hint={t('academiesHealth.settle.toDepositHint')}
                value={formatNumber(available)}
                suffix={t('common.toman')}
                emphasize
              />
            </div>

            <section className="space-y-2 rounded-md border p-3">
              <h3 className="text-sm font-medium">
                {t('academiesHealth.settle.kycTitle')}
              </h3>
              <p
                className={`flex items-center gap-2 text-sm ${kycOk ? 'text-emerald-700 dark:text-emerald-400' : 'text-destructive'}`}
              >
                {kycOk ? (
                  <ShieldCheck className="size-4 shrink-0" />
                ) : (
                  <ShieldAlert className="size-4 shrink-0" />
                )}
                {t(
                  kycOk
                    ? 'academiesHealth.settle.kycVerified'
                    : 'academiesHealth.settle.kycMissing'
                )}
              </p>
            </section>

            <section className="space-y-2 rounded-md border p-3">
              <h3 className="text-sm font-medium">
                {t('academiesHealth.settle.bankAccount')}
              </h3>
              {bankOk && summary?.bank_account ? (
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>
                    {t('academiesHealth.settle.holder')}:{' '}
                    {summary.bank_account.account_holder_name}
                  </p>
                  <p className="flex flex-wrap items-center gap-1 text-xs">
                    {t('academiesHealth.settle.sheba')}:
                    <CopyableValue
                      value={summary.bank_account.sheba_number}
                      className="font-mono"
                    />
                  </p>
                </div>
              ) : (
                <p className="text-sm text-destructive">
                  {t('academiesHealth.settle.bankMissing')}
                </p>
              )}
            </section>

            <section className="space-y-3 rounded-md border p-3">
              <div className="space-y-1">
                <h3 className="text-sm font-medium">
                  {t('academiesHealth.settle.formTitle')}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {t('academiesHealth.settle.formHelp')}
                </p>
              </div>
              {lockedReason ? (
                <p className="rounded-md bg-amber-50 p-2 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                  {lockedReason}
                </p>
              ) : null}
              <div className="space-y-1.5">
                <Label htmlFor="settle-amount">
                  {t('academiesHealth.settle.amount')}
                </Label>
                <PriceInput
                  id="settle-amount"
                  value={amount}
                  onChange={setAmount}
                  disabled={!bankOk || available <= 0}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="settle-code">
                  {t('academiesHealth.settle.trackingCode')}
                </Label>
                <LocalizedDigitsInput
                  id="settle-code"
                  value={trackingCode}
                  onChange={setTrackingCode}
                  disabled={!bankOk || available <= 0}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="settle-note">
                  {t('academiesHealth.settle.note')}
                </Label>
                <Textarea
                  id="settle-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  disabled={!bankOk || available <= 0}
                />
              </div>
              <Button
                className="w-full"
                onClick={() => void handleSettle()}
                disabled={
                  submitting ||
                  !bankOk ||
                  available <= 0 ||
                  !trackingCode.trim()
                }
              >
                {submitting
                  ? t('academiesHealth.settle.submitting')
                  : t('academiesHealth.settle.submit')}
              </Button>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-medium">
                {t('academiesHealth.settle.pendingTitle')}
              </h3>
              {pending.length > 0 ? (
                <p className="text-xs text-muted-foreground">
                  {t('academiesHealth.settle.pendingHelp')}
                </p>
              ) : null}
              {pending.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t('academiesHealth.settle.noPending')}
                </p>
              ) : (
                pending.map((row) => (
                  <div
                    key={row.id}
                    className="space-y-2 rounded-md border p-3 text-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <CopyableValue
                        value={String(row.amount)}
                        display={`${formatNumber(row.amount)} ${t('common.toman')}`}
                        dir="rtl"
                        className="font-medium tabular-nums"
                      />
                      <Badge variant="secondary">
                        {t(`withdrawals.status${statusKey(row.status)}`)}
                      </Badge>
                    </div>
                    <LocalizedDigitsInput
                      placeholder={t('academiesHealth.settle.trackingCode')}
                      value={approveCode[row.id] ?? ''}
                      onChange={(code) =>
                        setApproveCode((prev) => ({ ...prev, [row.id]: code }))
                      }
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        disabled={submitting}
                        onClick={() => void handleApprove(row.id)}
                      >
                        {t('academiesHealth.settle.approve')}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        disabled={submitting}
                        onClick={() => void handleReject(row.id)}
                      >
                        {t('academiesHealth.settle.reject')}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-medium">
                {t('academiesHealth.settle.historyTitle')}
              </h3>
              {history.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t('academiesHealth.settle.noHistory')}
                </p>
              ) : (
                <ul className="space-y-2">
                  {history.map((row) => (
                    <li
                      key={row.id}
                      className="rounded-md border px-3 py-2 text-sm"
                    >
                      <div className="flex justify-between gap-2">
                        <span className="font-medium tabular-nums">
                          {formatNumber(row.amount)} {t('common.toman')}
                        </span>
                        <span className="text-muted-foreground">
                          {row.processed_at
                            ? formatDate(row.processed_at, { month: 'numeric' })
                            : '—'}
                        </span>
                      </div>
                      {row.bank_transaction_code ? (
                        <p
                          className="mt-1 font-mono text-xs text-muted-foreground"
                          dir="ltr"
                        >
                          {t('academiesHealth.settle.tracking')}:{' '}
                          {row.bank_transaction_code}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {(ticketCount > 0 || closedTicketCount > 0) && (
              <div className="flex flex-col gap-2">
                {ticketCount > 0 ? (
                  <Button variant="outline" asChild className="w-full">
                    <Link href={`/support?academy_id=${academy.id}`}>
                      {t('academiesHealth.settle.openTicketsLink', {
                        count: formatNumber(ticketCount)
                      })}
                    </Link>
                  </Button>
                ) : null}
                {closedTicketCount > 0 ? (
                  <p className="text-center text-xs text-muted-foreground">
                    {t('academiesHealth.settle.closedTicketsLink', {
                      count: formatNumber(closedTicketCount)
                    })}
                  </p>
                ) : null}
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function BalanceCell({
  label,
  hint,
  value,
  suffix,
  emphasize
}: {
  label: string;
  hint: string;
  value: string;
  suffix: string;
  emphasize?: boolean;
}) {
  return (
    <div
      className={`rounded-md border p-2 ${emphasize ? 'border-primary/40 bg-primary/5' : ''}`}
    >
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold tabular-nums">{value}</p>
      <p className="text-[10px] text-muted-foreground">{suffix}</p>
      <p className="mt-1 text-[10px] leading-tight text-muted-foreground">
        {hint}
      </p>
    </div>
  );
}
