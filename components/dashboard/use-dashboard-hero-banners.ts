'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { apiClient } from '@/lib/api';
import { dashboardBannerSrc } from '@/lib/dashboard-banner-url';

const SLIDE_MS = 7000;

export function useDashboardHeroBanners() {
  const academyId = useStore().selectedAcademy?.id ?? null;
  const [urls, setUrls] = useState<string[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await apiClient.getAcademyDashboardBanners();
        if (cancelled) return;
        setUrls(
          data.banners.map((banner) => dashboardBannerSrc(banner.image_id))
        );
        setActive(0);
      } catch {
        if (!cancelled) setUrls([]);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [academyId]);

  useEffect(() => {
    if (urls.length < 2) return;
    const timer = window.setInterval(() => {
      setActive((index) => (index + 1) % urls.length);
    }, SLIDE_MS);
    return () => window.clearInterval(timer);
  }, [urls.length]);

  return {
    urls,
    active: urls.length > 0 ? active % urls.length : 0
  };
}
