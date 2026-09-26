import { ApiResponseError } from './api-error';

/**
 * Next buffers the whole request body before the request proxy runs, and its default
 * cap is 10MB: a bigger upload is truncated, the backend then reads a broken
 * multipart body and answers 500. We stop it in the browser instead, keeping
 * headroom for the multipart envelope itself.
 */
const PROXY_BODY_LIMIT_BYTES = 10 * 1024 * 1024;
const MULTIPART_OVERHEAD_BYTES = 256 * 1024;

export const MAX_IMAGE_UPLOAD_BYTES = PROXY_BODY_LIMIT_BYTES - MULTIPART_OVERHEAD_BYTES;
export const MAX_AVATAR_UPLOAD_BYTES = 5 * 1024 * 1024;
export const LOGO_MAX_KB = 500;
export const FAVICON_MAX_KB = 100;

// Mirrors Backend ALLOWED_MIME_TYPES.images / ALLOWED_EXTENSIONS.images.
const IMAGE_MIME_TYPES: readonly string[] = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/avif',
  'image/svg+xml',
];
const IMAGE_EXTENSIONS: readonly string[] = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg'];

export const IMAGE_ACCEPT = [...IMAGE_MIME_TYPES, ...IMAGE_EXTENSIONS.map((e) => `.${e}`)].join(
  ',',
);

function uploadError(
  status: number,
  code: string,
  messageEn: string,
  params: Record<string, number> = {},
) {
  return new ApiResponseError({ status, code, message: '', messageEn, params, fields: [] });
}

export function assertUploadSize(file: File, maxBytes: number): void {
  if (file.size <= maxBytes) return;

  const MB = 1024 * 1024;
  const inKb = maxBytes < MB;
  const max = inKb ? Math.floor(maxBytes / 1024) : Math.floor(maxBytes / MB);
  const unit = inKb ? 'KB' : 'MB';
  throw uploadError(
    413,
    `FILE_TOO_LARGE_${unit}`,
    `${file.name} is ${Math.ceil(file.size / 1024)}KB, over the ${max}${unit} limit`,
    { max },
  );
}

export function assertImageFile(file: File, maxBytes: number): void {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  const typeAllowed = file.type
    ? IMAGE_MIME_TYPES.includes(file.type)
    : IMAGE_EXTENSIONS.includes(extension);
  if (!typeAllowed) {
    throw uploadError(
      400,
      'FILE_TYPE_NOT_ALLOWED',
      `${file.name} (${file.type}) is not an allowed image type`,
    );
  }
  assertUploadSize(file, maxBytes);
}
