'use client';

import { useCallback, useEffect, useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { apiClient } from '@/lib/api';
import { dashboardBannerSrc } from '@/lib/dashboard-banner-url';

const SLIDE_MS = 7000;

export function useDashboardHeroBanners() {
  const academyId = useStore().selectedAcademy?.id ?? null;
  const [urls, setUrls] = useState<string[]>([]);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [restartKey, setRestartKey] = useState(0);

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
    if (urls.length < 2 || paused) return;
    const timer = window.setInterval(() => {
      setActive((index) => (index + 1) % urls.length);
    }, SLIDE_MS);
    return () => window.clearInterval(timer);
  }, [urls.length, paused, restartKey]);

  // Restarting the timer on a manual pick stops the next auto-slide from
  // firing a moment after the click.
  const select = useCallback((index: number) => {
    setActive(index);
    setRestartKey((key) => key + 1);
  }, []);

  return {
    urls,
    active: urls.length > 0 ? active % urls.length : 0,
    select,
    setPaused
  };
}
