'use client';

import { useMemo } from 'react';
import { Filter, GraduationCap, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataList, DataPanel } from '@/components/shared/data-list';
import { EmptyState } from '@/components/shared/EmptyState';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { AcademyCard, AddAcademyCard } from './AcademyCard';
import { buildAcademyColumns, type AcademyRow } from './academy-columns';
import type { InterpolationParams } from '@/lib/i18n';
import type { Academy } from '@/types/api';

interface AcademiesListProps {
  academies: readonly AcademyRow[];
  totalCount: number;
  isFiltered: boolean;
  isLoading: boolean;
  currentAcademyId: number | null;
  canCreate: boolean;
  switching: number | null;
  filters: React.ReactNode;
  resolveUserRole: (academy: AcademyRow) => string;
  onSwitch: (id: number) => void;
  onEdit: (academy: Academy) => void;
  onManageSite: (academy: Academy) => void;
  onCreate: () => void;
  t: (key: string, params?: InterpolationParams) => string;
}

export function AcademiesList({
  academies,
  totalCount,
  isFiltered,
  isLoading,
  currentAcademyId,
  canCreate,
  switching,
  filters,
  resolveUserRole,
  onSwitch,
  onEdit,
  onManageSite,
  onCreate,
  t
}: AcademiesListProps) {
  const formatNumber = useNumberFormat();

  const columns = useMemo(
    () =>
      buildAcademyColumns({
        t,
        formatNumber,
        currentAcademyId,
        resolveUserRole,
        switching,
        onSwitch,
        onEdit,
        onManageSite
      }),
    [
      t,
      formatNumber,
      currentAcademyId,
      resolveUserRole,
      switching,
      onSwitch,
      onEdit,
      onManageSite
    ]
  );

  const subtitle = `${formatNumber(academies.length)}${
    totalCount === academies.length ? '' : ` / ${formatNumber(totalCount)}`
  } ${t('stores.title')} · ${t('stores.manageStoresDescription')}`;

  return (
    <DataPanel
      title={t('navigation.stores')}
      subtitle={subtitle}
      filters={filters}
      actions={
        canCreate ? (
          <Button size="sm" className="rounded-lg" onClick={onCreate}>
            <Plus className="me-1.5 h-4 w-4" />
            {t('stores.addAcademy')}
          </Button>
        ) : null
      }
    >
      <DataList
        items={academies}
        columns={columns}
        rowKey={(academy) => academy.id}
        isLoading={isLoading}
        renderCard={(academy) => (
          <AcademyCard
            academy={academy}
            isCurrent={academy.id === currentAcademyId}
            userRole={resolveUserRole(academy)}
            onSwitch={onSwitch}
            onEdit={onEdit}
            onManageSite={onManageSite}
            switching={switching}
            t={t}
          />
        )}
        cardExtra={
          canCreate ? <AddAcademyCard onClick={onCreate} t={t} /> : undefined
        }
        emptyState={
          <div className="py-12">
            <EmptyState
              icon={
                isFiltered ? (
                  <Filter className="h-10 w-10" />
                ) : (
                  <GraduationCap className="h-10 w-10" />
                )
              }
              title={
                isFiltered ? t('stores.noStoresFound') : t('stores.emptyTitle')
              }
              description={
                isFiltered
                  ? t('common.tryAdjustingFilters')
                  : t('stores.emptyDesc')
              }
            />
          </div>
        }
      />
    </DataPanel>
  );
}
