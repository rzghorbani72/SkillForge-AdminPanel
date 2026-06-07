import type { ThemeConfigPayload } from '@/types/api';

export interface DesignSystem {
  name: string;
  tagline: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    backgroundDark: string;
    surface: string;
  };
  typography: {
    fontFamily: string;
    displayWeight: '700' | '800' | '900';
  };
  shape: {
    borderRadius: 'sharp' | 'soft' | 'rounded';
    shadow: 'none' | 'subtle' | 'medium' | 'strong';
  };
  darkMode: boolean | null;
}

export const DEFAULT_DESIGN_SYSTEM: DesignSystem = {
  name: 'پیش‌فرض',
  tagline: 'ساده · تمیز · قابل تنظیم',
  colors: {
    primary: '#3b82f6',
    secondary: '#64748b',
    accent: '#6366f1',
    background: '#ffffff',
    backgroundDark: '#0f172a',
    surface: '#f8fafc'
  },
  typography: { fontFamily: 'Inter', displayWeight: '700' },
  shape: { borderRadius: 'soft', shadow: 'medium' },
  darkMode: null
};

export const DESIGN_SYSTEMS: Record<string, DesignSystem> = {
  kodiyar: {
    name: 'کدیار',
    tagline: 'آموزش · حرفه‌ای · فارسی',
    colors: {
      primary: '#3B82F6',
      secondary: '#334155',
      accent: '#10B981',
      background: '#ffffff',
      backgroundDark: '#0F1117',
      surface: '#F8FAFC'
    },
    typography: { fontFamily: 'IRANYekan', displayWeight: '700' },
    shape: { borderRadius: 'soft', shadow: 'medium' },
    darkMode: null
  }
};

export function getDesignSystem(presetId: string): DesignSystem {
  return DESIGN_SYSTEMS[presetId] ?? DEFAULT_DESIGN_SYSTEM;
}

export function buildThemePayload(ds: DesignSystem): ThemeConfigPayload {
  return {
    name: ds.name,
    primary_color: ds.colors.primary,
    primary_color_light: ds.colors.primary,
    primary_color_dark: ds.colors.primary,
    secondary_color: ds.colors.secondary,
    accent_color: ds.colors.accent,
    background_color: ds.colors.background,
    background_color_light: ds.colors.background,
    background_color_dark: ds.colors.backgroundDark,
    dark_mode: ds.darkMode,
    border_radius_style: ds.shape.borderRadius,
    shadow_style: ds.shape.shadow,
    element_animation_style: 'subtle'
  };
}
