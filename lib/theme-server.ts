/**
 * Server-safe theme utilities (no 'use client').
 *
 * generateAdminThemeCSS injects a <style> tag on every SSR render so the
 * first paint already has the correct colors from the backend config —
 * eliminating the flash from globals.css defaults to the saved theme.
 *
 * Dynamically overrides: --primary, --primary-foreground, --ring,
 * --accent, --accent-foreground, --secondary, --secondary-foreground,
 * --background, --muted.
 *
 * The formulas here MUST stay in sync with applyThemeVariables in theme.ts.
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

export interface ServerThemeConfig {
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  background_color?: string;
  dark_mode?: boolean | null;
  logoUrl?: string | null;
}

// ── CSS generation ────────────────────────────────────────────────────────────

export function generateAdminThemeCSS(
  configs: ServerThemeConfig | null
): string {
  if (!configs) return '';

  const primaryHex = configs.primary_color || DEFAULT_PRIMARY;
  const lines = [
    `  --primary:            ${hsl(primaryHex)};`,
    `  --primary-foreground: ${contrast(primaryHex)};`,
    `  --ring:               ${hsl(primaryHex)};`
  ];

  // Accent — same formula as applyThemeVariables in theme.ts
  if (configs.accent_color) {
    const { h: ah, s: as_, l: al } = hexToHsl(configs.accent_color);
    lines.push(
      `  --accent:             ${Math.round(ah)} ${Math.round(as_ * 0.6)}% 95%;`
    );
    lines.push(
      `  --accent-foreground:  ${Math.round(ah)} ${Math.round(as_)}% ${Math.round(Math.min(al, 42))}%;`
    );
  } else {
    const { h } = hexToHsl(primaryHex);
    lines.push(`  --accent:             ${Math.round(h)} 72% 96%;`);
    lines.push(`  --accent-foreground:  ${Math.round(h)} 72% 42%;`);
  }

  // Secondary surface — same formula as applyThemeVariables
  if (configs.secondary_color) {
    const { h: sh, s: ss } = hexToHsl(configs.secondary_color);
    lines.push(
      `  --secondary:          ${Math.round(sh)} ${Math.round(ss * 0.25)}% 96%;`
    );
    lines.push(
      `  --secondary-foreground: ${Math.round(sh)} ${Math.round(Math.min(ss, 60))}% 25%;`
    );
  }

  // Background + muted — same formula as applyThemeVariables
  if (configs.background_color) {
    const { h: bh, s: bs } = hexToHsl(configs.background_color);
    lines.push(`  --background:         ${hsl(configs.background_color)};`);
    lines.push(
      `  --muted:              ${Math.round(bh)} ${Math.round(bs * 0.2)}% 96%;`
    );
  }

  return `:root {\n${lines.join('\n')}\n}`;
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
    const configs = data?.configs ?? data ?? null;
    if (!configs) return null;
    return { ...configs, logoUrl: data?.logoUrl ?? null };
  } catch {
    return null;
  }
}
