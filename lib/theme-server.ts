/**
 * Server-safe theme utilities — no 'use client' directive.
 * Used to inject correct theme CSS variables on SSR so the first paint matches
 * the saved theme, eliminating the flash of default colors.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const FALLBACK_DARK_BG = '#0f172a';
const FALLBACK_LIGHT_BG = '#f8fafc';

// ─── Pure hex→HSL conversion ────────────────────────────────────────────────

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const cleaned = hex.replace('#', '');
  const full =
    cleaned.length === 3
      ? cleaned
          .split('')
          .map((c) => c + c)
          .join('')
      : cleaned;
  const n = parseInt(full, 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hexToHslString(hex: string): string {
  const { h, s, l } = hexToHsl(hex);
  return `${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%`;
}

function adjustLightness(hex: string, delta: number): string {
  const { h, s, l } = hexToHsl(hex);
  return `${Math.round(h)} ${Math.round(s)}% ${Math.round(Math.max(0, Math.min(100, l + delta)))}%`;
}

function getContrastHex(hex: string): string {
  const cleaned = hex.replace('#', '');
  const n = parseInt(
    cleaned.length === 3
      ? cleaned
          .split('')
          .map((c) => c + c)
          .join('')
      : cleaned,
    16
  );
  const lum =
    (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) /
    255;
  return lum > 0.5 ? '#111111' : '#ffffff';
}

function hexToHslContrast(hex: string): string {
  return hexToHslString(getContrastHex(hex));
}

// ─── Theme config shape ──────────────────────────────────────────────────────

interface ServerThemeConfig {
  primary_color?: string;
  primary_color_light?: string;
  primary_color_dark?: string;
  secondary_color?: string;
  secondary_color_light?: string;
  secondary_color_dark?: string;
  accent_color?: string;
  background_color?: string;
  background_color_light?: string;
  background_color_dark?: string;
  dark_mode?: boolean | null;
}

// ─── CSS generation ──────────────────────────────────────────────────────────

export function generateAdminThemeCSS(
  configs: ServerThemeConfig | null
): string {
  if (!configs) return '';

  const prefersDark = configs.dark_mode === true;

  const bgHex = prefersDark
    ? configs.background_color_dark ||
      (configs.background_color === FALLBACK_LIGHT_BG
        ? FALLBACK_DARK_BG
        : configs.background_color) ||
      FALLBACK_DARK_BG
    : configs.background_color_light ||
      configs.background_color ||
      FALLBACK_LIGHT_BG;

  const primaryHex = prefersDark
    ? configs.primary_color_dark || configs.primary_color || '#60a5fa'
    : configs.primary_color_light || configs.primary_color || '#3b82f6';

  const secondaryHex = prefersDark
    ? configs.secondary_color_dark || configs.secondary_color || '#818cf8'
    : configs.secondary_color_light || configs.secondary_color || '#6366f1';

  const accentHex = configs.accent_color || '#f59e0b';

  const bgHsl = hexToHslString(bgHex);
  const primaryHsl = hexToHslString(primaryHex);
  const secondaryHsl = hexToHslString(secondaryHex);
  const accentHsl = hexToHslString(accentHex);
  const fgHsl = hexToHslContrast(bgHex);
  const mutedHsl = adjustLightness(bgHex, prefersDark ? 6 : -6);
  const borderHsl = adjustLightness(bgHex, -12);

  return `:root {
  --background: ${bgHsl};
  --foreground: ${fgHsl};
  --card: ${bgHsl};
  --card-foreground: ${fgHsl};
  --popover: ${bgHsl};
  --popover-foreground: ${fgHsl};
  --primary: ${primaryHsl};
  --primary-foreground: ${hexToHslContrast(primaryHex)};
  --secondary: ${secondaryHsl};
  --secondary-foreground: ${hexToHslContrast(secondaryHex)};
  --accent: ${accentHsl};
  --accent-foreground: ${hexToHslContrast(accentHex)};
  --muted: ${mutedHsl};
  --muted-foreground: ${fgHsl};
  --border: ${borderHsl};
  --input: ${borderHsl};
  --ring: ${primaryHsl};
}`;
}

// ─── Server-side theme fetcher ───────────────────────────────────────────────

export async function fetchAdminThemeConfigs(
  jwtToken: string | undefined
): Promise<ServerThemeConfig | null> {
  if (!jwtToken) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/theme/current/config`, {
      headers: { Authorization: `Bearer ${jwtToken}` },
      next: { revalidate: 30 } // cache for 30s to avoid per-request overhead
    });
    if (!res.ok) return null;
    const json = await res.json();
    const data = json?.data ?? json;
    return data?.configs ?? data ?? null;
  } catch {
    return null;
  }
}
