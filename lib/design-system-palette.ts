export interface DerivedPalette {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  accent: string;
  backgroundLight: string;
  backgroundDark: string;
}

export interface Hsl {
  h: number;
  s: number;
  l: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalizeHex(hex: string): string {
  const cleaned = hex.replace('#', '').trim();
  if (cleaned.length === 3) {
    return `#${cleaned
      .split('')
      .map((c) => c + c)
      .join('')
      .toLowerCase()}`;
  }
  if (cleaned.length === 6) {
    return `#${cleaned.toLowerCase()}`;
  }
  return '#3b82f6';
}

export function hexToHsl(hex: string): Hsl {
  const full = normalizeHex(hex).slice(1);
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
      default:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

export function hslToHex(h: number, s: number, l: number): string {
  const hh = ((h % 360) + 360) % 360;
  const ss = clamp(s, 0, 100) / 100;
  const ll = clamp(l, 0, 100) / 100;

  if (ss === 0) {
    const v = Math.round(ll * 255);
    return `#${v.toString(16).padStart(2, '0').repeat(3)}`;
  }

  const q = ll < 0.5 ? ll * (1 + ss) : ll + ss - ll * ss;
  const p = 2 * ll - q;
  const hueToRgb = (t: number) => {
    let x = t;
    if (x < 0) x += 1;
    if (x > 1) x -= 1;
    if (x < 1 / 6) return p + (q - p) * 6 * x;
    if (x < 1 / 2) return q;
    if (x < 2 / 3) return p + (q - p) * (2 / 3 - x) * 6;
    return p;
  };

  const r = Math.round(hueToRgb(hh / 360 + 1 / 3) * 255);
  const g = Math.round(hueToRgb(hh / 360) * 255);
  const b = Math.round(hueToRgb(hh / 360 - 1 / 3) * 255);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function mixHsl(base: Hsl, target: Hsl, ratio: number): Hsl {
  const t = clamp(ratio, 0, 1);
  return {
    h: base.h + (target.h - base.h) * t,
    s: base.s + (target.s - base.s) * t,
    l: base.l + (target.l - base.l) * t,
  };
}

export function derivePaletteFromPrimary(primaryHex: string): DerivedPalette {
  const primary = normalizeHex(primaryHex);
  const base = hexToHsl(primary);

  const primaryLight = primary;
  const primaryDark = hslToHex(base.h, clamp(base.s * 0.85, 20, 100), clamp(base.l + 18, 35, 72));

  const secondaryLight = hslToHex(
    base.h,
    clamp(base.s * 0.35, 8, 45),
    clamp(base.l * 0.42, 18, 38),
  );
  const secondaryDark = hslToHex(base.h, clamp(base.s * 0.55, 12, 60), clamp(base.l + 35, 55, 78));

  const accent = hslToHex(
    (base.h + 150) % 360,
    clamp(Math.max(base.s, 55), 45, 85),
    clamp(base.l > 50 ? base.l - 8 : base.l + 12, 42, 62),
  );

  const backgroundLight = hslToHex(base.h, clamp(base.s * 0.12, 4, 18), 97);
  const backgroundDark = hslToHex(
    mixHsl(base, { h: base.h, s: 20, l: 8 }, 0.35).h,
    clamp(base.s * 0.35, 10, 40),
    10,
  );

  return {
    primary,
    primaryLight,
    primaryDark,
    secondary: secondaryLight,
    secondaryLight,
    secondaryDark,
    accent,
    backgroundLight,
    backgroundDark,
  };
}

export function paletteToThemeColors(palette: DerivedPalette) {
  return {
    primaryLight: palette.primaryLight,
    primaryDark: palette.primaryDark,
    secondaryLight: palette.secondaryLight,
    secondaryDark: palette.secondaryDark,
    accent: palette.accent,
    backgroundLight: palette.backgroundLight,
    backgroundDark: palette.backgroundDark,
  };
}
