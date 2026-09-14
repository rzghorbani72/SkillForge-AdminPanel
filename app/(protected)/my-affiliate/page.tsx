'use client';

import { apiErrorMessage } from '@/lib/api-error-message';
import { useCallback, useEffect, useState } from 'react';
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
  Loader2,
  Network,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api';
import { useTranslation } from '@/lib/i18n/hooks';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { Button } from '@/components/ui/button';
import { NumberInput } from '@/components/ui/number-input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

// ─── Types ────────────────────────────────────────────────────────────────────

type Withdrawal = {
  id: number;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED';
  requested_at: string;
  processed_at?: string | null;
  notes?: string | null;
};

type AffiliateLink = {
  id: number;
  code: string;
  affiliate_name: string;
  commission_rate: number;
  is_active: boolean;
  clicks: number;
  academy_id: string;
  course?: { id: number; title: string; price: number } | null;
  Academy?: { id: number; name: string; slug: string } | null;
  Usages: Array<{ commission_amount: number }>;
  Withdrawals: Withdrawal[];
  total_earned: number;
  available_balance: number;
};

// ─── Copy button ──────────────────────────────────────────────────────────────

function CopyBtn({ text }: { text: string }) {
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

const W_STYLE: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-blue-100 text-blue-700',
  PAID: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-700',
};

function WBadge({ status }: { status: string }) {
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

function LinkCard({
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
    ? `https://${academy.slug}.skillforge.com`
    : 'https://skillforge.com';
  const refUrl = `${baseUrl}?ref=${link.code}`;

  const pendingWithdrawals = link.Withdrawals.filter(
    (w) => w.status === 'PENDING' || w.status === 'APPROVED',
  );

  return (
    <div
      className={cn(
        'flex flex-col rounded-2xl border bg-card shadow-sm',
        !link.is_active && 'opacity-50',
      )}
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MyAffiliatePage() {
  const { t } = useTranslation();
  const formatCurrency = useFormatCurrency();

  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogLink, setDialogLink] = useState<AffiliateLink | null>(null);
  const [amount, setAmount] = useState('');
  const [requesting, setRequesting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.getMyAffiliateLinks();
      setLinks(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(apiErrorMessage(error, t('affiliates.loadFailed')));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, []);

  async function submitWithdrawal() {
    if (!dialogLink) return;
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      toast.error(t('affiliates.enterValidAmount'));
      return;
    }
    setRequesting(true);
    try {
      await apiClient.requestAffiliateWithdrawal(dialogLink.id, amt);
      toast.success(t('affiliates.payoutRequested'));
      setDialogLink(null);
      setAmount('');
      load();
    } catch (e: any) {
      toast.error(e?.message ?? t('affiliates.requestPayoutFailed'));
    } finally {
      setRequesting(false);
    }
  }

  // Overview totals
  const totals = links.reduce(
    (acc, l) => ({
      clicks: acc.clicks + l.clicks,
      sales: acc.sales + (l.Usages?.length ?? 0),
      earned: acc.earned + l.total_earned,
      available: acc.available + l.available_balance,
    }),
    { clicks: 0, sales: 0, earned: 0, available: 0 },
  );

  return (
    <div className="flex-1 space-y-8 p-4 sm:p-6" dir={'rtl'}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('affiliates.title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('affiliates.myDashSubtitle')}</p>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : links.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Network className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold">{t('affiliates.noLinksYet')}</h2>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            {t('affiliates.noLinksDesc')}
          </p>
        </div>
      ) : (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              {
                icon: <MousePointerClick className="h-5 w-5 text-blue-600" />,
                label: t('affiliates.totalClicks'),
                value: totals.clicks,
                color: 'bg-blue-100',
              },
              {
                icon: <ShoppingCart className="h-5 w-5 text-amber-600" />,
                label: t('affiliates.totalSales'),
                value: totals.sales,
                color: 'bg-amber-100',
              },
              {
                icon: <TrendingUp className="h-5 w-5 text-violet-600" />,
                label: t('affiliates.totalEarned'),
                value: formatCurrency(totals.earned),
                color: 'bg-violet-100',
              },
              {
                icon: <Wallet className="h-5 w-5 text-emerald-600" />,
                label: t('affiliates.available'),
                value: formatCurrency(totals.available),
                color: 'bg-emerald-100',
              },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-3 rounded-xl border bg-card p-4">
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                    s.color,
                  )}
                >
                  {s.icon}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-lg font-bold">{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Link cards */}
          <div className="grid gap-6 lg:grid-cols-2">
            {links.map((l) => (
              <LinkCard
                key={l.id}
                link={l}
                onRequestPayout={(link) => {
                  setDialogLink(link);
                  setAmount(link.available_balance.toFixed(0));
                }}
                formatCurrency={formatCurrency}
                t={t}
              />
            ))}
          </div>
        </>
      )}

      {/* Payout request dialog */}
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
    </div>
  );
}
