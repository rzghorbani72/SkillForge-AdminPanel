import { ApiResponseError } from './api-error';

/**
 * Next buffers the whole request body before the request proxy runs, and its default
 * cap is 10MB: a bigger upload is truncated, the backend then reads a broken
 * multipart body and answers 500. We stop it in the browser instead, keeping
 * headroom for the multipart envelope itself.
 */
const PROXY_BODY_LIMIT_BYTES = 10 * 1024 * 1024;
const MULTIPART_OVERHEAD_BYTES = 256 * 1024;

export const MAX_IMAGE_UPLOAD_BYTES =
  PROXY_BODY_LIMIT_BYTES - MULTIPART_OVERHEAD_BYTES;

export function assertUploadSize(file: File, maxBytes: number): void {
  if (file.size <= maxBytes) return;

  const maxMb = Math.floor(maxBytes / (1024 * 1024));
  throw new ApiResponseError({
    status: 413,
    code: 'FILE_TOO_LARGE_MB',
    message: '',
    messageEn: `${file.name} is ${(file.size / (1024 * 1024)).toFixed(1)}MB, over the ${maxMb}MB limit`,
    params: { max: maxMb },
    fields: []
  });
}
