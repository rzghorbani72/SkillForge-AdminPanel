'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { SettlementBalanceCards } from '@/components/financial/settlement/settlement-balance-cards';
import { SettlementBankAccountCard } from '@/components/financial/settlement/settlement-bank-account-card';
import { SettlementChannelsTable } from '@/components/financial/settlement/settlement-channels-table';
import { SettlementHistoryTable } from '@/components/financial/settlement/settlement-history-table';
import { SettlementRequestCard } from '@/components/financial/settlement/settlement-request-card';
import { useSettlement } from '@/components/financial/settlement/use-settlement';
import { useCurrentAcademyId } from '@/hooks/useCurrentAcademy';
import { useTranslation } from '@/lib/i18n/hooks';

export default function SettlementPage() {
  const { t } = useTranslation();
  const academyId = useCurrentAcademyId();
  const { summary, history, isLoading, error, reload } = useSettlement(academyId);

  if (!academyId) {
    return (
      <div className="flex flex-1 items-center justify-center p-4 sm:p-6">
        <p className="text-muted-foreground">{t('financial.store.overview.noStore')}</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 p-4 sm:p-6">
      <header className="space-y-1 border-b pb-5">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {t('settlement.eyebrow')}
        </p>
        <h1 className="text-2xl font-bold tracking-tight">{t('settlement.title')}</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">{t('settlement.description')}</p>
      </header>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : error || !summary ? (
        <Card>
          <CardContent className="p-6 text-sm text-destructive">
            {error ?? t('common.error')}
          </CardContent>
        </Card>
      ) : (
        <>
          <SettlementBalanceCards summary={summary} />
          <SettlementChannelsTable
            channels={summary.channels}
            collectedTotal={summary.totals.collected_total}
          />
          <div className="grid gap-6 xl:grid-cols-2">
            <SettlementBankAccountCard
              academyId={academyId}
              bankAccount={summary.bank_account}
              onSaved={reload}
            />
            <SettlementRequestCard academyId={academyId} summary={summary} onRequested={reload} />
          </div>
          <SettlementHistoryTable records={history} />
        </>
      )}
    </div>
  );
}
