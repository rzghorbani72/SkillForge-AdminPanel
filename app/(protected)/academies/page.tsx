'use client';

import { useState, useMemo } from 'react';
import { Filter, GraduationCap, Loader2, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'active' | 'inactive'
  >('all');

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

  const filteredAcademies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return academies.filter((a: Academy) => {
      const matchesSearch =
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.slug.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && a.is_active) ||
        (statusFilter === 'inactive' && !a.is_active);
      return matchesSearch && matchesStatus;
    });
  }, [academies, searchQuery, statusFilter]);

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
            {filteredAcademies.length}
            {totalCount !== filteredAcademies.length && ` / ${totalCount}`}{' '}
            {t('stores.title')}
            {'. '}
            {t('stores.manageStoresDescription')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute start-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('stores.searchStores')}
              className="h-8 w-48 rounded-xl ps-8 text-sm"
            />
            {searchQuery && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearchQuery('')}
                className="absolute end-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
          >
            <SelectTrigger className="h-8 w-32 gap-1.5 rounded-xl text-sm">
              <Filter className="h-3.5 w-3.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all')}</SelectItem>
              <SelectItem value="active">{t('stores.active')}</SelectItem>
              <SelectItem value="inactive">{t('stores.inactive')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : academies.length === 0 ? (
        /* No academies at all */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <GraduationCap className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold">{t('stores.emptyTitle')}</h2>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            {t('stores.emptyDesc')}
          </p>
        </div>
      ) : filteredAcademies.length === 0 ? (
        /* No results after filtering */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Filter className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold">{t('stores.noStoresFound')}</h2>
        </div>
      ) : (
        /* Grid */
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredAcademies.map((academy: Academy) => (
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
