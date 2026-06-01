'use client';

import { ThemeConfigPayload } from '@/types/api';

// Mentoryar design system defaults — light mode only.
// Primary: cherry red hsl(4 72% 52%).
// All surface/border/muted colors are owned by globals.css — NOT set here.
export const DEFAULT_THEME_CONFIG: ThemeConfigPayload = {
  primary_color: '#dd382c',
  secondary_color: '#eeedf1',
  accent_color: '#fef5f4',
  background_color: '#f9f7f6',
  dark_mode: false
};

const THEME_EVENT = 'theme:updated';

export function dispatchThemeUpdate(config: ThemeConfigPayload) {
  window.dispatchEvent(
    new CustomEvent<ThemeConfigPayload>(THEME_EVENT, { detail: config })
  );
}

export function subscribeToThemeUpdates(
  listener: (config: ThemeConfigPayload) => void
) {
  const handler = (e: Event) =>
    listener((e as CustomEvent<ThemeConfigPayload>).detail);
  window.addEventListener(THEME_EVENT, handler as EventListener);
  return () =>
    window.removeEventListener(THEME_EVENT, handler as EventListener);
}

export function parseThemeResponse(payload: unknown): ThemeConfigPayload {
  const data = (payload as Record<string, unknown>)?.data ?? payload ?? {};
  const configs = (data as Record<string, unknown>)?.configs ?? data;
  const c = configs as Record<string, unknown>;
  const d = data as Record<string, unknown>;

  return {
    themeId:
      (d?.themeId as number | undefined) ?? (d?.id as number | undefined),
    name: (d?.name as string | undefined) ?? 'Custom Theme',
    primary_color: normaliseHex(
      c?.primary_color as string,
      DEFAULT_THEME_CONFIG.primary_color
    ),
    secondary_color: normaliseHex(
      c?.secondary_color as string,
      DEFAULT_THEME_CONFIG.secondary_color
    ),
    accent_color: normaliseHex(
      c?.accent_color as string,
      DEFAULT_THEME_CONFIG.accent_color
    ),
    background_color: normaliseHex(
      c?.background_color as string,
      DEFAULT_THEME_CONFIG.background_color
    ),
    dark_mode: false
  };
}

export function applyThemeVariables(config: ThemeConfigPayload) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  // Primary
  const primaryHex = config.primary_color ?? DEFAULT_THEME_CONFIG.primary_color;
  root.style.setProperty('--primary', hexToHslString(primaryHex));
  root.style.setProperty('--primary-foreground', '0 0% 100%');
  root.style.setProperty('--ring', hexToHslString(primaryHex));

  // Accent — use accent_color directly rather than deriving from primary hue
  const accentHex = config.accent_color ?? DEFAULT_THEME_CONFIG.accent_color;
  const { h: ah, s: as_, l: al } = hexToHsl(accentHex);
  root.style.setProperty(
    '--accent',
    `${Math.round(ah)} ${Math.round(as_ * 0.6)}% 95%`
  );
  root.style.setProperty(
    '--accent-foreground',
    `${Math.round(ah)} ${Math.round(as_)}% ${Math.round(Math.min(al, 42))}%`
  );

  // Secondary surface — derive a light tint so shadcn surface tokens stay readable
  const secondaryHex =
    config.secondary_color ?? DEFAULT_THEME_CONFIG.secondary_color;
  const { h: sh, s: ss } = hexToHsl(secondaryHex);
  root.style.setProperty(
    '--secondary',
    `${Math.round(sh)} ${Math.round(ss * 0.25)}% 96%`
  );
  root.style.setProperty(
    '--secondary-foreground',
    `${Math.round(sh)} ${Math.round(Math.min(ss, 60))}% 25%`
  );
}

// ── Hex helpers ──────────────────────────────────────────────────────────────

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

function hexToHslString(hex: string): string {
  const { h, s, l } = hexToHsl(hex);
  return `${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%`;
}

function normaliseHex(value: string | undefined, fallback: string): string {
  if (!value) return fallback;
  if (value.startsWith('#') && (value.length === 7 || value.length === 4))
    return value.toLowerCase();
  return fallback;
}
