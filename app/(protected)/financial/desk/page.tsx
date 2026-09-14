'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/shared/PageHeader';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useTranslation } from '@/lib/i18n/hooks';
import { DeskKpis } from './_components/desk-kpis';
import { DeskPaymentsTable } from './_components/desk-payments-table';
import { DeskAcademiesTable, DeskPaidTable } from './_components/desk-settlements-table';
import { useFinancialDesk } from './_hooks/use-financial-desk';

const DeskRevenueCharts = dynamic(
  () => import('./_components/desk-revenue-charts').then((mod) => mod.DeskRevenueCharts),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[320px] w-full" />,
  },
);

const STAFF = new Set(['PLATFORM_OWNER', 'ADMIN', 'FINANCE']);

export default function FinancialDeskPage() {
  const { t } = useTranslation();
  const { user } = useAuthUser();
  const { desk, payments, loading, notifyingId, loadMore, notify } = useFinancialDesk();

  if (user?.role && !STAFF.has(user.role)) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        {t('financial.desk.accessRestricted')}
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6">
      <PageHeader
        title={t('financial.desk.title')}
        description={t('financial.desk.description')}
        scope="platform"
      >
        <Button asChild variant="outline">
          <Link href="/withdrawals">{t('financial.desk.openWithdrawals')}</Link>
        </Button>
      </PageHeader>

      <DeskKpis desk={desk} loading={loading} />

      <DeskRevenueCharts trend={desk.gross_trend} loading={loading} />

      <Tabs defaultValue="payments">
        <TabsList>
          <TabsTrigger value="payments">{t('financial.desk.paymentsTab')}</TabsTrigger>
          <TabsTrigger value="settle">{t('financial.desk.settleTab')}</TabsTrigger>
          <TabsTrigger value="history">{t('financial.desk.historyTab')}</TabsTrigger>
        </TabsList>
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>{t('financial.desk.paymentsTab')}</CardTitle>
            </CardHeader>
            <CardContent>
              <DeskPaymentsTable data={payments} loading={loading} onLoadMore={loadMore} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="settle">
          <Card>
            <CardHeader>
              <CardTitle>{t('financial.desk.settleTab')}</CardTitle>
            </CardHeader>
            <CardContent>
              <DeskAcademiesTable
                academies={desk.academies}
                notifyingId={notifyingId}
                onNotify={notify}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>{t('financial.desk.historyTab')}</CardTitle>
            </CardHeader>
            <CardContent>
              <DeskPaidTable
                settlements={desk.settlements}
                notifyingId={notifyingId}
                onNotify={notify}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
