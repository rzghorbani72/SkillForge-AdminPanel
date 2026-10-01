'use client';

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useTranslation } from '@/lib/i18n/hooks';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import { useNumberFormat } from '@/lib/i18n/use-number-format';

import { useEffect, useState, useMemo } from 'react';
import { apiClient } from '@/lib/api';
import { useSearchParams } from 'next/navigation';

import type { Academy } from '@/types/api';
import { canAccessSupportOps, isPlatformAdmin } from '@/lib/roles';
import { AcademiesListView } from './_components/academies-list-view';
import { AcademyDetailView } from './_components/academy-detail-view';
import { logger } from '@/lib/logging/app-logger';
import { errorFields } from '@/lib/logging/error-fields';

export type AcademySettlementRow = {
  academy_id: string;
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

export default function PlatformAcademiesPage() {
  const { t } = useTranslation();
  const formatDate = useDateFormat();
  const formatNumber = useNumberFormat();
  const { user, isLoading: userLoading } = useAuthUser();
  const searchParams = useSearchParams();
  const academyId = searchParams.get('academyId');
  const [stores, setStores] = useState<Academy[]>([]);
  const [settlementRows, setSettlementRows] = useState<AcademySettlementRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [listVersion, setListVersion] = useState(0);
  const canManageListing = isPlatformAdmin(user);

  // Store detail data
  const [selectedStore, setSelectedStore] = useState<Academy | null>(null);
  const [storeFinancial, setStoreFinancial] = useState<any>(null);
  const [storePayments, setStorePayments] = useState<any[]>([]);
  const [storeStats, setStoreStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    totalPayments: 0,
  });
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Fetch stores list
  useEffect(() => {
    const fetchStores = async () => {
      try {
        setIsLoading(true);
        const [settlementData, academiesRes] = await Promise.all([
          apiClient.getAcademySettlementTable({
            page: 1,
            limit: 200,
          }),
          apiClient.getMyAcademies().catch(() => null),
        ]);
        const rows = settlementData?.rows || [];
        setSettlementRows(rows);
        const payload = (academiesRes as { data?: unknown } | null)?.data;
        const academyList: Academy[] = Array.isArray(payload)
          ? payload
          : Array.isArray((payload as { data?: Academy[] } | null)?.data)
            ? (payload as { data: Academy[] }).data
            : [];
        const academyById = new Map(academyList.map((academy) => [academy.id, academy]));
        setStores(
          rows.map((row: AcademySettlementRow) => {
            const listed = academyById.get(row.academy_id);
            return {
              id: row.academy_id,
              uuid: row.academy_uuid,
              name: row.academy_name,
              slug: row.academy_slug,
              is_active: row.is_active,
              listed_publicly: listed?.listed_publicly !== false,
              showcase_desktop: listed?.showcase_desktop ?? null,
              showcase_mobile: listed?.showcase_mobile ?? null,
              has_transactions: listed?.has_transactions,
              can_remove: listed?.can_remove,
              suspended_at: listed?.suspended_at,
            };
          }) as Academy[],
        );
      } catch (error) {
        logger.error('Academies', 'FetchingStoresFailed', errorFields(error));
        setStores([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (!userLoading && canAccessSupportOps(user)) {
      fetchStores();
    }
  }, [user, userLoading, listVersion]);

  // Fetch store detail and financial data when academyId is present
  useEffect(() => {
    const fetchStoreDetail = async () => {
      if (!academyId || !canAccessSupportOps(user)) return;

      try {
        setIsLoadingDetail(true);
        // Find store from list
        const store = stores.find((s) => s.id === academyId);
        if (store) {
          setSelectedStore(store);
        }

        // Fetch financial data
        try {
          const detail = await apiClient.getAcademySettlementDetail(academyId);
          setStoreFinancial(detail?.totals || null);
          setStorePayments(detail?.lines || []);
          const totalRevenue = detail?.totals?.academy_revenue_total || 0;

          setStoreStats({
            totalCourses: 0,
            totalStudents: 0,
            totalRevenue: totalRevenue,
            totalPayments: detail?.lines?.length || 0,
          });
        } catch (error) {
          logger.error('Academies', 'FetchingStoreFinancialDataFailed', errorFields(error));
        }
      } catch (error) {
        logger.error('Academies', 'FetchingStoreDetailFailed', errorFields(error));
      } finally {
        setIsLoadingDetail(false);
      }
    };

    if (academyId && stores.length > 0) {
      fetchStoreDetail();
    }
  }, [academyId, stores, user]);

  const filteredStores = stores.filter(
    (store) =>
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.slug.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const paginatedStores = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredStores.slice(start, start + itemsPerPage);
  }, [filteredStores, currentPage]);

  const settlementByAcademy = useMemo(() => {
    const map = new Map<string, AcademySettlementRow>();
    settlementRows.forEach((row) => map.set(row.academy_id, row));
    return map;
  }, [settlementRows]);

  if (!userLoading && user && !canAccessSupportOps(user)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{t('platform.overview.accessDenied')}</CardTitle>
            <CardDescription>{t('platform.overview.accessDeniedDescription')}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (userLoading || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="mt-2 text-sm text-muted-foreground">{t('platform.stores.loading')}</p>
        </div>
      </div>
    );
  }

  // Show store detail view if academyId is present
  if (academyId && selectedStore) {
    return (
      <AcademyDetailView
        formatDate={formatDate}
        formatNumber={formatNumber}
        isLoadingDetail={isLoadingDetail}
        selectedStore={selectedStore}
        storeFinancial={storeFinancial}
        storePayments={storePayments}
        storeStats={storeStats}
      />
    );
  }

  // Show stores list view
  return (
    <AcademiesListView
      canManageListing={canManageListing}
      currentPage={currentPage}
      filteredStores={filteredStores}
      formatNumber={formatNumber}
      itemsPerPage={itemsPerPage}
      paginatedStores={paginatedStores}
      searchQuery={searchQuery}
      setCurrentPage={setCurrentPage}
      setListVersion={setListVersion}
      setSearchQuery={setSearchQuery}
      settlementByAcademy={settlementByAcademy}
      stores={stores}
    />
  );
}
