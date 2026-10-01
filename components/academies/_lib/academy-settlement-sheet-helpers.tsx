import { type WithdrawalRecord } from '@/lib/api-settlement';

export type StaffWithdrawal = WithdrawalRecord & {
  Academy?: { id: string; name: string; slug: string };
};

export const statusKey = (status: string) => status.charAt(0) + status.slice(1).toLowerCase();

export function BalanceCell({
  label,
  hint,
  value,
  suffix,
  emphasize,
}: {
  label: string;
  hint: string;
  value: string;
  suffix: string;
  emphasize?: boolean;
}) {
  return (
    <div className={`rounded-md border p-2 ${emphasize ? 'border-primary/40 bg-primary/5' : ''}`}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold tabular-nums">{value}</p>
      <p className="text-[10px] text-muted-foreground">{suffix}</p>
      <p className="mt-1 text-[10px] leading-tight text-muted-foreground">{hint}</p>
    </div>
  );
}
