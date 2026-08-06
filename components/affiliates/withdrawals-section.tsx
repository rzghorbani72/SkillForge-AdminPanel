'use client';

import { useCallback, useEffect, useState } from 'react';
import { ArrowDownToLine, Clock, CircleCheck, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api';
import { useTranslation } from '@/lib/i18n/hooks';
import { getLocaleForLanguage } from '@/lib/i18n/config';

const W_STYLE: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-blue-100 text-blue-700',
  PAID: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-700'
};

const W_STATUS_LABEL_KEYS: Record<string, string> = {
  PENDING: 'affiliates.statusPending',
  APPROVED: 'affiliates.statusApproved',
  PAID: 'affiliates.statusPaid',
  REJECTED: 'affiliates.statusRejected'
};

function WBadge({ status, t }: { status: string; t: (key: string) => string }) {
  const icons: Record<string, React.ReactNode> = {
    PENDING: <Clock className="h-3 w-3" />,
    APPROVED: <CircleCheck className="h-3 w-3" />,
    PAID: <CircleCheck className="h-3 w-3" />,
    REJECTED: <XCircle className="h-3 w-3" />
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        W_STYLE[status] ?? 'bg-muted text-muted-foreground'
      )}
    >
      {icons[status]}
      {t(W_STATUS_LABEL_KEYS[status] ?? 'affiliates.statusPending')}
    </span>
  );
}

export function WithdrawalsSection({
  formatCurrency
}: {
  formatCurrency: (n: number) => string;
}) {
  const { t, language } = useTranslation();
  const locale = getLocaleForLanguage(language);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.getAffiliateWithdrawals();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      /* non-fatal */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function act(id: number, status: string) {
    setProcessing(id);
    try {
      await apiClient.processAffiliateWithdrawal(id, status);
      toast.success(
        t('toasts.withdrawalMarked', {
          status: t(W_STATUS_LABEL_KEYS[status] ?? status)
        })
      );
      load();
    } catch (e: any) {
      toast.error(e?.message ?? t('common.error'));
    } finally {
      setProcessing(null);
    }
  }

  if (loading || items.length === 0) return null;
  const pending = items.filter((w) => w.status === 'PENDING');

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <ArrowDownToLine className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold">
          {t('affiliates.withdrawalsTitle')}
        </h2>
        {pending.length > 0 && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
            {t('affiliates.withdrawalsPending', { count: pending.length })}
          </span>
        )}
      </div>
      <div className="overflow-hidden rounded-xl border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/30">
            <tr className="text-xs text-muted-foreground">
              <th className="px-4 py-3 text-start font-medium">
                {t('affiliates.colAffiliate')}
              </th>
              <th className="px-4 py-3 text-start font-medium">
                {t('affiliates.colAmount')}
              </th>
              <th className="px-4 py-3 text-start font-medium">
                {t('affiliates.colRequestDate')}
              </th>
              <th className="px-4 py-3 text-start font-medium">
                {t('affiliates.status')}
              </th>
              <th className="px-4 py-3 text-end font-medium">
                {t('common.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map((w) => (
              <tr key={w.id} className="hover:bg-muted/20">
                <td className="px-4 py-3">
                  <p className="font-medium">
                    {w.AffiliateLink?.affiliate_name}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {w.AffiliateLink?.code}
                  </p>
                </td>
                <td className="px-4 py-3 font-semibold">
                  {formatCurrency(w.amount)}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {new Date(w.requested_at).toLocaleDateString(locale)}
                </td>
                <td className="px-4 py-3">
                  <WBadge status={w.status} t={t} />
                </td>
                <td className="px-4 py-3">
                  {w.status === 'PENDING' && (
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        disabled={processing === w.id}
                        onClick={() => act(w.id, 'APPROVED')}
                        className="rounded-md px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50"
                      >
                        {t('affiliates.actionApprove')}
                      </button>
                      <button
                        type="button"
                        disabled={processing === w.id}
                        onClick={() => act(w.id, 'REJECTED')}
                        className="rounded-md px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                      >
                        {t('affiliates.actionReject')}
                      </button>
                    </div>
                  )}
                  {w.status === 'APPROVED' && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        disabled={processing === w.id}
                        onClick={() => act(w.id, 'PAID')}
                        className="rounded-md px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
                      >
                        {t('affiliates.actionMarkPaid')}
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
