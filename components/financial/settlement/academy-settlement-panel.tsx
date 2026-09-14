'use client';

import { useState } from 'react';
import { ArrowUpRight, Info, ShieldCheck, Wallet } from 'lucide-react';
import { toast } from 'react-toastify';
import Link from '@/components/ui/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { SettlementHistoryTable } from '@/components/financial/settlement/settlement-history-table';
import { useSettlement } from '@/components/financial/settlement/use-settlement';
import { settlementApi, type SettlementBlocker } from '@/lib/api-settlement';
import { KYC_IDENTITY_PATH } from '@/lib/kyc-error';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { useTranslation } from '@/lib/i18n/hooks';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import { apiErrorMessage } from '@/lib/api-error-message';

interface AcademySettlementPanelProps {
  academyId: string;
}

function needsKyc(blockers: SettlementBlocker[]): boolean {
  return blockers.includes('KYC_REQUIRED') || blockers.includes('KYC_PENDING');
}

export function AcademySettlementPanel({ academyId }: AcademySettlementPanelProps) {
  const { t } = useTranslation();
  const formatCurrency = useFormatCurrency();
  const formatDate = useDateFormat();
  const { summary, history, isLoading, error, reload } = useSettlement(academyId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function requestFullBalance() {
    if (!summary) return;
    setIsSubmitting(true);
    try {
      await settlementApi.requestSettlement(academyId, {
        amount: summary.balance.available,
      });
      toast.success(t('settlement.request.submitted'));
      await reload();
    } catch (err) {
      toast.error(apiErrorMessage(err, t('common.error')));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <Skeleton className="h-36 w-full" />;
  }

  if (error || !summary) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-destructive">
          {error ?? t('common.error')}
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="space-y-4">
      <Card>
        <CardContent className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Wallet className="h-4 w-4" />
              {t('settlement.panel.heldTitle')}
            </div>
            <p className="text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
              {formatCurrency(summary.balance.available)}
            </p>
            <p className="max-w-lg text-xs leading-5 text-muted-foreground">
              {t('settlement.panel.heldHint', {
                pending: formatCurrency(summary.balance.pending),
                withdrawn: formatCurrency(summary.balance.withdrawn_total),
              })}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:items-end">
            <Button
              className="gap-2"
              onClick={requestFullBalance}
              disabled={!summary.can_request || isSubmitting}
            >
              <ArrowUpRight className="h-4 w-4" />
              {t('settlement.panel.request')}
            </Button>
            <p className="text-xs text-muted-foreground">{t('settlement.panel.oncePerDay')}</p>
            <Link
              href="/financial/academy/settlement"
              className="text-xs text-primary underline-offset-2 hover:underline"
            >
              {t('settlement.panel.details')}
            </Link>
          </div>
        </CardContent>
      </Card>

      {summary.blockers.length > 0 ? (
        <ul className="space-y-2">
          {summary.blockers.map((blocker) => (
            <li key={blocker} className="flex items-start gap-2 rounded-md bg-muted p-3 text-sm">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <span>
                {blocker === 'COOLDOWN' && summary.next_request_at
                  ? t('settlement.blockers.COOLDOWN_UNTIL', {
                      date: formatDate(summary.next_request_at),
                    })
                  : blocker === 'BELOW_MINIMUM'
                    ? t('settlement.blockers.BELOW_MINIMUM', {
                        amount: formatCurrency(summary.min_amount),
                      })
                    : t(`settlement.blockers.${blocker}`)}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {needsKyc(summary.blockers) ? (
        <Button asChild variant="outline" size="sm" className="gap-2">
          <Link href={KYC_IDENTITY_PATH}>
            <ShieldCheck className="h-4 w-4" />
            {t('settings.kyc.goToIdentity')}
          </Link>
        </Button>
      ) : null}

      <SettlementHistoryTable records={history} />
    </section>
  );
}
