'use client';

import { useRouter } from 'next/navigation';
import { Wallet } from 'lucide-react';
import { DataList, DataPanel } from '@/components/shared/data-list';
import { EmptyState } from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { getPlanDisplayName } from '@/lib/plan-display-name';
import {
  getSubscriptionStatusDisplay,
  SUBSCRIPTION_TONE_CLASSES,
  type SubscriptionStatusValue,
} from '@/lib/subscription-status';
import { cn } from '@/lib/utils';
import { apiClient, type AcademySubscriptionOverviewRow } from '@/lib/api';
import { setSelectedAcademyId } from '@/lib/store-utils';
import { useAuthUser } from '@/hooks/useAuthUser';
import { isPlatformStaff } from '@/lib/roles';

interface BillingOverviewTableProps {
  rows: readonly AcademySubscriptionOverviewRow[];
  isLoading: boolean;
}

export function BillingOverviewTable({ rows, isLoading }: BillingOverviewTableProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const formatNumber = useNumberFormat();
  const { user } = useAuthUser();
  const platformStaff = isPlatformStaff(user);

  async function openAcademyPlan(academyId: string) {
    // Each academy has its own plan page. Platform staff scope via header;
    // academy managers re-issue the JWT onto that academy's seat.
    if (platformStaff) {
      setSelectedAcademyId(academyId);
    } else {
      await apiClient.switchAcademy(academyId);
      setSelectedAcademyId(academyId);
    }
    window.location.assign('/plans');
  }

  function planLabel(row: AcademySubscriptionOverviewRow) {
    if (row.custom_plan_name) return row.custom_plan_name;
    return row.plan_slug ? getPlanDisplayName(row.plan_slug) : '—';
  }

  function statusBadge(row: AcademySubscriptionOverviewRow) {
    const display = getSubscriptionStatusDisplay(
      row.status as SubscriptionStatusValue,
      row.is_trial,
    );
    return (
      <Badge variant="outline" className={cn('text-xs', SUBSCRIPTION_TONE_CLASSES[display.tone])}>
        {t(display.labelKey)}
      </Badge>
    );
  }

  return (
    <DataPanel title={t('billing.overviewTitle')} subtitle={t('billing.overviewSubtitle')}>
      <DataList
        items={rows}
        rowKey={(row) => row.academy_id}
        isLoading={isLoading}
        onRowClick={(row) => router.push(`/academies?focus=${row.academy_id}`)}
        columns={[
          {
            id: 'name',
            header: t('billing.academyColumn'),
            cell: (row) => <span className="font-semibold">{row.name}</span>,
          },
          {
            id: 'plan',
            header: t('billing.planColumn'),
            cell: (row) => planLabel(row),
          },
          {
            id: 'status',
            header: t('billing.statusColumn'),
            cell: (row) => statusBadge(row),
          },
          {
            id: 'days',
            header: t('billing.daysRemainingColumn'),
            align: 'center',
            cell: (row) => (row.days_remaining === null ? '—' : formatNumber(row.days_remaining)),
          },
          {
            id: 'storage',
            header: t('billing.storageColumn'),
            align: 'center',
            cell: (row) =>
              `${formatNumber(row.storage_usage_gb)} / ${formatNumber(row.included_storage_gb)} GB`,
          },
          {
            id: 'action',
            header: '',
            align: 'end',
            cell: (row) => (
              <Button
                size="sm"
                variant="outline"
                onClick={(event) => {
                  event.stopPropagation();
                  void openAcademyPlan(row.academy_id);
                }}
              >
                {t('billing.managePlan')}
              </Button>
            ),
          },
        ]}
        emptyState={
          <div className="py-12">
            <EmptyState
              icon={<Wallet className="h-10 w-10" />}
              title={t('billing.emptyTitle')}
              description={t('billing.emptyDesc')}
            />
          </div>
        }
      />
    </DataPanel>
  );
}
