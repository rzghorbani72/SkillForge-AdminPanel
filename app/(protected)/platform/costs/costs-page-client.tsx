'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';
import {
  DataPanel,
  DataList,
  type DataColumn
} from '@/components/shared/data-list';
import { apiClient, type PlatformCostRow } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import { useAuthUser } from '@/hooks/useAuthUser';
import { isPlatformAdmin } from '@/lib/roles';
import { useMetricFormat } from '../metrics/_components/metric-format';
import { CostForm, type CostFormValues } from './cost-form';

export function CostsPageClient() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, isLoading: userLoading } = useAuthUser();
  const formatDate = useDateFormat();
  const format = useMetricFormat('TOMAN');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<PlatformCostRow[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await apiClient.getPlatformCosts());
    } catch (err) {
      ErrorHandler.handleApiError(err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userLoading) return;
    if (!isPlatformAdmin(user)) {
      router.replace('/unauthorized');
      return;
    }
    void load();
  }, [user, userLoading, router, load]);

  const save = useCallback(
    async (values: CostFormValues) => {
      setBusy(true);
      try {
        await apiClient.createPlatformCost(values);
        await load();
      } catch (err) {
        ErrorHandler.handleApiError(err);
      } finally {
        setBusy(false);
      }
    },
    [load]
  );

  const remove = useCallback(
    async (id: string) => {
      setBusy(true);
      try {
        await apiClient.deletePlatformCost(id);
        await load();
      } catch (err) {
        ErrorHandler.handleApiError(err);
      } finally {
        setBusy(false);
      }
    },
    [load]
  );

  const columns: DataColumn<PlatformCostRow>[] = [
    {
      id: 'paidAt',
      header: t('platformCosts.paidAt'),
      cell: (row) =>
        formatDate(row.paid_at, { hour: '2-digit', minute: '2-digit' })
    },
    {
      id: 'category',
      header: t('platformCosts.category'),
      cell: (row) => t(`platformCosts.categories.${row.category}`)
    },
    {
      id: 'subcategory',
      header: t('platformCosts.subcategory'),
      cell: (row) => t(`platformCosts.subcategories.${row.subcategory}`)
    },
    {
      id: 'description',
      header: t('platformCosts.description'),
      cell: (row) => row.description
    },
    {
      id: 'amount',
      header: t('platformCosts.amount'),
      align: 'end',
      cell: (row) => format('amount', row.amount)
    },
    {
      id: 'actions',
      header: '',
      align: 'end',
      cell: (row) => (
        <Button
          variant="ghost"
          size="sm"
          disabled={busy}
          onClick={() => void remove(row.id)}
        >
          {t('common.delete')}
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title={t('platformCosts.title')}
        description={t('platformCosts.subtitle')}
      />
      <DataPanel title={t('platformCosts.save')}>
        <div className="p-5">
          <CostForm busy={busy} onSubmit={save} />
        </div>
      </DataPanel>
      <DataPanel title={t('platformCosts.listTitle')}>
        <DataList
          items={rows}
          columns={columns}
          rowKey={(row) => row.id}
          isLoading={loading}
          emptyState={t('platformCosts.empty')}
        />
      </DataPanel>
    </div>
  );
}
