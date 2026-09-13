'use client';

import { useCallback, useEffect, useState } from 'react';
import { HardDrive } from 'lucide-react';
import { toast } from 'react-toastify';
import { StorageObjectsTable } from './_components/storage-objects-table';
import { StorageSummary } from './_components/storage-summary';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { useAuthUser } from '@/hooks/useAuthUser';
import { apiClient, type StorageInventory } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { isPlatformOwner } from '@/lib/roles';

export default function PlatformStoragePage() {
  const { t } = useTranslation();
  const { user, isLoading } = useAuthUser();
  const allowed = isPlatformOwner(user);
  const [inventory, setInventory] = useState<StorageInventory | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!allowed) return;
    setLoading(true);
    try {
      setInventory(await apiClient.listStorageObjects());
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, [allowed]);

  useEffect(() => {
    if (!isLoading) void load();
  }, [isLoading, load]);

  const handleDelete = async (keys: string[]) => {
    const result = await apiClient.deleteStorageObjects(keys);
    toast.success(
      t('platformStorage.deleted', { count: result.deleted.length })
    );
    if (result.refused.length > 0) {
      toast.warning(
        t('platformStorage.refused', { count: result.refused.length })
      );
    }
    await load();
  };

  if (isLoading) return <div className="flex-1 p-4 sm:p-6" />;

  if (!allowed) {
    return (
      <div className="flex-1 p-4 sm:p-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('platformStorage.title')}</CardTitle>
            <CardDescription>
              {t('platformStorage.accessDenied')}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6">
      <div>
        <div className="flex items-center gap-2">
          <HardDrive className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold">{t('platformStorage.title')}</h1>
        </div>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {t('platformStorage.description')}
        </p>
      </div>

      <StorageSummary
        inventory={inventory}
        onRefresh={load}
        loading={loading}
      />

      <StorageObjectsTable
        objects={inventory?.objects ?? []}
        loading={loading}
        onDelete={handleDelete}
      />
    </div>
  );
}
