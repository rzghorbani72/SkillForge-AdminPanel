'use client';

import { ThemeConfigPayload } from '@/types/api';

export const DEFAULT_THEME_CONFIG: ThemeConfigPayload = {
  primary_color: '#3b82f6',
  primary_color_light: '#3b82f6',
  primary_color_dark: '#60a5fa',
  secondary_color: '#6366f1',
  secondary_color_light: '#6366f1',
  secondary_color_dark: '#818cf8',
  accent_color: '#f59e0b',
  background_color: '#f8fafc',
  background_color_light: '#f8fafc',
  background_color_dark: '#0f172a',
  dark_mode: null
};

const FALLBACK_DARK_BACKGROUND = '#0f172a';
const FALLBACK_DARK_FOREGROUND = '#f8fafc';

const THEME_EVENT = 'theme:updated';

export function dispatchThemeUpdate(config: ThemeConfigPayload) {
  window.dispatchEvent(
    new CustomEvent<ThemeConfigPayload>(THEME_EVENT, { detail: config })
  );
}

export function subscribeToThemeUpdates(
  listener: (config: ThemeConfigPayload) => void
) {
  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<ThemeConfigPayload>;
    listener(customEvent.detail);
  };

  window.addEventListener(THEME_EVENT, handler as EventListener);
  return () =>
    window.removeEventListener(THEME_EVENT, handler as EventListener);
}

export function parseThemeResponse(payload: any): ThemeConfigPayload {
  const data = payload?.data ?? payload ?? {};
  const configs = data?.configs ?? data;

  return {
    themeId: data?.themeId ?? data?.id,
    name: data?.name ?? 'Custom Theme',
    primary_color: normaliseHex(
      configs?.primary_color,
      DEFAULT_THEME_CONFIG.primary_color
    ),
    primary_color_light: normaliseHex(
      configs?.primary_color_light,
      configs?.primary_color_light ?? DEFAULT_THEME_CONFIG.primary_color_light
    ),
    primary_color_dark: normaliseHex(
      configs?.primary_color_dark,
      configs?.primary_color_dark ?? DEFAULT_THEME_CONFIG.primary_color_dark
    ),
    secondary_color: normaliseHex(
      configs?.secondary_color,
      DEFAULT_THEME_CONFIG.secondary_color
    ),
    secondary_color_light: normaliseHex(
      configs?.secondary_color_light,
      configs?.secondary_color_light ??
        DEFAULT_THEME_CONFIG.secondary_color_light
    ),
    secondary_color_dark: normaliseHex(
      configs?.secondary_color_dark,
      configs?.secondary_color_dark ?? DEFAULT_THEME_CONFIG.secondary_color_dark
    ),
    accent_color: normaliseHex(
      configs?.accent_color,
      DEFAULT_THEME_CONFIG.accent_color
    ),
    background_color: normaliseHex(
      configs?.background_color,
      DEFAULT_THEME_CONFIG.background_color
    ),
    background_color_light: normaliseHex(
      configs?.background_color_light,
      configs?.background_color_light ??
        DEFAULT_THEME_CONFIG.background_color_light
    ),
    background_color_dark: normaliseHex(
      configs?.background_color_dark,
      configs?.background_color_dark ??
        DEFAULT_THEME_CONFIG.background_color_dark
    ),
    dark_mode:
      configs?.dark_mode === null || configs?.dark_mode === undefined
        ? null
        : (parseBoolean(configs?.dark_mode) ?? DEFAULT_THEME_CONFIG.dark_mode)
  };
}

function normaliseHex(value: string | undefined, fallback: string) {
  if (!value) return fallback;
  if (value.startsWith('#') && (value.length === 7 || value.length === 4)) {
    return value.toLowerCase();
  }
  if (value.startsWith('rgb')) {
    return rgbaToHex(value);
  }
  return fallback;
}

function parseBoolean(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
  }
  return undefined;
}

