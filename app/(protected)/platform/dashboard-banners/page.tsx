'use client';

import { useCallback, useEffect, useState } from 'react';
import { Images } from 'lucide-react';
import { BannerStatePanel } from './_components/banner-state-panel';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthUser } from '@/hooks/useAuthUser';
import { apiClient, type DashboardBanner } from '@/lib/api';
import { useTranslation } from '@/lib/i18n/hooks';
import { isPlatformAdmin } from '@/lib/roles';

export default function DashboardBannersPage() {
  const { t } = useTranslation();
  const { user, isLoading } = useAuthUser();
  const allowed = isPlatformAdmin(user);
  const [banners, setBanners] = useState<DashboardBanner[]>([]);

  const load = useCallback(async () => {
    if (!allowed) return;
    try {
      setBanners(await apiClient.listDashboardBanners());
    } catch {
      setBanners([]);
    }
  }, [allowed]);

  useEffect(() => {
    if (!isLoading) void load();
  }, [isLoading, load]);

  if (isLoading) return <div className="flex-1 p-4 sm:p-6" />;

  if (!allowed) {
    return (
      <div className="flex-1 p-4 sm:p-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboardBanners.title')}</CardTitle>
            <CardDescription>{t('dashboardBanners.accessDenied')}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const incomplete = banners.filter((banner) => banner.state === 'INCOMPLETE');
  const completed = banners.filter((banner) => banner.state === 'COMPLETED');

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6">
      <div>
        <div className="flex items-center gap-2">
          <Images className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold">{t('dashboardBanners.title')}</h1>
        </div>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {t('dashboardBanners.description')}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{t('dashboardBanners.hint')}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <BannerStatePanel state="INCOMPLETE" banners={incomplete} onChanged={load} />
        <BannerStatePanel state="COMPLETED" banners={completed} onChanged={load} />
      </div>
    </div>
  );
}
