'use client';

import { useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { useTheme } from 'next-themes';
import { useBrandingStore } from '@/lib/store';

// Only the academy's logo is read here — the admin panel's own colors are
// fixed to the platform brand (globals.css) and must never pick up the
// academy's storefront theme (that's edusphere's job, via theme-apply.ts).
export function ThemeInitializer() {
  const themeContext = useTheme();
  const setTheme = themeContext?.setTheme;
  const setLogoUrl = useBrandingStore((s) => s.setLogoUrl);

  useEffect(() => {
    if (!setTheme) return;

    let isMounted = true;

    const loadLogo = async () => {
      try {
        const response = await apiClient.getCurrentThemeConfig();
        if (!isMounted) return;
        const rawData = response as Record<string, unknown>;
        const dataLevel = (rawData?.data as Record<string, unknown>) ?? rawData;
        setLogoUrl((dataLevel?.logoUrl as string) ?? null);
        setTheme('light');
      } catch (error) {
        console.error('Failed to load academy branding', error);
        if (!isMounted) return;
        setTheme('light');
      }
    };

    loadLogo();

    return () => {
      isMounted = false;
    };
  }, [setTheme, setLogoUrl]);

  return null;
}