export function applyThemeVariables(config: ThemeConfigPayload) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  const isDark =
    config.dark_mode === null
      ? typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      : config.dark_mode;

  const backgroundHex = isDark
    ? (config.background_color_dark ??
      normaliseDarkHex(config.background_color))
    : (config.background_color_light ??
      config.background_color ??
      DEFAULT_THEME_CONFIG.background_color);

  const primaryHex = isDark
    ? (config.primary_color_dark ??
      config.primary_color ??
      DEFAULT_THEME_CONFIG.primary_color)
    : (config.primary_color_light ??
      config.primary_color ??
      DEFAULT_THEME_CONFIG.primary_color);

  const secondaryHex = isDark
    ? (config.secondary_color_dark ??
      config.secondary_color ??
      DEFAULT_THEME_CONFIG.secondary_color)
    : (config.secondary_color_light ??
      config.secondary_color ??
      DEFAULT_THEME_CONFIG.secondary_color);

  const accentHex = config.accent_color ?? DEFAULT_THEME_CONFIG.accent_color;

  const primaryHsl = hexToHslString(primaryHex);
  const secondaryHsl = hexToHslString(secondaryHex);
  const accentHsl = hexToHslString(accentHex);
  const backgroundHsl = hexToHslString(backgroundHex);

  const primaryFg = hexToHslString(getContrastHex(primaryHex));
  const secondaryFg = hexToHslString(getContrastHex(secondaryHex));
  const accentFg = hexToHslString(getContrastHex(accentHex));
  const backgroundFg = hexToHslString(
    config.dark_mode ? FALLBACK_DARK_FOREGROUND : getContrastHex(backgroundHex)
  );

  const mutedHsl = adjustLightnessString(
    backgroundHex,
    config.dark_mode ? 6 : -6
  );
  const mutedFg = backgroundFg;
  const borderHsl = adjustLightnessString(backgroundHex, -12);

  root.style.setProperty('--primary', primaryHsl);
  root.style.setProperty('--primary-foreground', primaryFg);
  root.style.setProperty('--secondary', secondaryHsl);
  root.style.setProperty('--secondary-foreground', secondaryFg);
  root.style.setProperty('--accent', accentHsl);
  root.style.setProperty('--accent-foreground', accentFg);
  root.style.setProperty('--background', backgroundHsl);
  root.style.setProperty('--foreground', backgroundFg);
  root.style.setProperty('--card', backgroundHsl);
  root.style.setProperty('--card-foreground', backgroundFg);
  root.style.setProperty('--popover', backgroundHsl);
  root.style.setProperty('--popover-foreground', backgroundFg);
  root.style.setProperty('--ring', primaryHsl);
  root.style.setProperty('--muted', mutedHsl);
  root.style.setProperty('--muted-foreground', mutedFg);
  root.style.setProperty('--border', borderHsl);
  root.style.setProperty('--input', borderHsl);
}

function normaliseDarkHex(background: string | undefined) {
  if (!background) return FALLBACK_DARK_BACKGROUND;
  const cleaned = background.toLowerCase();
  if (cleaned === DEFAULT_THEME_CONFIG.background_color.toLowerCase()) {
    return FALLBACK_DARK_BACKGROUND;
  }
  return cleaned;
}

function hexToHslString(hex: string): string {
  const { h, s, l } = hexToHsl(hex);
  return `${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%`;
}

function hexToHsl(hex: string) {
  const cleaned = hex.replace('#', '');
  const bigint = parseInt(
    cleaned.length === 3 ? cleaned.repeat(2) : cleaned,
    16
  );
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / d + 2;
        break;
      case bNorm:
        h = (rNorm - gNorm) / d + 4;
        break;
      default:
        break;
    }
    h /= 6;
  }

  return {
    h: h * 360,
    s: s * 100,
    l: l * 100
  };
}

function getContrastHex(hex: string): string {
  const cleaned = hex.replace('#', '');
  const bigint = parseInt(
    cleaned.length === 3 ? cleaned.repeat(2) : cleaned,
    16
  );
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#111111' : '#ffffff';
}

function adjustLightnessString(hex: string, delta: number) {
  const hsl = hexToHsl(hex);
  const newLightness = Math.max(0, Math.min(100, hsl.l + delta));
  return `${Math.round(hsl.h)} ${Math.round(hsl.s)}% ${Math.round(newLightness)}%`;
}

function rgbaToHex(rgba: string): string {
  const matches = rgba
    .replace(/\s+/g, '')
    .match(/^rgba?\((\d{1,3}),(\d{1,3}),(\d{1,3})(?:,(\d?(?:\.\d+)?))?\)$/i);
  if (!matches) return DEFAULT_THEME_CONFIG.primary_color;
  const r = Number(matches[1]);
  const g = Number(matches[2]);
  const b = Number(matches[3]);

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toLowerCase();
}

function toHex(value: number) {
  const hex = value.toString(16);
  return hex.length === 1 ? `0${hex}` : hex;
}
