import { apiClient } from '@/lib/api';
import { getBrowserApiBaseUrl } from '@/lib/api-base-url';
import { videoStreamPath } from './use-academy-videos';

export type CanvasMediaKind = 'image' | 'video';

function readId(result: unknown): string | number | null {
  const raw = result as Record<string, unknown> | null;
  const id = raw?.id ?? (raw?.data as Record<string, unknown> | undefined)?.id;
  return typeof id === 'string' || typeof id === 'number' ? id : null;
}

/**
 * Uploads a file picked on the editor canvas and returns the block config
 * patch that points the slot at it. Images go to the image endpoint; videos
 * go through the quota-checked direct video upload, and a new video drops
 * the previous poster so the player never shows a stale frame.
 */
export async function uploadCanvasMedia(
  kind: CanvasMediaKind,
  file: File,
  fieldKey: string,
  onProgress: (percent: number) => void,
): Promise<Record<string, unknown> | null> {
  if (kind === 'video') {
    const result = await apiClient.uploadVideoWithProgress(
      file,
      { title: file.name },
      undefined,
      onProgress,
    );
    const id = readId(result);
    if (id === null) return null;
    return {
      [fieldKey]: videoStreamPath({ id: String(id), title: file.name }),
      heroVideoPoster: null,
    };
  }

  const result = await apiClient.uploadImage(file, { title: 'Section Media' }, onProgress);
  const id = readId(result);
  if (id === null) return null;
  return { [fieldKey]: `${getBrowserApiBaseUrl()}/images/get-image?id=${id}` };
}
