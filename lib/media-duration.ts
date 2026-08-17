/**
 * Reads how long a media file plays for, using the browser's own decoder.
 * The server cannot measure this: with direct-to-storage uploads the bytes
 * never reach the API. Returns undefined when the browser cannot tell, so a
 * failure here never blocks an upload.
 */
export function readMediaDurationSeconds(
  file: File,
  kind: 'video' | 'audio' = 'video'
): Promise<number | undefined> {
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const element = document.createElement(kind);

    const finish = (duration?: number) => {
      URL.revokeObjectURL(objectUrl);
      element.removeAttribute('src');
      resolve(
        duration && Number.isFinite(duration) && duration > 0
          ? Math.round(duration)
          : undefined
      );
    };

    element.preload = 'metadata';
    element.onloadedmetadata = () => finish(element.duration);
    element.onerror = () => finish();
    element.src = objectUrl;
  });
}

/** Video-only alias kept for the upload paths that only ever handle video. */
export function readVideoDurationSeconds(
  file: File
): Promise<number | undefined> {
  return readMediaDurationSeconds(file, 'video');
}
