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
  sohail: {
    name: 'کهکشان',
    tagline: 'علمی · رصدی · تیره',
    colors: {
      primary: '#0e7f76',
      secondary: '#0d1322',
      secondaryDark: '#e6ebf5',
      accent: '#c1521c',
      background: '#ededE6',
      backgroundDark: '#05070d',
      surface: '#ffffff'
    },
    typography: { fontFamily: 'vazirmatn', displayWeight: '700' },
    shape: { borderRadius: 'sharp', shadow: 'subtle' },
    darkMode: null
  },
  setigh: {
    name: 'اوج',
    tagline: 'پرانرژی · مهارتی · داده‌محور',
    colors: {
      primary: '#9bd213',
      secondary: '#0a0f0d',
      secondaryDark: '#edf1ea',
      accent: '#ff5b22',
      background: '#eff0eb',
      backgroundDark: '#0a0e0d',
      surface: '#ffffff'
    },
    typography: { fontFamily: 'vazirmatn', displayWeight: '800' },
    shape: { borderRadius: 'sharp', shadow: 'medium' },
    darkMode: null
  },
  havan: {
    name: 'زعفران',
    tagline: 'گرم · کارگاهی · کلاسیک',
    colors: {
      primary: '#b4441c',
      secondary: '#2e1a10',
      secondaryDark: '#f2e8da',
      accent: '#e0a32e',
      background: '#fbf6ec',
      backgroundDark: '#17110c',
      surface: '#fffdf8'
    },
    typography: { fontFamily: 'vazirmatn', displayWeight: '700' },
    shape: { borderRadius: 'sharp', shadow: 'subtle' },
    darkMode: null
  },
  tondak: {
    name: 'شکوفا',
    tagline: 'شاد · کودک و نوجوان · رنگی',
    colors: {
      primary: '#ff5a1f',
      secondary: '#0f3138',
      secondaryDark: '#eef7f4',
      accent: '#ffc02e',
      background: '#fff7ee',
      backgroundDark: '#0c1518',
      surface: '#ffffff'
    },
    typography: { fontFamily: 'vazirmatn', displayWeight: '800' },
    shape: { borderRadius: 'rounded', shadow: 'medium' },
    darkMode: null
  },
  momas: {
    name: 'پیشرو',
    tagline: 'درسی · کنکور · دقیق',
    colors: {
      primary: '#1e4fa3',
      secondary: '#12161b',
      secondaryDark: '#e9ece8',
      accent: '#ce3526',
      background: '#f7f6f1',
      backgroundDark: '#0d1013',
      surface: '#ffffff'
    },
    typography: { fontFamily: 'vazirmatn', displayWeight: '700' },
    shape: { borderRadius: 'sharp', shadow: 'subtle' },
    darkMode: null
  },
  goftavard: {
    name: 'هم‌کلام',
    tagline: 'زبان · گفت‌وگومحور · روشن',
    colors: {
      primary: '#1b3fd1',
      secondary: '#07101e',
      secondaryDark: '#e9eef7',
      accent: '#cfe81c',
      background: '#eef1f6',
      backgroundDark: '#080f1b',
      surface: '#ffffff'
    },
    typography: { fontFamily: 'vazirmatn', displayWeight: '700' },
    shape: { borderRadius: 'soft', shadow: 'subtle' },
    darkMode: null
  },
  rasadaneh: {
    name: 'سپهر',
    tagline: 'نجوم · اطلس‌گونه · کاغذی',
    colors: {
      primary: '#b5601f',
      secondary: '#0e1a20',
      secondaryDark: '#f1ebdd',
      accent: '#2e6e6a',
      background: '#f4efe4',
      backgroundDark: '#0b1316',
      surface: '#fbf8f1'
    },
    typography: { fontFamily: 'vazirmatn', displayWeight: '700' },
    shape: { borderRadius: 'sharp', shadow: 'subtle' },
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
