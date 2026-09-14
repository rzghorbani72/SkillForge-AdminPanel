'use client';

import { useCallback, useEffect, useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { apiClient } from '@/lib/api';
import { dashboardBannerSrc } from '@/lib/dashboard-banner-url';

const SLIDE_MS = 7000;

export type DashboardHeroBanner = {
  url: string;
  linkUrl: string | null;
};

export function useDashboardHeroBanners() {
  const academyId = useStore().selectedAcademy?.id ?? null;
  const [banners, setBanners] = useState<DashboardHeroBanner[]>([]);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [restartKey, setRestartKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await apiClient.getAcademyDashboardBanners();
        if (cancelled) return;
        setBanners(
          data.banners.map((banner) => ({
            url: dashboardBannerSrc(banner.image_id),
            linkUrl: banner.link_url,
          })),
        );
        setActive(0);
      } catch {
        if (!cancelled) setBanners([]);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [academyId]);

  useEffect(() => {
    if (banners.length < 2 || paused) return;
    const timer = window.setInterval(() => {
      setActive((index) => (index + 1) % banners.length);
    }, SLIDE_MS);
    return () => window.clearInterval(timer);
  }, [banners.length, paused, restartKey]);

  // Restarting the timer on a manual pick stops the next auto-slide from
  // firing a moment after the click.
  const select = useCallback((index: number) => {
    setActive(index);
    setRestartKey((key) => key + 1);
  }, []);

  return {
    banners,
    active: banners.length > 0 ? active % banners.length : 0,
    select,
    setPaused,
  };
}
