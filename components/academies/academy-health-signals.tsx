'use client';

import { cn } from '@/lib/utils';
import type { AcademyHealthView } from '@/lib/api';

type FormatNumber = (value: number) => string;

export function SettlementSignalCell({
  academy,
  formatNumber,
  tomanLabel,
  labels
}: {
  academy: AcademyHealthView;
  formatNumber: FormatNumber;
  tomanLabel: string;
  labels: {
    wallet: string;
    toDeposit: string;
    pending: string;
    requests: string;
    clear: string;
    bankMissing: string;
  };
}) {
  const wallet = academy.wallet_balance ?? 0;
  const toDeposit = academy.to_deposit ?? 0;
  const pendingAmount = academy.pending_settlement_amount ?? 0;
  const pendingCount = academy.pending_withdrawal_count ?? 0;
  const needsPay = toDeposit > 0 || pendingCount > 0;
  const bankOk = academy.bank_account_approved !== false;

  return (
    <div
      className={cn(
        'min-w-[11rem] space-y-1.5 rounded-md border px-2.5 py-2',
        needsPay
          ? 'border-amber-500/50 bg-amber-500/10'
          : 'border-border/60 bg-muted/30'
      )}
    >
      <MetricLine
        label={labels.toDeposit}
        value={`${formatNumber(toDeposit)} ${tomanLabel}`}
        strong={toDeposit > 0}
        tone={toDeposit > 0 ? 'warn' : 'muted'}
      />
      <MetricLine
        label={labels.wallet}
        value={`${formatNumber(wallet)} ${tomanLabel}`}
        tone="muted"
      />
      {(pendingAmount > 0 || pendingCount > 0) && (
        <MetricLine
          label={labels.pending}
          value={`${formatNumber(pendingAmount)} ${tomanLabel}${
            pendingCount > 0
              ? ` · ${formatNumber(pendingCount)} ${labels.requests}`
              : ''
          }`}
          tone="info"
        />
      )}
      {!needsPay && (
        <p className="text-[11px] text-muted-foreground">{labels.clear}</p>
      )}
      {needsPay && !bankOk && (
        <p className="text-[11px] font-medium text-destructive">
          {labels.bankMissing}
        </p>
      )}
    </div>
  );
}

export function TicketSignalCell({
  academy,
  formatNumber,
  labels
}: {
  academy: AcademyHealthView;
  formatNumber: FormatNumber;
  labels: { open: string; closed: string };
}) {
  if (
    academy.open_ticket_count == null &&
    academy.closed_ticket_count == null
  ) {
    return <span className="text-muted-foreground">—</span>;
  }

  const open = academy.open_ticket_count ?? 0;
  const closed = academy.closed_ticket_count ?? 0;

  return (
    <div
      className={cn(
        'min-w-[8.5rem] space-y-1.5 rounded-md border px-2.5 py-2',
        open > 0
          ? 'border-sky-500/40 bg-sky-500/10'
          : 'border-border/60 bg-muted/30'
      )}
    >
      <MetricLine
        label={labels.open}
        value={formatNumber(open)}
        strong={open > 0}
        tone={open > 0 ? 'info' : 'muted'}
      />
      <MetricLine
        label={labels.closed}
        value={formatNumber(closed)}
        tone="muted"
      />
    </div>
  );
}

function MetricLine({
  label,
  value,
  strong,
  tone
}: {
  label: string;
  value: string;
  strong?: boolean;
  tone: 'warn' | 'info' | 'muted';
}) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <span
        className={cn(
          'text-xs tabular-nums',
          strong && 'font-semibold',
          tone === 'warn' && 'text-amber-700 dark:text-amber-400',
          tone === 'info' && 'text-sky-700 dark:text-sky-400',
          tone === 'muted' && 'text-muted-foreground'
        )}
      >
        {value}
      </span>
    </div>
  );
}
