'use client';

import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { SettlementBalanceCards } from '@/components/financial/settlement/settlement-balance-cards';
import { SettlementBankAccountCard } from '@/components/financial/settlement/settlement-bank-account-card';
import { SettlementChannelsTable } from '@/components/financial/settlement/settlement-channels-table';
import { SettlementHistoryTable } from '@/components/financial/settlement/settlement-history-table';
import { SettlementRequestCard } from '@/components/financial/settlement/settlement-request-card';
import { useSettlement } from '@/components/financial/settlement/use-settlement';
import {
  AcademyTeacherShareCard,
  TEACHER_SHARE_HASH,
} from '@/components/settings/academy-teacher-share-card';
import { useCurrentAcademy, useCurrentAcademyId } from '@/hooks/useCurrentAcademy';
import { useStore } from '@/hooks/useStore';
import { useTranslation } from '@/lib/i18n/hooks';

export default function SettlementPage() {
  const { t } = useTranslation();
  const academyId = useCurrentAcademyId();
  const academy = useCurrentAcademy();
  const { refreshAcademies } = useStore();
  const { summary, history, isLoading, error, reload } = useSettlement(academyId);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.location.hash !== `#${TEACHER_SHARE_HASH}`) return;
    const el = document.getElementById(TEACHER_SHARE_HASH);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [academyId, isLoading]);

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

      <AcademyTeacherShareCard
        teacherShareRate={academy?.teacher_share_rate}
        onSaved={() => void refreshAcademies()}
      />

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
