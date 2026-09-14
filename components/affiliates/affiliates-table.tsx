'use client';

import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';
import type { Affiliate } from './types';
import { StatusBadge } from './status-badge';
import { CopyBtn } from './copy-btn';
import { RowActions } from './row-actions';

export function AffiliatesTable({
  affiliates,
  baseUrl,
  formatCurrency,
  onEdit,
  onRemove,
}: {
  affiliates: Affiliate[];
  baseUrl: string;
  formatCurrency: (n: number) => string;
  onEdit: (aff: Affiliate) => void;
  onRemove: (aff: Affiliate) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="table-h-scroll rounded-xl border bg-card">
      <table className="w-full text-base">
        <thead className="border-b bg-muted/30">
          <tr className="text-xs text-muted-foreground">
            <th className="px-4 py-3 text-start font-medium">{t('affiliates.colAffiliate')}</th>
            <th className="px-4 py-3 text-start font-medium">{t('affiliates.colLink')}</th>
            <th className="px-4 py-3 text-end font-medium">{t('affiliates.clicks')}</th>
            <th className="px-4 py-3 text-end font-medium">{t('affiliates.colSignups')}</th>
            <th className="px-4 py-3 text-end font-medium">{t('affiliates.conversions')}</th>
            <th className="px-4 py-3 text-end font-medium">{t('affiliates.earnings')}</th>
            <th className="px-4 py-3 text-end font-medium">{t('affiliates.commission')}</th>
            <th className="px-4 py-3 text-start font-medium">{t('affiliates.status')}</th>
            <th className="w-10 px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y">
          {affiliates.map((aff) => {
            const commission = aff.Usages?.reduce((s, u) => s + u.commission_amount, 0) ?? 0;
            const sales = (aff as any).sales ?? aff.Usages?.length ?? 0;
            const signups = (aff as any).signups ?? aff.Usages?.length ?? 0;
            const revenue = (aff as any).revenue ?? 0;
            const refUrl = `${baseUrl}?ref=${aff.code}`;

            return (
              <tr key={aff.id} className={cn('hover:bg-muted/20', !aff.is_active && 'opacity-60')}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {(aff.affiliate_name?.[0] ?? '?').toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold leading-tight">{aff.affiliate_name}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
                      {refUrl.replace(/^https?:\/\//, '')}
                    </code>
                    <CopyBtn text={refUrl} />
                  </div>
                </td>
                <td className="px-4 py-3 text-end font-mono">
                  {aff.clicks.toLocaleString('fa-IR')}
                </td>
                <td className="px-4 py-3 text-end font-mono">{signups.toLocaleString('fa-IR')}</td>
                <td className="px-4 py-3 text-end font-mono">{sales.toLocaleString('fa-IR')}</td>
                <td className="px-4 py-3 text-end font-mono text-sm">
                  {revenue > 0 ? (
                    formatCurrency(revenue)
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-end font-mono text-sm font-semibold text-emerald-600">
                  {commission > 0 ? (
                    formatCurrency(commission)
                  ) : (
                    <span className="font-normal text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge aff={aff} />
                </td>
                <td className="px-4 py-3">
                  <RowActions onEdit={() => onEdit(aff)} onRemove={() => onRemove(aff)} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
