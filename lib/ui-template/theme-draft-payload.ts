import { derivePaletteFromPrimary, paletteToThemeColors } from '@/lib/design-system-palette';

export interface ThemeColorsState {
  primaryLight: string;
  primaryDark: string;
  secondaryLight: string;
  secondaryDark: string;
  accent: string;
  backgroundLight: string;
  backgroundDark: string;
}

export interface ThemeStyleState {
  borderRadius: 'rounded' | 'soft' | 'sharp';
  shadow: 'none' | 'subtle' | 'medium' | 'strong';
  backgroundSvgPattern: string;
}

export interface ThemeDraftPayload {
  primary_color: string;
  primary_color_light: string;
  primary_color_dark: string;
  secondary_color: string;
  secondary_color_light: string;
  secondary_color_dark: string;
  accent_color: string;
  background_color: string;
  background_color_light: string;
  background_color_dark: string;
  dark_mode: null;
  border_radius_style: ThemeStyleState['borderRadius'];
  shadow_style: ThemeStyleState['shadow'];
  background_svg_pattern: string;
}

export function buildThemeDraftPayload(
  colors: ThemeColorsState,
  style: ThemeStyleState,
): ThemeDraftPayload {
  return {
    primary_color: colors.primaryLight,
    primary_color_light: colors.primaryLight,
    primary_color_dark: colors.primaryDark,
    secondary_color: colors.secondaryLight,
    secondary_color_light: colors.secondaryLight,
    secondary_color_dark: colors.secondaryDark,
    accent_color: colors.accent,
    background_color: colors.backgroundLight,
    background_color_light: colors.backgroundLight,
    background_color_dark: colors.backgroundDark,
    dark_mode: null,
    border_radius_style: style.borderRadius,
    shadow_style: style.shadow,
    background_svg_pattern: style.backgroundSvgPattern,
  };
}

export function buildThemeDraftFromPrimary(
  primaryHex: string,
  style: ThemeStyleState,
): ThemeDraftPayload {
  const palette = derivePaletteFromPrimary(primaryHex);
  return buildThemeDraftPayload(paletteToThemeColors(palette), style);
}
