'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n/hooks';
import { Store as StoreIcon, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Link from '@/components/ui/link';
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
import { Pagination } from '@/components/shared/Pagination';
import { AcademyStaffActions } from '@/components/academies/academy-staff-actions';
import { CopyableId } from '@/components/academies/copyable-id';
import type { Dispatch, SetStateAction } from 'react';
import { AcademySettlementRow } from '@/app/(protected)/platform/academies/page';

export function AcademiesListView({
  canManageListing,
  currentPage,
  filteredStores,
  formatNumber,
  itemsPerPage,
  paginatedStores,
  searchQuery,
  setCurrentPage,
  setListVersion,
  setSearchQuery,
  settlementByAcademy,
  stores,
}: {
  canManageListing: boolean;
  currentPage: number;
  filteredStores: Academy[];
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  itemsPerPage: 20;
  paginatedStores: Academy[];
  searchQuery: string;
  setCurrentPage: Dispatch<SetStateAction<number>>;
  setListVersion: Dispatch<SetStateAction<number>>;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  settlementByAcademy: Map<string, AcademySettlementRow>;
  stores: Academy[];
}) {
  const { t, language } = useTranslation();
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t('platform.stores.title')}
          </h2>
          <p className="text-muted-foreground">{t('platform.stores.description')}</p>
        </div>
        <Button asChild className="w-full shrink-0 sm:w-auto">
          <Link href="/platform/academies/create">
            <Plus className="mr-2 h-4 w-4" />
            {t('platform.stores.createStore')}
          </Link>
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('platform.stores.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="ps-10"
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
            <div className="text-2xl font-bold">{formatNumber(stores.length)}</div>
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
              {formatNumber(stores.filter((s) => s.is_active).length)}
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
              {formatNumber(stores.filter((s) => !s.is_active).length)}
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
                <p className="text-lg font-medium">{t('platform.stores.noStoresFound')}</p>
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
                <TableHead>{t('academiesHealth.row')}</TableHead>
                <TableHead>{t('academiesHealth.id')}</TableHead>
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
              {paginatedStores.map((store, index) => (
                <TableRow key={store.id}>
                  <TableCell className="tabular-nums">
                    {formatNumber((currentPage - 1) * itemsPerPage + index + 1)}
                  </TableCell>
                  <TableCell>
                    <CopyableId value={store.id} className="max-w-[180px]" />
                  </TableCell>
                  <TableCell className="max-w-[180px]">
                    {store.uuid ? <CopyableId value={store.uuid} /> : '-'}
                  </TableCell>
                  <TableCell>{store.name}</TableCell>
                  <TableCell>{store.slug}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-1">
                      <Badge variant={store.is_active ? 'default' : 'secondary'}>
                        {store.is_active ? t('common.active') : t('common.inactive')}
                      </Badge>
                      {store.listed_publicly === false && (
                        <Badge variant="outline">{t('stores.hiddenFromPublic')}</Badge>
                      )}
                      {store.suspended_at && (
                        <Badge variant="destructive">{t('accountActions.suspended')}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatPlatformToman(settlementByAcademy.get(store.id)?.payable_now || 0, {
                      language,
                    })}
                  </TableCell>
                  <TableCell>
                    {formatPlatformToman(
                      settlementByAcademy.get(store.id)?.platform_commission_total || 0,
                      { language },
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/platform/academies?academyId=${store.id}`}>
                          {t('platform.stores.viewDetails')}
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/platform/academies?academyId=${store.id}&action=edit`}>
                          {t('platform.stores.edit')}
                        </Link>
                      </Button>
                      {canManageListing && (
                        <AcademyStaffActions
                          academy={store}
                          onChanged={() => setListVersion((n) => n + 1)}
                          platformControls
                        />
                      )}
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
          hasNextPage={currentPage < Math.ceil(filteredStores.length / itemsPerPage)}
          hasPreviousPage={currentPage > 1}
          totalItems={filteredStores.length}
          itemsPerPage={itemsPerPage}
        />
      )}
    </div>
  );
}
