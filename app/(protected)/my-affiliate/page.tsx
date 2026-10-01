'use client';

import { apiErrorMessage } from '@/lib/api-error-message';
import { useCallback, useEffect, useState } from 'react';
import { Loader2, Network } from 'lucide-react';
import { toast } from 'react-toastify';
import { apiClient } from '@/lib/api';
import { useTranslation } from '@/lib/i18n/hooks';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';

import { AffiliateLinkDialog } from './_components/affiliate-link-dialog';
import { AffiliateStats } from './_components/affiliate-stats';
import { AffiliateLink } from './_lib/page-helpers';

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
    } catch (e) {
      toast.error(apiErrorMessage(e, t('affiliates.requestPayoutFailed')));
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
        <AffiliateStats
          formatCurrency={formatCurrency}
          links={links}
          setAmount={setAmount}
          setDialogLink={setDialogLink}
          totals={totals}
        />
      )}

      {/* Payout request dialog */}
      <AffiliateLinkDialog
        amount={amount}
        dialogLink={dialogLink}
        formatCurrency={formatCurrency}
        requesting={requesting}
        setAmount={setAmount}
        setDialogLink={setDialogLink}
        submitWithdrawal={submitWithdrawal}
      />
    </div>
  );
}
