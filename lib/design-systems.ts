import type { ThemeConfigPayload } from '@/types/api';
import { getTemplateIdentity } from '@/constants/template-names';

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
  /**
   * How much the sections move on entry. Part of the design, not a global
   * default: a playful template that reveals as timidly as an academic one
   * has lost half of what made it playful.
   */
  motion?: 'none' | 'subtle' | 'moderate' | 'dynamic';
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
  motion: 'subtle',
  darkMode: null
};

type DesignSystemVisuals = Omit<DesignSystem, 'name' | 'tagline'>;

// Visual tokens only — the manager-facing name/tagline live in the central
// template catalog and are merged in by getDesignSystem.
export const DESIGN_SYSTEMS: Record<string, DesignSystemVisuals> = {
  keyhan: {
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
    motion: 'subtle',
    darkMode: null
  },
  tavan: {
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
    motion: 'moderate',
    darkMode: null
  },
  dastan: {
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
    motion: 'subtle',
    darkMode: null
  },
  parastoo: {
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
    motion: 'moderate',
    darkMode: null
  },
  nokhbeh: {
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
    motion: 'subtle',
    darkMode: null
  },
  zabaneh: {
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
    motion: 'subtle',
    darkMode: null
  },
  bikaran: {
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
    motion: 'subtle',
    darkMode: null
  },
  shafagh: {
    colors: {
      primary: '#d1462f',
      secondary: '#3a1f18',
      secondaryDark: '#f6e7dd',
      accent: '#a3324f',
      background: '#fdf6f0',
      backgroundDark: '#180d0a',
      surface: '#ffffff'
    },
    typography: { fontFamily: 'vazirmatn', displayWeight: '700' },
    shape: { borderRadius: 'soft', shadow: 'subtle' },
    motion: 'subtle',
    darkMode: null
  },
  elektron: {
    colors: {
      primary: '#0d9488',
      secondary: '#2a1a6e',
      secondaryDark: '#e4e0ff',
      accent: '#a855f7',
      background: '#f6f5ff',
      backgroundDark: '#0b0821',
      surface: '#ffffff'
    },
    typography: { fontFamily: 'vazirmatn', displayWeight: '800' },
    shape: { borderRadius: 'rounded', shadow: 'medium' },
    motion: 'moderate',
    darkMode: null
  },
  rouzan: {
    colors: {
      primary: '#4f46e5',
      secondary: '#0b0b12',
      secondaryDark: '#e8e8f2',
      accent: '#06b6d4',
      background: '#fbfbfd',
      backgroundDark: '#0a0a12',
      surface: '#ffffff'
    },
    typography: { fontFamily: 'vazirmatn', displayWeight: '800' },
    shape: { borderRadius: 'rounded', shadow: 'subtle' },
    motion: 'subtle',
    darkMode: null
  },
  daneshvar: {
    colors: {
      primary: '#1e3a5f',
      primaryDark: '#7ba7d4',
      secondary: '#111827',
      secondaryDark: '#e5e7eb',
      accent: '#b08327',
      background: '#f7f5f0',
      backgroundDark: '#0b1017',
      surface: '#fffdf8'
    },
    typography: { fontFamily: 'vazirmatn', displayWeight: '700' },
    shape: { borderRadius: 'sharp', shadow: 'subtle' },
    motion: 'subtle',
    darkMode: null
  },
  peleh: {
    colors: {
      primary: '#dc2626',
      primaryDark: '#f87171',
      secondary: '#0f172a',
      secondaryDark: '#e2e8f0',
      accent: '#f59e0b',
      background: '#fff8f5',
      backgroundDark: '#12080a',
      surface: '#ffffff'
    },
    typography: { fontFamily: 'vazirmatn', displayWeight: '800' },
    shape: { borderRadius: 'soft', shadow: 'medium' },
    motion: 'moderate',
    darkMode: null
  },
  andisheh: {
    colors: {
      primary: '#22d3ee',
      secondary: '#0b1220',
      secondaryDark: '#dbe6f5',
      accent: '#a78bfa',
      background: '#070b14',
      backgroundDark: '#070b14',
      surface: '#101a2b'
    },
    typography: { fontFamily: 'vazirmatn', displayWeight: '800' },
    shape: { borderRadius: 'soft', shadow: 'strong' },
    motion: 'moderate',
    // The one design that is dark by definition: a light Andisheh would lose
    // the terminal stage the whole template is built on.
    darkMode: true
  },
  shaparak: {
    colors: {
      primary: '#7c3aed',
      primaryDark: '#c4a8ff',
      secondary: '#0f172a',
      secondaryDark: '#e9e4ff',
      accent: '#f97316',
      background: '#fffdf7',
      backgroundDark: '#120c1f',
      surface: '#ffffff'
    },
    typography: { fontFamily: 'vazirmatn', displayWeight: '800' },
    shape: { borderRadius: 'rounded', shadow: 'medium' },
    motion: 'moderate',
    darkMode: null
  }
};

export function getDesignSystem(presetId: string): DesignSystem {
  const visuals = DESIGN_SYSTEMS[presetId];
  if (!visuals) return DEFAULT_DESIGN_SYSTEM;
  const identity = getTemplateIdentity(presetId);
  return { ...visuals, name: identity.name, tagline: identity.tagline };
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
    element_animation_style: ds.motion ?? 'subtle'
  };
}
