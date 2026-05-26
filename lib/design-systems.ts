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

// One design system per template preset ID.
// Colors are raw hex — no Tailwind class strings.
export const DESIGN_SYSTEMS: Record<string, DesignSystem> = {
  kajabi: {
    name: 'Expert Academy',
    tagline: 'Authority · Professional · Trust',
    colors: {
      primary: '#e11d48',
      secondary: '#1f2937',
      accent: '#f97316',
      background: '#fff9fa',
      backgroundDark: '#09090b',
      surface: '#ffffff'
    },
    typography: { fontFamily: 'Plus Jakarta Sans', displayWeight: '800' },
    shape: { borderRadius: 'soft', shadow: 'medium' },
    darkMode: null
  },
  podia: {
    name: 'Studio Creator',
    tagline: 'Fresh · Warm · Accessible',
    colors: {
      primary: '#0d9488',
      secondary: '#134e4a',
      accent: '#14b8a6',
      background: '#f0fdfa',
      backgroundDark: '#042f2e',
      surface: '#ffffff'
    },
    typography: { fontFamily: 'Plus Jakarta Sans', displayWeight: '700' },
    shape: { borderRadius: 'rounded', shadow: 'subtle' },
    darkMode: null
  },
  stan: {
    name: 'Bold Creator',
    tagline: 'Bold · Vibrant · Gen-Z Energy',
    colors: {
      primary: '#7c3aed',
      secondary: '#fb923c',
      accent: '#a78bfa',
      background: '#f5f3ff',
      backgroundDark: '#1e1b4b',
      surface: '#ffffff'
    },
    typography: { fontFamily: 'Space Grotesk', displayWeight: '800' },
    shape: { borderRadius: 'rounded', shadow: 'strong' },
    darkMode: null
  },
  circle: {
    name: 'Community Dark',
    tagline: 'Deep · Focused · Premium',
    colors: {
      primary: '#6366f1',
      secondary: '#e2e8f0',
      accent: '#818cf8',
      background: '#f8fafc',
      backgroundDark: '#0f172a',
      surface: '#1e293b'
    },
    typography: { fontFamily: 'Inter', displayWeight: '700' },
    shape: { borderRadius: 'soft', shadow: 'strong' },
    darkMode: true
  },
  modern: {
    name: 'Clean Modern',
    tagline: 'Minimal · Crisp · Product-Grade',
    colors: {
      primary: '#4f46e5',
      secondary: '#64748b',
      accent: '#6366f1',
      background: '#ffffff',
      backgroundDark: '#1e1b4b',
      surface: '#f8fafc'
    },
    typography: { fontFamily: 'Inter', displayWeight: '700' },
    shape: { borderRadius: 'rounded', shadow: 'medium' },
    darkMode: null
  },
  classic: {
    name: 'Traditional',
    tagline: 'Reliable · Clear · Institutional',
    colors: {
      primary: '#2563eb',
      secondary: '#374151',
      accent: '#3b82f6',
      background: '#f8fafc',
      backgroundDark: '#0f172a',
      surface: '#ffffff'
    },
    typography: { fontFamily: 'Plus Jakarta Sans', displayWeight: '700' },
    shape: { borderRadius: 'soft', shadow: 'subtle' },
    darkMode: null
  },
  minimal: {
    name: 'Content First',
    tagline: 'Pure · Typographic · Focused',
    colors: {
      primary: '#18181b',
      secondary: '#71717a',
      accent: '#3f3f46',
      background: '#ffffff',
      backgroundDark: '#09090b',
      surface: '#fafafa'
    },
    typography: { fontFamily: 'Inter', displayWeight: '700' },
    shape: { borderRadius: 'sharp', shadow: 'none' },
    darkMode: null
  },
  academy: {
    name: 'Academic Institution',
    tagline: 'Structured · Credible · Scholarly',
    colors: {
      primary: '#1d4ed8',
      secondary: '#1e3a8a',
      accent: '#3b82f6',
      background: '#eff6ff',
      backgroundDark: '#1e3a8a',
      surface: '#ffffff'
    },
    typography: { fontFamily: 'Plus Jakarta Sans', displayWeight: '800' },
    shape: { borderRadius: 'soft', shadow: 'subtle' },
    darkMode: null
  },
  'student-focused': {
    name: 'Motivational',
    tagline: 'Energetic · Fun · Inclusive',
    colors: {
      primary: '#c026d3',
      secondary: '#7e22ce',
      accent: '#e879f9',
      background: '#fdf4ff',
      backgroundDark: '#2e1065',
      surface: '#ffffff'
    },
    typography: { fontFamily: 'Plus Jakarta Sans', displayWeight: '800' },
    shape: { borderRadius: 'rounded', shadow: 'medium' },
    darkMode: null
  },
  'courses-first': {
    name: 'Marketplace',
    tagline: 'Commerce · Discovery · Bold',
    colors: {
      primary: '#d97706',
      secondary: '#1f2937',
      accent: '#f59e0b',
      background: '#fffbeb',
      backgroundDark: '#1c1007',
      surface: '#ffffff'
    },
    typography: { fontFamily: 'Plus Jakarta Sans', displayWeight: '800' },
    shape: { borderRadius: 'soft', shadow: 'medium' },
    darkMode: null
  },
  featured: {
    name: 'Showcase',
    tagline: 'Growth · Highlight · Trust',
    colors: {
      primary: '#16a34a',
      secondary: '#134e4a',
      accent: '#22c55e',
      background: '#f0fdf4',
      backgroundDark: '#052e16',
      surface: '#ffffff'
    },
    typography: { fontFamily: 'Inter', displayWeight: '700' },
    shape: { borderRadius: 'rounded', shadow: 'subtle' },
    darkMode: null
  },
  compact: {
    name: 'Efficient',
    tagline: 'Dense · Neutral · Professional',
    colors: {
      primary: '#475569',
      secondary: '#1e293b',
      accent: '#64748b',
      background: '#f1f5f9',
      backgroundDark: '#0f172a',
      surface: '#ffffff'
    },
    typography: { fontFamily: 'Inter', displayWeight: '700' },
    shape: { borderRadius: 'sharp', shadow: 'none' },
    darkMode: null
  }
};

export function buildThemePayload(
  ds: DesignSystem,
  presetName: string
): ThemeConfigPayload {
  return {
    name: presetName,
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
