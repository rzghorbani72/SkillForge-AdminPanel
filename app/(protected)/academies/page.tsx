'use client';

import { useState } from 'react';
import { Filter, GraduationCap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/hooks/useStore';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useTranslation } from '@/lib/i18n/hooks';
import { apiClient } from '@/lib/api';
import { clearAcademyData } from '@/lib/store-utils';
import { toast } from 'react-toastify';
import { AcademyCard, AddAcademyCard } from '@/components/stores/AcademyCard';
import { AcademyCreateModal } from '@/components/stores/AcademyCreateModal';
import { AcademyEditModal } from '@/components/stores/AcademyEditModal';
import type { Academy } from '@/types/api';

export default function AcademiesPage() {
  const { t } = useTranslation();
  const { academies, isLoading, refreshAcademies } = useStore();
  const { user } = useAuthUser();
  const [switching, setSwitching] = useState<number | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editAcademy, setEditAcademy] = useState<Academy | null>(null);

  const currentAcademyId =
    user?.academyId ?? (user as any)?.profile?.academy_id ?? null;
  const canCreate =
    user?.role === 'ADMIN' ||
    (user as any)?.isAdminProfile ||
    user?.role === 'MANAGER';

  async function handleSwitch(academyId: number) {
    if (academyId === currentAcademyId) {
      window.location.assign('/dashboard');
      return;
    }
    setSwitching(academyId);
    try {
      await apiClient.switchAcademy(academyId);
      clearAcademyData();
      window.location.reload();
    } catch (e: unknown) {
      toast.error((e as { message?: string })?.message ?? t('common.error'));
      setSwitching(null);
    }
  }

  async function handleCreate(data: {
    name: string;
    slug: string;
    description?: string;
  }) {
    await apiClient.createAcademy({
      name: data.name,
      private_domain: data.slug,
      description: data.description || undefined
    });
    toast.success(t('stores.storeCreated'));
    await refreshAcademies();
  }

  async function handleUpdate(
    id: number,
    data: {
      name: string;
      slug: string;
      publicAddress: string;
      description: string;
    }
  ) {
    await apiClient.updateAcademyById(id, {
      name: data.name,
      slug: data.slug,
      public_address: data.publicAddress || null,
      description: data.description || undefined
    });
    toast.success(t('stores.storeUpdated'));
    await refreshAcademies();
  }

  const totalCount = academies.length;

  return (
    <div className="flex-1 space-y-6 p-6" dir="rtl">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs text-muted-foreground">
            {t('navigation.management')}
          </p>
          <h1 className="text-2xl font-bold tracking-tight">
            {t('navigation.stores')}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {totalCount} {t('stores.title')}
            {'. '}
            {t('stores.manageStoresDescription')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 rounded-xl">
            <Filter className="h-3.5 w-3.5" />
            {t('stores.filterAcademies')}
          </Button>

          {canCreate && (
            <Button
              size="sm"
              className="gap-1.5 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => setCreateOpen(true)}
            >
              + {t('stores.addAcademy')}
            </Button>
          )}
        </div>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : academies.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <GraduationCap className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold">{t('stores.emptyTitle')}</h2>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            {t('stores.emptyDesc')}
          </p>
          {canCreate && (
            <Button className="mt-6" onClick={() => setCreateOpen(true)}>
              + {t('stores.addAcademy')}
            </Button>
          )}
        </div>
      ) : (
        /* Grid */
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {academies.map((academy: Academy) => (
            <AcademyCard
              key={academy.id}
              academy={academy as any}
              isCurrent={academy.id === currentAcademyId}
              onSwitch={handleSwitch}
              onEdit={setEditAcademy}
              switching={switching}
              t={t}
            />
          ))}

          {/* Add new academy card */}
          {canCreate && (
            <AddAcademyCard onClick={() => setCreateOpen(true)} t={t} />
          )}
        </div>
      )}

      {/* Create modal */}
      <AcademyCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
        t={t}
      />

      {/* Edit modal */}
      <AcademyEditModal
        academy={editAcademy}
        onClose={() => setEditAcademy(null)}
        onSubmit={handleUpdate}
        t={t}
      />
    </div>
  );
}
