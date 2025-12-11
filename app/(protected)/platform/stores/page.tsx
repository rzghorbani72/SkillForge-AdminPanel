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
  Store,
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

interface Store {
  id: number;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  currency?: string;
  currency_symbol?: string;
  Domain?: {
    private_address?: string;
    public_address?: string;
  };
}

export default function PlatformStoresPage() {
  const { t, language } = useTranslation();
  const { user, isLoading: userLoading } = useAuthUser();
  const searchParams = useSearchParams();
  const storeId = searchParams.get('storeId');
  const action = searchParams.get('action');
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Store detail data
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
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
        const response = await apiClient.getStoresPublic();
        const storesData = response?.data?.items || response?.data || [];
        setStores(Array.isArray(storesData) ? storesData : []);
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

  // Fetch store detail and financial data when storeId is present
  useEffect(() => {
    const fetchStoreDetail = async () => {
      if (!storeId || !user?.isAdminProfile) return;

      try {
        setIsLoadingDetail(true);
        const storeIdNum = parseInt(storeId, 10);

        // Find store from list or fetch full store details
        let store = stores.find((s) => s.id === storeIdNum);
        if (!store) {
          // If not in list, try to fetch it
          try {
            const storeResponse = await apiClient.getStoresPublic();
            const allStores =
              storeResponse?.data?.items || storeResponse?.data || [];
            store = Array.isArray(allStores)
              ? allStores.find((s: any) => s.id === storeIdNum)
              : null;
          } catch (error) {
            console.error('Error fetching store details:', error);
          }
        }
        if (store) {
          setSelectedStore(store);
        }

        // Fetch financial data
        const currentYear = new Date().getFullYear();
        const startDate = new Date(currentYear, 0, 1).toISOString();
        const endDate = new Date(currentYear, 11, 31, 23, 59, 59).toISOString();

        try {
          const [
            financialData,
            revenueData,
            coursesResponse,
            enrollmentsResponse
          ] = await Promise.all([
            apiClient
              .getStoreFinancialOverview?.(storeIdNum, startDate, endDate)
              .catch(() => null),
            apiClient
              .getStoreRevenueFromPayments?.(storeIdNum, startDate, endDate)
              .catch(() => ({ payments: [] })),
            apiClient
              .getCourses?.({ store_id: storeIdNum, limit: 1 })
              .catch(() => ({ courses: [], pagination: undefined })),
            apiClient
              .getEnrollments?.({ store_id: storeIdNum, limit: 1 })
              .catch(() => ({ enrollments: [], pagination: undefined }))
          ]);

          setStoreFinancial(financialData);
          setStorePayments(revenueData?.payments || []);

          const totalRevenue =
            revenueData?.payments?.reduce(
              (sum: number, p: any) =>
                sum + (p.status === 'COMPLETED' ? p.amount || 0 : 0),
              0
            ) || 0;

          setStoreStats({
            totalCourses:
              (coursesResponse as any)?.pagination?.total ||
              (coursesResponse as any)?.courses?.length ||
              0,
            totalStudents:
              (enrollmentsResponse as any)?.pagination?.total ||
              (enrollmentsResponse as any)?.enrollments?.length ||
              0,
            totalRevenue: totalRevenue,
            totalPayments: revenueData?.payments?.length || 0
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

    if (storeId && stores.length > 0) {
      fetchStoreDetail();
    }
  }, [storeId, stores, user]);

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

  // Show store detail view if storeId is present
  if (storeId && selectedStore) {
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
                              {payment.status || 'PENDING'}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {payment.description || payment.course_name || '-'}
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
                  <p className="text-sm font-medium">Slug</p>
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
              onChange={(e) => setSearchQuery(e.target.value)}
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
            <Store className="h-4 w-4 text-muted-foreground" />
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
            <Store className="h-4 w-4 text-muted-foreground" />
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
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stores.filter((s) => !s.is_active).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stores List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredStores.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="pt-6">
              <div className="py-8 text-center">
                <Store className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
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
          filteredStores.map((store) => (
            <Card key={store.id} className="transition-colors hover:bg-accent">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Store className="h-5 w-5" />
                      {store.name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {store.slug}
                    </CardDescription>
                  </div>
                  <Badge variant={store.is_active ? 'default' : 'secondary'}>
                    {store.is_active
                      ? t('common.active')
                      : t('common.inactive')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {store.description && (
                  <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                    {store.description}
                  </p>
                )}
                {store.Domain && (
                  <div className="space-y-1 text-sm">
                    {store.Domain.public_address && (
                      <p className="text-muted-foreground">
                        <span className="font-medium">Public:</span>{' '}
                        {store.Domain.public_address}
                      </p>
                    )}
                    {store.Domain.private_address && (
                      <p className="text-muted-foreground">
                        <span className="font-medium">Private:</span>{' '}
                        {store.Domain.private_address}
                      </p>
                    )}
                  </div>
                )}
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="flex-1"
                  >
                    <Link href={`/platform/stores?storeId=${store.id}`}>
                      {t('platform.stores.viewDetails')}
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="flex-1"
                  >
                    <Link
                      href={`/platform/stores?storeId=${store.id}&action=edit`}
                    >
                      {t('platform.stores.edit')}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
