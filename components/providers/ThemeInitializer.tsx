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

export function ThemeInitializer() {
  const themeContext = useTheme();
  const setTheme = themeContext?.setTheme;

  useEffect(() => {
    if (!setTheme) return;

    let isMounted = true;

    const loadTheme = async () => {
      try {
        const response = await apiClient.getCurrentThemeConfig();
        if (!isMounted) return;
        const config = parseThemeResponse(response);
        applyThemeVariables(config);
        if (config.dark_mode === null) {
          setTheme('system');
        } else {
          setTheme(config.dark_mode ? 'dark' : 'light');
        }
      } catch (error) {
        console.error('Failed to load theme configuration', error);
        if (!isMounted) return;
        applyThemeVariables(DEFAULT_THEME_CONFIG);
      }
    };

    loadTheme();

    const unsubscribe = subscribeToThemeUpdates(
      (config: ThemeConfigPayload) => {
        if (!setTheme) return;
        applyThemeVariables(config);
        if (config.dark_mode === null) {
          setTheme('system');
        } else {
          setTheme(config.dark_mode ? 'dark' : 'light');
        }
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [setTheme]);

  return null;
}
