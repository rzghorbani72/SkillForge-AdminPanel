import { useState } from 'react';
import {
  Copy,
  Check,
  MousePointerClick,
  ShoppingCart,
  Wallet,
  TrendingUp,
  BookOpen,
  Clock,
  CircleCheck,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/hooks';
import { ACADEMY_DOMAIN } from '@/lib/slug';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// ─── Types ────────────────────────────────────────────────────────────────────

export type Withdrawal = {
  id: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED';
  requested_at: string;
  processed_at?: string | null;
  notes?: string | null;
};

export type AffiliateLink = {
  id: string;
  code: string;
  affiliate_name: string;
  commission_rate: number;
  is_active: boolean;
  clicks: number;
  academy_id: string;
  course?: { id: string; title: string; price: number } | null;
  Academy?: { id: string; name: string; slug: string } | null;
  Usages: Array<{ commission_amount: number }>;
  Withdrawals: Withdrawal[];
  total_earned: number;
  available_balance: number;
};

// ─── Copy button ──────────────────────────────────────────────────────────────

export function CopyBtn({ text }: { text: string }) {
  const { t } = useTranslation();
  const [done, setDone] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    });
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {done ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
      {done ? t('affiliates.copied') : t('affiliates.copy')}
    </button>
  );
}

// ─── Withdrawal status badge ──────────────────────────────────────────────────

export const W_STYLE: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-blue-100 text-blue-700',
  PAID: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-700',
};

export function WBadge({ status }: { status: string }) {
  const icons: Record<string, React.ReactNode> = {
    PENDING: <Clock className="h-3 w-3" />,
    APPROVED: <CircleCheck className="h-3 w-3" />,
    PAID: <CircleCheck className="h-3 w-3" />,
    REJECTED: <XCircle className="h-3 w-3" />,
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        W_STYLE[status] ?? 'bg-muted text-muted-foreground',
      )}
    >
      {icons[status]}
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

// ─── Link card ────────────────────────────────────────────────────────────────

export function LinkCard({
  link,
  onRequestPayout,
  formatCurrency,
  t,
}: {
  link: AffiliateLink;
  onRequestPayout: (link: AffiliateLink) => void;
  formatCurrency: (n: number) => string;
  t: (k: string) => string;
}) {
  const conversions = link.Usages?.length ?? 0;
  const commPct = Math.round((link.commission_rate ?? 0) * 100);
  // Build base URL from academy info
  const academy = (link as any).Academy;
  const baseUrl = academy?.slug
    ? `https://${academy.slug}.${ACADEMY_DOMAIN}`
    : `https://${ACADEMY_DOMAIN}`;
  const refUrl = `${baseUrl}?ref=${link.code}`;

  const pendingWithdrawals = link.Withdrawals.filter(
    (w) => w.status === 'PENDING' || w.status === 'APPROVED',
  );

  return (
    <div
      className={cn('flex flex-col rounded-2xl border bg-card', !link.is_active && 'opacity-50')}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 p-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{academy?.name ?? t('affiliates.academyFallback')}</h3>
            <Badge
              variant="outline"
              className={cn(
                'text-xs',
                commPct >= 30
                  ? 'border-emerald-300 text-emerald-700'
                  : 'border-amber-300 text-amber-700',
              )}
            >
              {t('affiliates.commissionBadge')}
            </Badge>
            {!link.is_active && (
              <Badge variant="secondary" className="text-xs">
                {t('affiliates.paused')}
              </Badge>
            )}
          </div>
          {link.course ? (
            <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5" />
              {link.course.title}
            </p>
          ) : (
            <p className="mt-0.5 text-sm text-muted-foreground">
              {t('affiliates.allCoursesOption')}
            </p>
          )}
        </div>
      </div>

      {/* Referral link */}
      <div className="mx-5 mb-4 flex items-center justify-between gap-2 rounded-xl border bg-muted/40 px-3 py-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">{t('affiliates.yourReferralLink')}</p>
          <p className="truncate font-mono text-sm">{refUrl}</p>
        </div>
        <CopyBtn text={refUrl} />
      </div>

      <div className="mx-5 mb-4 flex items-center gap-2">
        <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs">{link.code}</code>
        <CopyBtn text={link.code} />
        <span className="text-xs text-muted-foreground">{t('affiliates.codeOnly')}</span>
      </div>

      {/* Stats row */}
      <div className="border-t" />
      <div className="grid grid-cols-3 divide-x p-4 text-center">
        <div>
          <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <MousePointerClick className="h-3.5 w-3.5" /> {t('affiliates.clicks')}
          </p>
          <p className="text-xl font-bold">{link.clicks}</p>
        </div>
        <div>
          <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <ShoppingCart className="h-3.5 w-3.5" /> {t('affiliates.sales')}
          </p>
          <p className="text-xl font-bold">{conversions}</p>
        </div>
        <div>
          <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5" /> {t('affiliates.conversion')}
          </p>
          <p className="text-xl font-bold">
            {link.clicks > 0 ? `${Math.round((conversions / link.clicks) * 100)}%` : '—'}
          </p>
        </div>
      </div>

      {/* Earnings */}
      <div className="border-t" />
      <div className="flex items-center justify-between px-5 py-4">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">{t('affiliates.totalEarned')}</p>
          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(link.total_earned)}</p>
        </div>
        <div className="space-y-1 text-right">
          <p className="text-xs text-muted-foreground">{t('affiliates.availableBalance')}</p>
          <p className="text-xl font-semibold">{formatCurrency(link.available_balance)}</p>
        </div>
      </div>

      {/* Payout CTA */}
      {link.available_balance > 0 && pendingWithdrawals.length === 0 && (
        <div className="px-5 pb-5">
          <Button className="w-full" onClick={() => onRequestPayout(link)}>
            <Wallet className="me-2 h-4 w-4" />
            {t('affiliates.requestPayout')} — {formatCurrency(link.available_balance)}
          </Button>
        </div>
      )}

      {pendingWithdrawals.length > 0 && (
        <div className="px-5 pb-5">
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-center text-xs text-amber-700">
            {t('affiliates.payoutPending')} (
            {formatCurrency(pendingWithdrawals.reduce((s, w) => s + w.amount, 0))})
          </p>
        </div>
      )}

      {/* Withdrawal history */}
      {link.Withdrawals.length > 0 && (
        <div className="border-t">
          <div className="p-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t('affiliates.payoutHistory')}
            </p>
            <div className="space-y-1.5">
              {link.Withdrawals.map((w) => (
                <div key={w.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <WBadge status={w.status} />
                    <span className="text-xs text-muted-foreground">
                      {new Date(w.requested_at).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="font-medium">{formatCurrency(w.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
