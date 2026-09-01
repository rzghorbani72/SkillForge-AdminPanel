'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, HardDrive, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StorageTypeCards } from '@/components/storage/storage-type-cards';
import { StorageFilesPanel } from '@/components/storage/storage-files-panel';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatFileSize } from '@/components/shared/utils';
import {
  apiClient,
  type AcademyStorageUsage,
  type StorageFilesPage,
  type StorageMediaType
} from '@/lib/api';
import { useApiQuery } from '@/hooks/use-api-query';
import { useCurrentAcademyId } from '@/hooks/useCurrentAcademy';
import { queryKeys } from '@/lib/query/keys';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { usePercentLabel } from '@/lib/i18n/use-percent-label';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 20;

export default function StoragePage() {
  const { t } = useTranslation();
  const academyId = useCurrentAcademyId();
  const formatNumber = useNumberFormat();
  const percentLabel = usePercentLabel();
  const [kind, setKind] = useState<StorageMediaType | 'all'>('all');
  const [page, setPage] = useState(1);

  const { data, isLoading, refresh } = useApiQuery<AcademyStorageUsage>({
    queryKey: queryKeys.storageUsage(academyId),
    queryFn: (signal) => apiClient.getCurrentAcademyStorageUsage({ signal })
  });

  const {
    data: files,
    isLoading: isFilesLoading,
    refresh: refreshFiles
  } = useApiQuery<StorageFilesPage>({
    queryKey: queryKeys.storageFiles(academyId, kind, page),
    queryFn: (signal) =>
      apiClient.getStorageFiles(
        {
          kind: kind === 'all' ? undefined : kind,
          page,
          limit: PAGE_SIZE
        },
        { signal }
      )
  });

  // A delete changes both the quota bar and the list, so refresh the pair.
  const handleDeleted = () => {
    void refresh();
    void refreshFiles();
  };

  const handleKindChange = (next: StorageMediaType | 'all') => {
    setKind(next);
    setPage(1);
  };

  const emptySize = `${formatNumber(0)} ${t('media.unitMb')}`;
  const sizeLabel = (bytes?: number) => formatFileSize(bytes) || emptySize;

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6">
      <PageHeader
        icon={<HardDrive className="h-5 w-5" />}
        title={t('storage.title')}
        description={t('storage.description')}
      />

      {isLoading || !data ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <Card>
            <CardContent className="space-y-5 p-6">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {t('storage.totalUsed')}
                  </p>
                  <p className="text-3xl font-bold tracking-tight">
                    {sizeLabel(data.total_bytes)}
                    <span className="ms-2 text-base font-normal text-muted-foreground">
                      / {sizeLabel(data.limit_bytes)}
                    </span>
                  </p>
                </div>
                <div className="space-y-1 text-end">
                  <p className="text-sm font-medium text-muted-foreground">
                    {t('storage.remaining')}
                  </p>
                  <p className="text-2xl font-bold tracking-tight">
                    {sizeLabel(data.remaining_bytes)}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <Progress
                  value={data.percent_used}
                  className={cn(
                    'h-2',
                    data.warn_level === 'full' && '[&>div]:bg-destructive',
                    data.warn_level === 'warning' && '[&>div]:bg-amber-500'
                  )}
                />
                <p className="text-xs text-muted-foreground">
                  {t('storage.percentOfPlanUsed', {
                    percent: percentLabel(data.percent_used)
                  })}
                </p>
              </div>

              {data.warn_level !== 'ok' && (
                <div
                  className={cn(
                    'flex flex-col gap-2 rounded-xl px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between',
                    data.warn_level === 'full'
                      ? 'bg-destructive/10 text-destructive'
                      : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                  )}
                >
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    {t(
                      data.warn_level === 'full'
                        ? 'storage.fullWarning'
                        : 'storage.nearFullWarning'
                    )}
                  </span>
                  <Button
                    asChild
                    size="sm"
                    variant={
                      data.warn_level === 'full' ? 'destructive' : 'outline'
                    }
                  >
                    <Link href="/plans">{t('storage.addStorage')}</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-3">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">
                {t('storage.breakdownTitle')}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t('storage.breakdownDescription')}
              </p>
            </div>
            <StorageTypeCards
              items={data.by_type}
              totalBytes={data.total_bytes}
            />
          </div>

          <StorageFilesPanel
            rows={files?.rows ?? []}
            total={files?.total ?? 0}
            page={page}
            limit={PAGE_SIZE}
            isLoading={isFilesLoading}
            kind={kind}
            onKindChange={handleKindChange}
            onPageChange={setPage}
            onDeleted={handleDeleted}
          />
        </>
      )}
    </div>
  );
}
