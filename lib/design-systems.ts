import type { ThemeConfigPayload } from '@/types/api';

export interface DesignSystem {
  name: string;
  tagline: string;
  colors: {
    primary: string;
    /** Explicit dark-mode primary. Falls back to `primary` when omitted. */
    primaryDark?: string;
    secondary: string;
    /** Explicit dark-mode secondary. Falls back to `secondary` when omitted. */
    secondaryDark?: string;
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
  typography: { fontFamily: 'vazirmatn', displayWeight: '700' },
  shape: { borderRadius: 'soft', shadow: 'medium' },
  darkMode: null
};

export const DESIGN_SYSTEMS: Record<string, DesignSystem> = {
  flow: {
    name: 'منتوما فلو',
    tagline: 'یادگیری · مسیرمحور · مینیمال',
    colors: {
      primary: '#00b388',
      primaryDark: '#00b388',
      secondary: '#0b1c2c',
      secondaryDark: '#e2e8f0',
      accent: '#f59e0b',
      background: '#fafbfc',
      backgroundDark: '#0f172a',
      surface: '#ffffff'
    },
    typography: { fontFamily: 'vazirmatn', displayWeight: '900' },
    shape: { borderRadius: 'rounded', shadow: 'medium' },
    darkMode: null
  },
  code: {
    name: 'کدیار',
    tagline: 'آموزش · حرفه‌ای · فارسی',
    colors: {
      primary: '#3b82f6',
      primaryDark: '#3b82f6',
      secondary: '#0f172a',
      secondaryDark: '#e2e8f0',
      accent: '#f59e0b',
      background: '#ffffff',
      backgroundDark: '#0f1117',
      surface: '#ffffff'
    },
    typography: { fontFamily: 'vazirmatn', displayWeight: '700' },
    shape: { borderRadius: 'rounded', shadow: 'medium' },
    darkMode: null
  },
  creative: {
    name: 'استودیوی خلاق',
    tagline: 'تصویرسازی · طراحی · جامعه خلاق',
    colors: {
      primary: '#00aa4d',
      primaryDark: '#00aa4d',
      // Navy stays dark in both modes so always-dark panels (hero, teachers,
      // cta button, footer) keep their navy background when the theme flips.
      secondary: '#002333',
      secondaryDark: '#002333',
      accent: '#d97706',
      background: '#faf9f7',
      backgroundDark: '#0f172a',
      surface: '#ffffff'
    },
    typography: { fontFamily: 'vazirmatn', displayWeight: '900' },
    shape: { borderRadius: 'rounded', shadow: 'medium' },
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
    primary_color_dark: ds.colors.primaryDark ?? ds.colors.primary,
    secondary_color: ds.colors.secondary,
    secondary_color_light: ds.colors.secondary,
    secondary_color_dark: ds.colors.secondaryDark ?? ds.colors.secondary,
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
