'use client';

import { useEffect } from 'react';
import { apiClient } from '@/lib/api';
import {
  applyThemeVariables,
  DEFAULT_THEME_CONFIG,
  parseThemeResponse,
  subscribeToThemeUpdates
} from '@/lib/theme';
import { useTheme } from 'next-themes';
import { ThemeConfigPayload } from '@/types/api';
import { useBrandingStore } from '@/lib/store';

export function ThemeInitializer() {
  const themeContext = useTheme();
  const setTheme = themeContext?.setTheme;
  const setLogoUrl = useBrandingStore((s) => s.setLogoUrl);

  useEffect(() => {
    if (!setTheme) return;

    let isMounted = true;

    const loadTheme = async () => {
      try {
        const response = await apiClient.getCurrentThemeConfig();
        if (!isMounted) return;
        const rawData = response as Record<string, unknown>;
        const dataLevel = (rawData?.data as Record<string, unknown>) ?? rawData;
        setLogoUrl((dataLevel?.logoUrl as string) ?? null);
        const config = parseThemeResponse(response);
        applyThemeVariables(config);
        setTheme('light');
      } catch (error) {
        console.error('Failed to load theme configuration', error);
        if (!isMounted) return;
        applyThemeVariables(DEFAULT_THEME_CONFIG);
        setTheme('light');
      }
    };

    loadTheme();

    const unsubscribe = subscribeToThemeUpdates(
      (config: ThemeConfigPayload) => {
        if (!setTheme) return;
        applyThemeVariables(config);
        setTheme('light');
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [setTheme]);

  return null;
}
