export type AcademyEditPayload = {
  name: string;
  slug: string;
  publicAddress: string;
  description: string;
  logoId?: string;
  faviconId?: string;
  primaryColor?: string;
};

export function buildAcademyThemePatch(hex: string) {
  const shift = (channel: string, amount: number) =>
    Math.min(255, Math.max(0, parseInt(channel, 16) + amount))
      .toString(16)
      .padStart(2, '0');
  const r = hex.slice(1, 3);
  const g = hex.slice(3, 5);
  const b = hex.slice(5, 7);
  return {
    primary_color: hex,
    primary_color_light: `#${shift(r, 60)}${shift(g, 60)}${shift(b, 60)}`,
    primary_color_dark: `#${shift(r, -40)}${shift(g, -40)}${shift(b, -40)}`,
  };
}
