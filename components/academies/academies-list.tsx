'use client';

import { Filter, GraduationCap } from 'lucide-react';
import { DataList, DataPanel } from '@/components/shared/data-list';
import { EmptyState } from '@/components/shared/EmptyState';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { AcademyCard, AddAcademyCard } from './AcademyCard';
import type { AcademyRow } from './academy-helpers';
import type { InterpolationParams } from '@/lib/i18n';
import type { Academy } from '@/types/api';

interface AcademiesListProps {
  academies: readonly AcademyRow[];
  totalCount: number;
  isFiltered: boolean;
  isLoading: boolean;
  currentAcademyId: string | null;
  canCreate: boolean;
  switching: string | null;
  filters: React.ReactNode;
  resolveUserRole: (academy: AcademyRow) => string;
  onSwitch: (id: string) => void;
  onDetails: (academy: Academy) => void;
  onEdit: (academy: Academy) => void;
  onCreate: () => void;
  platformControls?: boolean;
  onStaffChanged?: () => void;
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
  onDetails,
  onEdit,
  onCreate,
  platformControls,
  onStaffChanged,
  t,
}: AcademiesListProps) {
  const formatNumber = useNumberFormat();

  const subtitle = `${formatNumber(academies.length)}${
    totalCount === academies.length ? '' : ` / ${formatNumber(totalCount)}`
  } ${t('stores.title')} · ${t('stores.manageStoresDescription')}`;

  return (
    <DataPanel title={t('navigation.stores')} subtitle={subtitle} filters={filters}>
      <DataList
        items={academies}
        rowKey={(academy) => academy.id}
        isLoading={isLoading}
        alwaysCards
        renderCard={(academy) => (
          <AcademyCard
            academy={academy}
            isCurrent={academy.id === currentAcademyId}
            userRole={resolveUserRole(academy)}
            onSwitch={onSwitch}
            onDetails={onDetails}
            onEdit={onEdit}
            switching={switching}
            platformControls={platformControls}
            onStaffChanged={onStaffChanged}
            t={t}
          />
        )}
        cardExtra={canCreate ? <AddAcademyCard onClick={onCreate} t={t} /> : undefined}
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
              title={isFiltered ? t('stores.noStoresFound') : t('stores.emptyTitle')}
              description={isFiltered ? t('common.tryAdjustingFilters') : t('stores.emptyDesc')}
              actionLabel={!isFiltered && canCreate ? t('auth.createAcademyBtn') : undefined}
              onAction={!isFiltered && canCreate ? onCreate : undefined}
            />
          </div>
        }
      />
    </DataPanel>
  );
}
