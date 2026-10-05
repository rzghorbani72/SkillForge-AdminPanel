import type { Area } from 'react-easy-crop';

export interface CropPreset {
  readonly aspect: number;
  readonly shape: 'rect' | 'round';
  readonly maxWidth: number;
}

// Aspect must match where the image is shown, e.g. storefront course cards are 4:3.
export const CROP_PRESETS = {
  cover: { aspect: 4 / 3, shape: 'rect', maxWidth: 1600 },
  avatar: { aspect: 1, shape: 'round', maxWidth: 512 },
} as const satisfies Record<string, CropPreset>;

// GIF would lose its animation and SVG has no pixels to crop.
const UNCROPPABLE_TYPES: readonly string[] = ['image/gif', 'image/svg+xml'];

export function isCroppable(file: File): boolean {
  return file.type.startsWith('image/') && !UNCROPPABLE_TYPES.includes(file.type);
}

export async function cropImageFile(file: File, area: Area, maxWidth: number): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / area.width);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(area.width * scale);
  canvas.height = Math.round(area.height * scale);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('canvas_unavailable');
  context.drawImage(
    bitmap,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    canvas.width,
    canvas.height,
  );
  bitmap.close();

  const type = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.9));
  if (!blob) throw new Error('crop_failed');
  const baseName = file.name.replace(/\.[^.]+$/, '');
  return new File([blob], `${baseName}.${type === 'image/png' ? 'png' : 'jpg'}`, { type });
}
