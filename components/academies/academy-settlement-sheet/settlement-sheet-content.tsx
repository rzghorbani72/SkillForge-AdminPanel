'use client';

import { CopyableValue } from '@/components/shared/copyable-value';
import Link from 'next/link';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { type AcademyHealthView } from '@/lib/api';
import { type SettlementSummary } from '@/lib/api-settlement';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LocalizedDigitsInput } from '@/components/ui/localized-digits-input';
import { PriceInput } from '@/components/ui/price-input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useTranslation } from '@/lib/i18n/hooks';
import type { Dispatch, SetStateAction } from 'react';
import { StaffWithdrawal, statusKey, BalanceCell } from '../_lib/academy-settlement-sheet-helpers';

export function SettlementSheetContent({
  academy,
  amount,
  approveCode,
  available,
  bankOk,
  closedTicketCount,
  formatDate,
  formatNumber,
  handleApprove,
  handleReject,
  handleSettle,
  history,
  kycOk,
  loading,
  lockedReason,
  note,
  pending,
  setAmount,
  setApproveCode,
  setNote,
  setTrackingCode,
  submitting,
  summary,
  ticketCount,
  trackingCode,
}: {
  academy: AcademyHealthView | null;
  amount: string;
  approveCode: Record<string, string>;
  available: number;
  bankOk: boolean;
  closedTicketCount: number;
  formatDate: (value: string | Date, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  handleApprove: (requestId: string) => Promise<void>;
  handleReject: (requestId: string) => Promise<void>;
  handleSettle: () => Promise<void>;
  history: StaffWithdrawal[];
  kycOk: boolean;
  loading: boolean;
  lockedReason: string | null;
  note: string;
  pending: StaffWithdrawal[];
  setAmount: Dispatch<SetStateAction<string>>;
  setApproveCode: Dispatch<SetStateAction<Record<string, string>>>;
  setNote: Dispatch<SetStateAction<string>>;
  setTrackingCode: Dispatch<SetStateAction<string>>;
  submitting: boolean;
  summary: SettlementSummary | null;
  ticketCount: number;
  trackingCode: string;
}) {
  const { t } = useTranslation();
  return (
    <SheetContent side="right" className="flex w-full flex-col gap-4 overflow-y-auto sm:max-w-lg">
      <SheetHeader>
        <SheetTitle>
          {t('academiesHealth.settle.title', {
            name: academy?.name ?? '',
          })}
        </SheetTitle>
        <SheetDescription>{t('academiesHealth.settle.intro')}</SheetDescription>
      </SheetHeader>

      {loading || !academy ? (
        <p className="text-sm text-muted-foreground">{t('support.loading')}</p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2 text-center">
            <BalanceCell
              label={t('academiesHealth.settle.wallet')}
              hint={t('academiesHealth.settle.walletHint')}
              value={formatNumber(summary?.balance.balance ?? academy.wallet_balance ?? 0)}
              suffix={t('common.toman')}
            />
            <BalanceCell
              label={t('academiesHealth.settle.pending')}
              hint={t('academiesHealth.settle.pendingHint')}
              value={formatNumber(
                summary?.balance.pending ?? academy.pending_settlement_amount ?? 0,
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
            <h3 className="text-sm font-medium">{t('academiesHealth.settle.kycTitle')}</h3>
            <p
              className={`flex items-center gap-2 text-sm ${kycOk ? 'text-emerald-700 dark:text-emerald-400' : 'text-destructive'}`}
            >
              {kycOk ? (
                <ShieldCheck className="size-4 shrink-0" />
              ) : (
                <ShieldAlert className="size-4 shrink-0" />
              )}
              {t(
                kycOk ? 'academiesHealth.settle.kycVerified' : 'academiesHealth.settle.kycMissing',
              )}
            </p>
          </section>

          <section className="space-y-2 rounded-md border p-3">
            <h3 className="text-sm font-medium">{t('academiesHealth.settle.bankAccount')}</h3>
            {bankOk && summary?.bank_account ? (
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>
                  {t('academiesHealth.settle.holder')}: {summary.bank_account.account_holder_name}
                </p>
                <p className="flex flex-wrap items-center gap-1 text-xs">
                  {t('academiesHealth.settle.sheba')}:
                  <CopyableValue value={summary.bank_account.sheba_number} className="font-mono" />
                </p>
              </div>
            ) : (
              <p className="text-sm text-destructive">{t('academiesHealth.settle.bankMissing')}</p>
            )}
          </section>

          <section className="space-y-3 rounded-md border p-3">
            <div className="space-y-1">
              <h3 className="text-sm font-medium">{t('academiesHealth.settle.formTitle')}</h3>
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
              <Label htmlFor="settle-amount">{t('academiesHealth.settle.amount')}</Label>
              <PriceInput
                id="settle-amount"
                value={amount}
                onChange={setAmount}
                disabled={!bankOk || available <= 0}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="settle-code">{t('academiesHealth.settle.trackingCode')}</Label>
              <LocalizedDigitsInput
                id="settle-code"
                value={trackingCode}
                onChange={setTrackingCode}
                disabled={!bankOk || available <= 0}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="settle-note">{t('academiesHealth.settle.note')}</Label>
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
              disabled={submitting || !bankOk || available <= 0 || !trackingCode.trim()}
            >
              {submitting
                ? t('academiesHealth.settle.submitting')
                : t('academiesHealth.settle.submit')}
            </Button>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-medium">{t('academiesHealth.settle.pendingTitle')}</h3>
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
                <div key={row.id} className="space-y-2 rounded-md border p-3 text-sm">
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
                    onChange={(code) => setApproveCode((prev) => ({ ...prev, [row.id]: code }))}
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
            <h3 className="text-sm font-medium">{t('academiesHealth.settle.historyTitle')}</h3>
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t('academiesHealth.settle.noHistory')}
              </p>
            ) : (
              <ul className="space-y-2">
                {history.map((row) => (
                  <li key={row.id} className="rounded-md border px-3 py-2 text-sm">
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
                      <p className="mt-1 font-mono text-xs text-muted-foreground" dir="ltr">
                        {t('academiesHealth.settle.tracking')}: {row.bank_transaction_code}
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
                      count: formatNumber(ticketCount),
                    })}
                  </Link>
                </Button>
              ) : null}
              {closedTicketCount > 0 ? (
                <p className="text-center text-xs text-muted-foreground">
                  {t('academiesHealth.settle.closedTicketsLink', {
                    count: formatNumber(closedTicketCount),
                  })}
                </p>
              ) : null}
            </div>
          )}
        </>
      )}
    </SheetContent>
  );
}
