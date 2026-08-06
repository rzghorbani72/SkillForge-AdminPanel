import { apiClient } from '@/lib/api';

export type AcademyCreateInput = {
  name: string;
  slug: string;
  description?: string;
  category?: string;
  logoId?: string;
  primaryColor?: string;
};

export type AcademyCreateResult = {
  /** Null only when the server returned no id — the academy may still exist. */
  id: string | null;
  /** False when the session could not be moved onto the new academy. */
  switched: boolean;
  /** False when the brand color could not be saved. */
  branded: boolean;
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

function readResponse(response: unknown): {
  id: string | null;
  switched: boolean;
} {
  const body = response as {
    switched?: boolean;
    data?: { id?: string; data?: { id?: string } };
  };
  const id = body?.data?.id ?? body?.data?.data?.id;
  return { id: id ? String(id) : null, switched: body?.switched === true };
}

/**
 * Creates the academy, then moves the session onto it and paints its brand color.
 *
 * Only the create call may throw. Once the server has answered, the academy is
 * committed — a failing switch or theme write is an incomplete setup, never a
 * failed creation, so reporting either as an error would tell the manager their
 * academy does not exist while it sits in their list.
 */
export async function createAcademy(
  data: AcademyCreateInput
): Promise<AcademyCreateResult> {
  const response = await apiClient.createAcademy({
    name: data.name,
    private_domain: data.slug,
    description: data.description || undefined,
    logo_id: data.logoId
  });

  const { id, switched: switchedByServer } = readResponse(response);

  // The create endpoint already switches the session, so this only covers the
  // case where that server-side switch failed.
  let switched = switchedByServer;
  if (id && !switched) {
    switched = await apiClient
      .switchAcademy(id)
      .then(() => true)
      .catch(() => false);
  }

  // The theme endpoint writes to the *current* academy, so painting before the
  // switch lands would repaint the academy the manager came from.
  let branded = true;
  if (data.primaryColor && switched) {
    branded = await apiClient
      .updateCurrentThemeConfig(buildTheme(data.primaryColor))
      .then(() => true)
      .catch(() => false);
  } else if (data.primaryColor) {
    branded = false;
  }

  return { id, switched, branded };
}
