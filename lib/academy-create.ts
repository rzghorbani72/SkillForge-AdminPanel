import { apiClient } from '@/lib/api';

export type AcademyCreateInput = {
  name: string;
  slug: string;
  description?: string;
  category?: string;
  logoId?: string;
  primaryColor?: string;
};

function buildTheme(hex: string) {
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
    primary_color_dark: `#${shift(r, -40)}${shift(g, -40)}${shift(b, -40)}`
  };
}

function readNewId(response: unknown): string | null {
  const body = response as { data?: { id?: string; data?: { id?: string } } };
  const id = body?.data?.id ?? body?.data?.data?.id;
  return id ? String(id) : null;
}

/**
 * Creates the academy, switches the session onto it, then paints its brand
 * color — the theme endpoint writes to the *current* academy, so the switch has
 * to land first or a second academy would repaint the first one.
 */
export async function createAcademy(
  data: AcademyCreateInput
): Promise<string | null> {
  const response = await apiClient.createAcademy({
    name: data.name,
    private_domain: data.slug,
    description: data.description || undefined,
    logo_id: data.logoId
  });

  const newId = readNewId(response);
  if (newId) await apiClient.switchAcademy(newId);

  if (data.primaryColor) {
    await apiClient
      .updateCurrentThemeConfig(buildTheme(data.primaryColor))
      .catch(() => {});
  }

  return newId;
}
