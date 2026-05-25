/**
 * Server-safe theme utilities (no 'use client').
 *
 * generateAdminThemeCSS injects a <style> tag on every SSR render so the
 * first paint already has the correct primary color from the backend config.
 *
 * IMPORTANT: This function deliberately does NOT set any surface/border/muted
 * variables (--background, --card, --muted, --border, --sidebar-*, etc.).
 * Those are permanently owned by globals.css (warm off-white Mentoryar design).
 * Overriding them here caused the blue-flash on first render.
 *
 * Only --primary, --primary-foreground, --ring, --accent, --accent-foreground
 * are dynamic — the rest are constant warm surfaces.
 */

import { getServerApiBaseUrl } from './api-base-url';

const API_BASE_URL = getServerApiBaseUrl();

const DEFAULT_PRIMARY = '#dd382c'; // cherry red hsl(4 72% 52%)

// ── Hex → HSL ────────────────────────────────────────────────────────────────

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
  let h = 0,
    s = 0;
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

function hsl(hex: string): string {
  const { h, s, l } = hexToHsl(hex);
  return `${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%`;
}

function contrast(hex: string): string {
  const cleaned = hex.replace('#', '');
  const full =
    cleaned.length === 3
      ? cleaned
          .split('')
          .map((c) => c + c)
          .join('')
      : cleaned;
  const n = parseInt(full, 16);
  const lum =
    (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) /
    255;
  return lum > 0.5 ? '228 25% 16%' : '0 0% 100%';
}

// ── Theme config shape ────────────────────────────────────────────────────────

interface ServerThemeConfig {
  primary_color?: string;
  background_color?: string;
  dark_mode?: boolean | null;
}

// ── CSS generation ────────────────────────────────────────────────────────────

export function generateAdminThemeCSS(
  configs: ServerThemeConfig | null
): string {
  if (!configs) return '';

  const primaryHex = configs.primary_color || DEFAULT_PRIMARY;
  const { h } = hexToHsl(primaryHex);
  const accentHsl = `${Math.round(h)} 72% 96%`;

  // Only override accent/primary — surfaces are owned by globals.css
  return `:root {
  --primary:            ${hsl(primaryHex)};
  --primary-foreground: ${contrast(primaryHex)};
  --ring:               ${hsl(primaryHex)};
  --accent:             ${accentHsl};
  --accent-foreground:  ${Math.round(h)} 72% 42%;
}`;
}

// ── Server-side theme fetcher ─────────────────────────────────────────────────

export async function fetchAdminThemeConfigs(
  jwtToken: string | undefined
): Promise<ServerThemeConfig | null> {
  if (!jwtToken) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/theme/current/config`, {
      headers: {
        Cookie: `jwt=${jwtToken}`,
        Authorization: `Bearer ${jwtToken}`
      },
      cache: 'no-store'
    });
    if (!res.ok) return null;
    const json = await res.json();
    const data = json?.data ?? json;
    return data?.configs ?? data ?? null;
  } catch {
    return null;
  }
}
