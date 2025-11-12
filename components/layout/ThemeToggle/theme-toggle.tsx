'use client';
import { useCallback, useMemo, useState } from 'react';
import { MoonIcon, SunIcon } from '@radix-ui/react-icons';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import {
  applyThemeVariables,
  dispatchThemeUpdate,
  parseThemeResponse,
  DEFAULT_THEME_CONFIG
} from '@/lib/theme';

type ThemeChoice = 'light' | 'dark' | 'system';

export default function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [isUpdating, setIsUpdating] = useState(false);

  const persistDarkPreference = useMemo(() => {
    if (theme === 'system') {
      if (typeof window === 'undefined' || !window.matchMedia)
        return DEFAULT_THEME_CONFIG.dark_mode;
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return theme === 'dark';
  }, [theme]);

  const handleThemeChange = useCallback(
    async (nextTheme: ThemeChoice) => {
      setTheme(nextTheme);

      const shouldPersistDark =
        nextTheme === 'system'
          ? (typeof window !== 'undefined' &&
              window.matchMedia &&
              window.matchMedia('(prefers-color-scheme: dark)').matches) ||
            false
          : nextTheme === 'dark';

      // Avoid duplicate updates if nothing changes
      if (shouldPersistDark === persistDarkPreference) {
        return;
      }

      setIsUpdating(true);
      try {
        const response = await apiClient.updateCurrentThemeConfig({
          dark_mode: shouldPersistDark
        });
        const updatedConfig = parseThemeResponse(response);
        applyThemeVariables(updatedConfig);
        dispatchThemeUpdate(updatedConfig);
      } catch (error) {
        ErrorHandler.handleApiError(error);
      } finally {
        setIsUpdating(false);
      }
    },
    [persistDarkPreference, setTheme]
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" disabled={isUpdating}>
          <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleThemeChange('light')}
          disabled={isUpdating}
        >
          Light
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleThemeChange('dark')}
          disabled={isUpdating}
        >
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleThemeChange('system')}
          disabled={isUpdating}
        >
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
