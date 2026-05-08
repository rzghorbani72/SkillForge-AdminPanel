'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useTranslation } from '@/lib/i18n/hooks';
import {
  Store as StoreIcon,
  Search,
  Plus,
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Users,
  BookOpen,
  CreditCard
} from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { formatCurrency, formatCurrencyWithStore } from '@/lib/utils';
import type { Academy } from '@/types/api';
import { Pagination } from '@/components/shared/Pagination';

type AcademySettlementRow = {
  academy_id: number;
  academy_uuid: string;
  academy_name: string;
  academy_slug: string;
  is_active: boolean;
  platform_commission_total: number;
  vat_total: number;
  academy_revenue_total: number;
  settled_total_amount: number;
  payable_now: number;
  latest_settlement_at?: string | null;
};

export default function PlatformStoresPage() {
  const { t, language } = useTranslation();
  const { user, isLoading: userLoading } = useAuthUser();
  const searchParams = useSearchParams();
  const academyId = searchParams.get('academyId');
  const action = searchParams.get('action');
  const [stores, setStores] = useState<Academy[]>([]);
  const [settlementRows, setSettlementRows] = useState<AcademySettlementRow[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Store detail data
  const [selectedStore, setSelectedStore] = useState<Academy | null>(null);
  const [storeFinancial, setStoreFinancial] = useState<any>(null);
  const [storePayments, setStorePayments] = useState<any[]>([]);
  const [storeStats, setStoreStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    totalPayments: 0
  });
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Fetch stores list
  useEffect(() => {
    const fetchStores = async () => {
      try {
        setIsLoading(true);
        const settlementData = await apiClient.getAcademySettlementTable({
          page: 1,
          limit: 200
        });
        const rows = settlementData?.rows || [];
        setSettlementRows(rows);
        setStores(
          rows.map((row: AcademySettlementRow) => ({
            id: row.academy_id,
            uuid: row.academy_uuid,
            name: row.academy_name,
            slug: row.academy_slug,
            is_active: row.is_active
          })) as Academy[]
        );
      } catch (error) {
        console.error('Error fetching stores:', error);
        setStores([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (!userLoading && user?.isAdminProfile) {
      fetchStores();
    }
  }, [user, userLoading]);

  // Fetch store detail and financial data when academyId is present
  useEffect(() => {
    const fetchStoreDetail = async () => {
      if (!academyId || !user?.isAdminProfile) return;

      try {
        setIsLoadingDetail(true);
        const storeIdNum = parseInt(academyId, 10);

        // Find store from list
        let store = stores.find((s) => s.id === storeIdNum);
        if (store) {
          setSelectedStore(store);
        }

        // Fetch financial data
        try {
          const detail = await apiClient.getAcademySettlementDetail(storeIdNum);
          setStoreFinancial(detail?.totals || null);
          setStorePayments(detail?.lines || []);
          const totalRevenue = detail?.totals?.academy_revenue_total || 0;

          setStoreStats({
            totalCourses: 0,
            totalStudents: 0,
            totalRevenue: totalRevenue,
            totalPayments: detail?.lines?.length || 0
          });
        } catch (error) {
          console.error('Error fetching store financial data:', error);
        }
      } catch (error) {
        console.error('Error fetching store detail:', error);
      } finally {
        setIsLoadingDetail(false);
      }
    };

    if (academyId && stores.length > 0) {
      fetchStoreDetail();
    }
  }, [academyId, stores, user]);

  // Redirect if not platform-level admin
  if (!userLoading && user && !user.isAdminProfile && !user.platformLevel) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{t('platform.overview.accessDenied')}</CardTitle>
            <CardDescription>
              {t('platform.overview.accessDeniedDescription')}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const filteredStores = stores.filter(
    (store) =>
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedStores = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredStores.slice(start, start + itemsPerPage);
  }, [filteredStores, currentPage]);

  const settlementByAcademy = useMemo(() => {
    const map = new Map<number, AcademySettlementRow>();
    settlementRows.forEach((row) => map.set(row.academy_id, row));
    return map;
  }, [settlementRows]);

  if (userLoading || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('platform.stores.loading')}
          </p>
        </div>
      </div>
    );
  }

  // Show store detail view if academyId is present
  if (academyId && selectedStore) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        {/* Header with back button */}
        <div className="flex items-center justify-between space-y-2">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/platform/stores">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('common.back')}
              </Link>
            </Button>
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                {selectedStore.name}
              </h2>
              <p className="text-muted-foreground">
                {t('platform.stores.storeDetails')} - {selectedStore.slug}
              </p>
            </div>
          </div>
          <Badge variant={selectedStore.is_active ? 'default' : 'secondary'}>
            {selectedStore.is_active
              ? t('common.active')
              : t('common.inactive')}
          </Badge>
        </div>
        <div>
          <Button
            variant="default"
            onClick={async () => {
              const bankCode = window.prompt(
                'Enter bank transaction code for settlement'
              );
              if (!bankCode) return;
              try {
                await apiClient.settleAcademy(selectedStore.id, {
                  bank_transaction_code: bankCode
                });
                const detail = await apiClient.getAcademySettlementDetail(
                  selectedStore.id
                );
                setStoreFinancial(detail?.totals || null);
                setStorePayments(detail?.lines || []);
              } catch (error) {
                console.error('Settlement failed', error);
              }
            }}
          >
            Settled
          </Button>
        </div>

        {/* Store Overview Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.totalCourses')}
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {storeStats.totalCourses}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.totalStudents')}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {storeStats.totalStudents}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.totalRevenue')}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(storeStats.totalRevenue, {
                  currency: selectedStore.currency || 'IRR',
                  currency_symbol: selectedStore.currency_symbol || 'Toman',
                  currency_position: 'after',
                  divideBy: 100,
                  language: language
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.recentPayments')}
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {storeStats.totalPayments}
              </div>
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
              <div className="text-lg font-semibold capitalize">
                {selectedStore.subscription_plan || t('common.none')}
              </div>
              <p className="text-xs text-muted-foreground">
                {t('platform.stores.expires')}:{' '}
                {selectedStore.subscription_expires
                  ? new Date(
                      selectedStore.subscription_expires
                    ).toLocaleDateString()
                  : t('platform.stores.noExpiry')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Financial Data Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">
              {t('platform.stores.financialOverview')}
            </TabsTrigger>
            <TabsTrigger value="payments">
              {t('platform.stores.payments')}
            </TabsTrigger>
            <TabsTrigger value="details">
              {t('platform.stores.storeDetails')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('platform.stores.financialOverview')}</CardTitle>
                <CardDescription>
                  {t('platform.stores.financialOverviewDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingDetail ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {t('common.loadingData')}
                      </p>
                    </div>
                  </div>
                ) : storeFinancial ? (
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t('platform.stores.totalRevenue')}
                      </p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(storeFinancial.total_revenue || 0, {
                          currency: selectedStore.currency || 'IRR',
                          currency_symbol:
                            selectedStore.currency_symbol || 'Toman',
                          currency_position: 'after',
                          divideBy: 100,
                          language: language
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t('platform.stores.totalCosts')}
                      </p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(storeFinancial.total_costs || 0, {
                          currency: selectedStore.currency || 'IRR',
                          currency_symbol:
                            selectedStore.currency_symbol || 'Toman',
                          currency_position: 'after',
                          divideBy: 100,
                          language: language
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t('platform.stores.netProfit')}
                      </p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(
                          (storeFinancial.total_revenue || 0) -
                            (storeFinancial.total_costs || 0),
                          {
                            currency: selectedStore.currency || 'IRR',
                            currency_symbol:
                              selectedStore.currency_symbol || 'Toman',
                            currency_position: 'after',
                            divideBy: 100,
                            language: language
                          }
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
                <CardDescription>
                  {t('platform.stores.recentPaymentsDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingDetail ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {t('common.loadingData')}
                      </p>
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
                            {payment.payment_date
                              ? new Date(
                                  payment.payment_date
                                ).toLocaleDateString()
                              : '-'}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(payment.amount || 0, {
                              currency: selectedStore.currency || 'IRR',
                              currency_symbol:
                                selectedStore.currency_symbol || 'Toman',
                              currency_position: 'after',
                              divideBy: 100,
                              language: language
                            })}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                payment.status === 'COMPLETED'
                                  ? 'default'
                                  : 'secondary'
                              }
                            >
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
                  <p className="text-sm text-muted-foreground">
                    {t('platform.stores.noPayments')}
                  </p>
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
                  <p className="text-sm text-muted-foreground">
                    {selectedStore.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {t('platform.stores.slug')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedStore.slug}
                  </p>
                </div>
                {selectedStore.description && (
                  <div>
                    <p className="text-sm font-medium">
                      {t('common.description')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedStore.description}
                    </p>
                  </div>
                )}
                {selectedStore.Domain && (
                  <div className="space-y-2">
                    {selectedStore.Domain.public_address && (
                      <div>
                        <p className="text-sm font-medium">
                          {t('platform.stores.publicDomain')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {selectedStore.Domain.public_address}
                        </p>
                      </div>
                    )}
                    {selectedStore.Domain.private_address && (
                      <div>
                        <p className="text-sm font-medium">
                          {t('platform.stores.privateDomain')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {selectedStore.Domain.private_address}
                        </p>
                      </div>
                    )}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">{t('common.status')}</p>
                  <Badge
                    variant={selectedStore.is_active ? 'default' : 'secondary'}
                  >
                    {selectedStore.is_active
                      ? t('common.active')
                      : t('common.inactive')}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Show stores list view
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {t('platform.stores.title')}
          </h2>
          <p className="text-muted-foreground">
            {t('platform.stores.description')}
          </p>
        </div>
        <Button asChild>
          <Link href="/platform/stores/create">
            <Plus className="mr-2 h-4 w-4" />
            {t('platform.stores.createStore')}
          </Link>
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('platform.stores.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('platform.stores.totalStores')}
            </CardTitle>
            <StoreIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stores.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('platform.stores.activeStores')}
            </CardTitle>
            <StoreIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stores.filter((s) => s.is_active).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('platform.stores.inactiveStores')}
            </CardTitle>
            <StoreIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stores.filter((s) => !s.is_active).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stores List */}
      <div className="rounded-md border">
        {filteredStores.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="py-8 text-center">
                <StoreIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-lg font-medium">
                  {t('platform.stores.noStoresFound')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {searchQuery
                    ? t('platform.stores.tryAdjustingSearch')
                    : t('platform.stores.noStoresCreated')}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>UUID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payable Now</TableHead>
                <TableHead>Platform Commission</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedStores.map((store) => (
                <TableRow key={store.id}>
                  <TableCell>{store.id}</TableCell>
                  <TableCell className="max-w-[180px] truncate">
                    {(store as any).uuid || '-'}
                  </TableCell>
                  <TableCell>{store.name}</TableCell>
                  <TableCell>{store.slug}</TableCell>
                  <TableCell>
                    <Badge variant={store.is_active ? 'default' : 'secondary'}>
                      {store.is_active
                        ? t('common.active')
                        : t('common.inactive')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {formatCurrencyWithStore(
                      settlementByAcademy.get(store.id)?.payable_now || 0,
                      store
                    )}
                  </TableCell>
                  <TableCell>
                    {formatCurrencyWithStore(
                      settlementByAcademy.get(store.id)
                        ?.platform_commission_total || 0,
                      store
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/platform/stores?academyId=${store.id}`}>
                          {t('platform.stores.viewDetails')}
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          href={`/platform/stores?academyId=${store.id}&action=edit`}
                        >
                          {t('platform.stores.edit')}
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {filteredStores.length > itemsPerPage && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredStores.length / itemsPerPage)}
          onPageChange={setCurrentPage}
          hasNextPage={
            currentPage < Math.ceil(filteredStores.length / itemsPerPage)
          }
          hasPreviousPage={currentPage > 1}
          totalItems={filteredStores.length}
          itemsPerPage={itemsPerPage}
        />
      )}
    </div>
  );
}
