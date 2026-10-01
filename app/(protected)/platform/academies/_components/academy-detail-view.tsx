'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n/hooks';
import { ArrowLeft, TrendingUp, Wallet, Users, BookOpen, CreditCard } from 'lucide-react';
import { getPlanDisplayName } from '@/lib/plan-display-name';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from '@/components/ui/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatPlatformToman } from '@/lib/utils';
import type { Academy } from '@/types/api';
import { AcademyCustomPlanCard } from '@/components/plans/AcademyCustomPlanCard';
import { CopyableId } from '@/components/academies/copyable-id';

export function AcademyDetailView({
  formatDate,
  formatNumber,
  isLoadingDetail,
  selectedStore,
  storeFinancial,
  storePayments,
  storeStats,
}: {
  formatDate: (value: string | Date, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  isLoadingDetail: boolean;
  selectedStore: Academy;
  storeFinancial: any;
  storePayments: any[];
  storeStats: {
    totalCourses: number;
    totalStudents: number;
    totalRevenue: number;
    totalPayments: number;
  };
}) {
  const { t, language } = useTranslation();
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      {/* Header with back button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <Button variant="ghost" size="sm" asChild className="self-start">
            <Link href="/platform/academies">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('common.back')}
            </Link>
          </Button>
          <div className="min-w-0">
            <h2 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
              {selectedStore.name}
            </h2>
            <p className="text-muted-foreground">
              {t('platform.stores.storeDetails')} - {selectedStore.slug}
            </p>
          </div>
        </div>
        <Badge
          variant={selectedStore.is_active ? 'default' : 'secondary'}
          className="self-start sm:self-auto"
        >
          {selectedStore.is_active ? t('common.active') : t('common.inactive')}
        </Badge>
      </div>
      <div>
        <Button variant="default" asChild>
          <Link href="/academies">{t('userNav.settlement')}</Link>
        </Button>
      </div>

      {/* Store Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.totalCourses')}</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(storeStats.totalCourses)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.totalStudents')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(storeStats.totalStudents)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.totalRevenue')}</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPlatformToman(storeStats.totalRevenue, {
                divideBy: 100,
                language,
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.recentPayments')}</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(storeStats.totalPayments)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('platform.stores.subscription')}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              {getPlanDisplayName(selectedStore.subscription_plan) || t('common.none')}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('platform.stores.expires')}:{' '}
              {selectedStore.subscription_expires
                ? formatDate(selectedStore.subscription_expires)
                : t('platform.stores.noExpiry')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Financial Data Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">{t('platform.stores.financialOverview')}</TabsTrigger>
          <TabsTrigger value="payments">{t('platform.stores.payments')}</TabsTrigger>
          <TabsTrigger value="details">{t('platform.stores.storeDetails')}</TabsTrigger>
          <TabsTrigger value="custom-plan">{t('platform.stores.customPlan.tab')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('platform.stores.financialOverview')}</CardTitle>
              <CardDescription>{t('platform.stores.financialOverviewDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingDetail ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                    <p className="mt-2 text-sm text-muted-foreground">{t('common.loadingData')}</p>
                  </div>
                </div>
              ) : storeFinancial ? (
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t('platform.stores.totalRevenue')}
                    </p>
                    <p className="text-2xl font-bold">
                      {formatPlatformToman(storeFinancial.total_revenue || 0, {
                        divideBy: 100,
                        language,
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t('platform.stores.totalCosts')}
                    </p>
                    <p className="text-2xl font-bold">
                      {formatPlatformToman(storeFinancial.total_costs || 0, {
                        divideBy: 100,
                        language,
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t('platform.stores.netProfit')}
                    </p>
                    <p className="text-2xl font-bold">
                      {formatPlatformToman(
                        (storeFinancial.total_revenue || 0) - (storeFinancial.total_costs || 0),
                        {
                          divideBy: 100,
                          language,
                        },
                      )}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t('platform.stores.noFinancialData')}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('platform.stores.recentPayments')}</CardTitle>
              <CardDescription>{t('platform.stores.recentPaymentsDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingDetail ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                    <p className="mt-2 text-sm text-muted-foreground">{t('common.loadingData')}</p>
                  </div>
                </div>
              ) : storePayments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('common.date')}</TableHead>
                      <TableHead>{t('dashboard.revenue')}</TableHead>
                      <TableHead>{t('common.status')}</TableHead>
                      <TableHead>{t('common.description')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {storePayments.slice(0, 10).map((payment: any) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {payment.payment_date ? formatDate(payment.payment_date) : '-'}
                        </TableCell>
                        <TableCell>
                          {formatPlatformToman(payment.amount || 0, {
                            divideBy: 100,
                            language,
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge variant={payment.status === 'COMPLETED' ? 'default' : 'secondary'}>
                            {payment.status || t('platform.stores.pending')}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {payment.description ||
                            payment.course_name ||
                            t('platform.stores.notAvailable')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">{t('platform.stores.noPayments')}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('platform.stores.storeInformation')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">{t('common.name')}</p>
                <p className="text-sm text-muted-foreground">{selectedStore.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium">{t('academiesHealth.id')}</p>
                <CopyableId value={selectedStore.id} className="mt-1" />
              </div>
              {selectedStore.uuid ? (
                <div>
                  <p className="text-sm font-medium">UUID</p>
                  <CopyableId value={selectedStore.uuid} className="mt-1" />
                </div>
              ) : null}
              <div>
                <p className="text-sm font-medium">{t('platform.stores.slug')}</p>
                <p className="text-sm text-muted-foreground">{selectedStore.slug}</p>
              </div>
              {selectedStore.description && (
                <div>
                  <p className="text-sm font-medium">{t('common.description')}</p>
                  <p className="text-sm text-muted-foreground">{selectedStore.description}</p>
                </div>
              )}
              {selectedStore.Domain && (
                <div className="space-y-2">
                  {selectedStore.Domain.public_address && (
                    <div>
                      <p className="text-sm font-medium">{t('platform.stores.publicDomain')}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedStore.Domain.public_address}
                      </p>
                    </div>
                  )}
                  {selectedStore.Domain.private_address && (
                    <div>
                      <p className="text-sm font-medium">{t('platform.stores.privateDomain')}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedStore.Domain.private_address}
                      </p>
                    </div>
                  )}
                </div>
              )}
              <div>
                <p className="text-sm font-medium">{t('common.status')}</p>
                <Badge variant={selectedStore.is_active ? 'default' : 'secondary'}>
                  {selectedStore.is_active ? t('common.active') : t('common.inactive')}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom-plan" className="space-y-4">
          <AcademyCustomPlanCard academyId={selectedStore.id} t={t} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
