'use client';

import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatFileSize } from '@/components/shared/utils';
import type { StorageInventory } from '@/lib/api';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';

interface StorageSummaryProps {
  inventory: StorageInventory | null;
  loading: boolean;
  onRefresh: () => void;
}

export function StorageSummary({
  inventory,
  loading,
  onRefresh
}: StorageSummaryProps) {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const objects = inventory?.objects ?? [];
  const unusedCount = objects.filter((o) => !o.used).length;

  const tiles = [
    {
      label: t('platformStorage.totalObjects'),
      value: formatNumber(objects.length)
    },
    {
      label: t('platformStorage.totalSize'),
      value: formatFileSize(inventory?.total_bytes) || '—'
    },
    {
      label: t('platformStorage.unusedObjects'),
      value: formatNumber(unusedCount)
    },
    {
      label: t('platformStorage.unusedSize'),
      value: formatFileSize(inventory?.unused_bytes) || '—'
    }
  ];

  return (
    <div className="flex flex-wrap items-stretch gap-4">
      {tiles.map((tile) => (
        <Card key={tile.label} className="min-w-[160px] flex-1">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">{tile.label}</p>
            <p className="mt-1 text-xl font-semibold">{tile.value}</p>
          </CardContent>
        </Card>
      ))}
      <Button
        variant="outline"
        onClick={onRefresh}
        disabled={loading}
        className="self-center"
      >
        <RefreshCw className={loading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
        {t('common.refresh')}
      </Button>
    </div>
  );
}
