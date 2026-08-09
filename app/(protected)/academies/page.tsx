'use client';

import { useState, useMemo } from 'react';
import { Filter, GraduationCap, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/shared/PageHeader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useStore } from '@/hooks/useStore';
import { useAuthUser } from '@/hooks/useAuthUser';
import { isPlatformStaff, isPlatformAdmin } from '@/lib/roles';
import { useTranslation } from '@/lib/i18n/hooks';
import { getRoleLabel } from '@/lib/i18n/role-label';
import { apiClient } from '@/lib/api';
import { clearAcademyData, setSelectedAcademyId } from '@/lib/store-utils';
import { createAcademy, type AcademyCreateInput } from '@/lib/academy-create';
import { toast } from 'react-toastify';
import { AcademiesList } from '@/components/academies/academies-list';
import { CurrentPlanBanner } from '@/components/academies/current-plan-banner';
import { AcademyCreateModal } from '@/components/academies/AcademyCreateModal';
import { AcademyEditModal } from '@/components/academies/AcademyEditModal';
import { AcademiesHealthTable } from '@/components/academies/academies-health-table';
import type { AcademyRow } from '@/components/academies/academy-helpers';
import type { Academy } from '@/types/api';

export default function AcademiesPage() {
  const { t } = useTranslation();
  const { academies, isLoading, refreshAcademies, selectedAcademy } =
    useStore();
  const { user } = useAuthUser();
  const platformStaffView = isPlatformStaff(user);
  const [switching, setSwitching] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editAcademy, setEditAcademy] = useState<Academy | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'active' | 'inactive'
  >('all');

  const currentAcademyId = selectedAcademy?.id ?? null;
  const canCreate = Boolean(
    isPlatformAdmin(user) ||
      user?.role === 'MANAGER' ||
      (user as { isAdminProfile?: boolean })?.isAdminProfile
  );

  function resolveUserRole(academy: { id: string; userRole?: string }): string {
    const raw =
      academy.userRole ?? (academy.id === currentAcademyId ? user?.role : '');
    return raw ? getRoleLabel(raw, t) : '';
  }

  async function handleSwitch(academyId: string, redirectTo?: string) {
    if (academyId === currentAcademyId) {
      window.location.assign(redirectTo ?? '/dashboard');
      return;
    }
    setSwitching(academyId);
    try {
      await apiClient.switchAcademy(academyId);
      clearAcademyData();
      // Settings pages read the selected academy from the store, so the switch
      // has to land before the target page renders.
      if (redirectTo) {
        window.location.assign(redirectTo);
      } else {
        window.location.reload();
      }
    } catch (e: unknown) {
      toast.error((e as { message?: string })?.message ?? t('common.error'));
      setSwitching(null);
    }
  }

  function handleDetails(academy: Academy) {
    void handleSwitch(academy.id, '/settings/academy');
  }

  function buildTheme(hex: string) {
    const ch = (h: string, amt: number) =>
      Math.min(255, Math.max(0, parseInt(h, 16) + amt))
        .toString(16)
        .padStart(2, '0');
    const r = hex.slice(1, 3),
      g = hex.slice(3, 5),
      b = hex.slice(5, 7);
    return {
      primary_color: hex,
      primary_color_light: `#${ch(r, 60)}${ch(g, 60)}${ch(b, 60)}`,
      primary_color_dark: `#${ch(r, -40)}${ch(g, -40)}${ch(b, -40)}`
    };
  }

  async function handleCreate(data: AcademyCreateInput) {
    const result = await createAcademy(data);
    toast.success(t('stores.storeCreated'));

    // The academy now exists on the server, so the cached list is stale no
    // matter what happens next. Clearing it first means even a failed switch
    // still shows the new academy instead of hiding it behind old cache.
    clearAcademyData();
    if (result.id) setSelectedAcademyId(result.id);
    window.location.reload();
  }

  async function handleUpdate(
    id: string,
    data: {
      name: string;
      slug: string;
      publicAddress: string;
      description: string;
      logoId?: string;
      primaryColor?: string;
    }
  ) {
    await apiClient.updateAcademyById(id, {
      name: data.name,
      private_domain: data.slug,
      public_address: data.publicAddress || null,
      description: data.description || undefined,
      logo_id: data.logoId
    });

    if (data.primaryColor) {
      await apiClient
        .updateCurrentThemeConfig(buildTheme(data.primaryColor))
        .catch(() => {});
    }

    toast.success(t('stores.storeUpdated'));
    await refreshAcademies();
  }

  const filteredAcademies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return academies
      .filter((a: Academy) => {
        const matchesSearch =
          !q ||
          a.name.toLowerCase().includes(q) ||
          a.slug.toLowerCase().includes(q);
        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'active' && a.is_active) ||
          (statusFilter === 'inactive' && !a.is_active);
        return matchesSearch && matchesStatus;
      })
      .sort((a: AcademyRow, b: AcademyRow) =>
        a.id === currentAcademyId ? -1 : b.id === currentAcademyId ? 1 : 0
      );
  }, [academies, searchQuery, statusFilter, currentAcademyId]);

  const totalCount = academies.length;
  const isFiltered = searchQuery.trim() !== '' || statusFilter !== 'all';

  return (
    <div className="flex-1 space-y-6 p-6" dir="rtl">
      <PageHeader
        icon={<GraduationCap className="h-5 w-5" />}
        title={t('navigation.stores')}
        description={t('stores.manageStoresDescription')}
      />

      <CurrentPlanBanner />

      {platformStaffView && <AcademiesHealthTable />}

      <AcademiesList
        academies={filteredAcademies}
        totalCount={totalCount}
        isFiltered={isFiltered}
        isLoading={isLoading}
        currentAcademyId={currentAcademyId}
        canCreate={canCreate}
        switching={switching}
        resolveUserRole={resolveUserRole}
        onSwitch={handleSwitch}
        onDetails={handleDetails}
        onEdit={setEditAcademy}
        onCreate={() => setCreateOpen(true)}
        t={t}
        filters={
          <>
            <div className="relative">
              <Search className="absolute start-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('stores.searchStores')}
                className="h-8 w-48 rounded-lg bg-card ps-8 text-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  aria-label={t('common.clear')}
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
              <SelectTrigger className="h-8 w-32 gap-1.5 rounded-lg bg-card text-sm">
                <Filter className="h-3.5 w-3.5" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                <SelectItem value="active">{t('stores.active')}</SelectItem>
                <SelectItem value="inactive">{t('stores.inactive')}</SelectItem>
              </SelectContent>
            </Select>
          </>
        }
      />

      {/* Create modal — always cancellable: the manager opened it deliberately */}
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
