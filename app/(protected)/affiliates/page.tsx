'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, Network, Eye } from 'lucide-react';
import { toast } from 'react-toastify';
import { apiClient } from '@/lib/api';
import { useCurrentAcademyId, useCurrentAcademy } from '@/hooks/useCurrentAcademy';
import { useTranslation, useLanguage } from '@/lib/i18n/hooks';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { Button } from '@/components/ui/button';
import type { Affiliate } from '@/components/affiliates/types';
import { StatCard } from '@/components/affiliates/stat-card';
import { AffiliatesTable } from '@/components/affiliates/affiliates-table';
import { WithdrawalsSection } from '@/components/affiliates/withdrawals-section';
import { AffiliateLoginPreview } from '@/components/affiliates/login-preview';
import { AffiliateDialog } from '@/components/affiliates/affiliate-dialog';
import { academySiteUrl } from '@/lib/academy-site-url';
import { resolveStorefrontBaseUrl } from '@/lib/ui-template/preview-url';
import { apiErrorMessage } from '@/lib/api-error-message';

export default function AffiliatesPage() {
  const { t } = useTranslation();
  useLanguage();
  const formatCurrency = useFormatCurrency();
  const academyId = useCurrentAcademyId();
  const academy = useCurrentAcademy();

  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    editData?: Affiliate;
  }>({ open: false });
  const [showPreview, setShowPreview] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.getAffiliates();
      setAffiliates(data);
    } catch (error) {
      toast.error(apiErrorMessage(error, t('affiliates.loadError')));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const activeCount = affiliates.filter((a) => a.is_active).length;
  const totalClicks = affiliates.reduce((s, a) => s + (a.clicks ?? 0), 0);
  const totalSales = affiliates.reduce(
    (s, a) => s + ((a as any).sales ?? a.Usages?.length ?? 0),
    0,
  );
  const totalCommission = affiliates.reduce(
    (s, a) => s + (a.Usages?.reduce((x, u) => x + u.commission_amount, 0) ?? 0),
    0,
  );

  async function removeAffiliate(aff: Affiliate) {
    if (!confirm(t('affiliates.deleteConfirm', { name: aff.affiliate_name }))) return;
    try {
      await apiClient.deleteAffiliate(aff.id);
      toast.success(t('affiliates.deleteSuccess'));
      load();
    } catch (e) {
      toast.error(apiErrorMessage(e, t('common.error')));
    }
  }

  const baseUrl = academySiteUrl(academy) ?? resolveStorefrontBaseUrl() ?? '';

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6" dir="rtl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t('affiliates.sectionLabel')}
          </p>
          <h1 className="text-2xl font-bold tracking-tight">{t('affiliates.programTitle')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('affiliates.pageSubtitle')}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" onClick={() => setShowPreview(true)}>
            <Eye className="me-2 h-4 w-4" />
            {t('affiliates.previewBtn')}
          </Button>
          {academyId && (
            <Button onClick={() => setDialogState({ open: true })}>
              <Plus className="me-2 h-4 w-4" />
              {t('affiliates.newAffiliate')}
            </Button>
          )}
        </div>
      </div>

      {!academyId && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {t('affiliates.selectAcademy')}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label={t('affiliates.statActiveAffiliates')}
          value={activeCount.toLocaleString('fa-IR')}
          delta={18}
        />
        <StatCard
          label={t('affiliates.statTotalClicks')}
          value={totalClicks.toLocaleString('fa-IR')}
          delta={24}
        />
        <StatCard
          label={t('affiliates.statMonthlySales')}
          value={totalSales.toLocaleString('fa-IR')}
          delta={32}
        />
        <StatCard
          label={t('affiliates.statCommissionPaid')}
          value={formatCurrency(totalCommission)}
          delta={12}
        />
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl border bg-muted" />
          ))}
        </div>
      ) : affiliates.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Network className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold">{t('affiliates.noAffiliates')}</h2>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            {t('affiliates.noAffiliatesDesc')}
          </p>
          {academyId && (
            <Button className="mt-6" onClick={() => setDialogState({ open: true })}>
              <Plus className="me-2 h-4 w-4" />
              {t('affiliates.newAffiliate')}
            </Button>
          )}
        </div>
      ) : (
        <AffiliatesTable
          affiliates={affiliates}
          baseUrl={baseUrl}
          formatCurrency={formatCurrency}
          onEdit={(aff) => setDialogState({ open: true, editData: aff })}
          onRemove={removeAffiliate}
        />
      )}

      {academyId && <WithdrawalsSection formatCurrency={formatCurrency} />}

      <AffiliateDialog
        open={dialogState.open}
        onClose={() => setDialogState({ open: false })}
        onDone={load}
        baseUrl={baseUrl}
        editData={dialogState.editData}
      />

      {showPreview && (
        <AffiliateLoginPreview
          onClose={() => setShowPreview(false)}
          baseUrl={baseUrl}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
}
