/**
 * Uploads a video from the browser straight to object storage.
 *
 * The API only hands out presigned part URLs and registers the finished
 * object, so the bytes never pass through our server: no proxy body limit, no
 * request timeout, and one failed part is retried instead of the whole file.
 */

export interface DirectUploadTicket {
  mode: 'direct' | 'proxy';
  key?: string;
  upload_id?: string;
  part_size?: number;
  part_urls?: string[];
}

export interface UploadedPart {
  part_number: number;
  etag: string;
}

const MAX_PART_ATTEMPTS = 3;

/** Uploads one part and returns its ETag, which storage needs to reassemble the file. */
function putPart(
  url: string,
  body: Blob,
  onLoadedChange: (loadedBytes: number) => void,
  signal?: AbortSignal,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const abort = () => xhr.abort();
    signal?.addEventListener('abort', abort);

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) onLoadedChange(event.loaded);
    });

    xhr.addEventListener('load', () => {
      signal?.removeEventListener('abort', abort);
      if (xhr.status < 200 || xhr.status >= 300) {
        reject(new Error(`Part upload failed with status: ${xhr.status}`));
        return;
      }
      const etag = xhr.getResponseHeader('ETag');
      if (!etag) {
        reject(
          new Error(
            'Storage did not return an ETag. Enable ETag in the bucket CORS ExposeHeaders.',
          ),
        );
        return;
      }
      onLoadedChange(body.size);
      resolve(etag);
    });
    xhr.addEventListener('error', () => {
      signal?.removeEventListener('abort', abort);
      reject(new Error('Part upload failed'));
    });
    xhr.addEventListener('abort', () => {
      signal?.removeEventListener('abort', abort);
      reject(new Error('Upload cancelled'));
    });

    xhr.open('PUT', url);
    xhr.send(body);
  });
}

export async function uploadFileParts(
  file: File,
  ticket: Required<Pick<DirectUploadTicket, 'part_size' | 'part_urls'>>,
  onProgress?: (percent: number) => void,
  signal?: AbortSignal,
): Promise<UploadedPart[]> {
  const { part_size: partSize, part_urls: partUrls } = ticket;
  const loadedPerPart = new Array<number>(partUrls.length).fill(0);
  const parts: UploadedPart[] = [];

  const reportProgress = () => {
    if (!onProgress) return;
    const loaded = loadedPerPart.reduce((sum, bytes) => sum + bytes, 0);
    onProgress(Math.min(99, Math.round((loaded / file.size) * 100)));
  };

  for (let index = 0; index < partUrls.length; index += 1) {
    const start = index * partSize;
    const chunk = file.slice(start, Math.min(start + partSize, file.size));

    let etag: string | null = null;
    for (let attempt = 1; attempt <= MAX_PART_ATTEMPTS; attempt += 1) {
      try {
        etag = await putPart(
          partUrls[index],
          chunk,
          (loadedBytes) => {
            loadedPerPart[index] = loadedBytes;
            reportProgress();
          },
          signal,
        );
        break;
      } catch (error) {
        loadedPerPart[index] = 0;
        const cancelled = signal?.aborted || (error as Error).message === 'Upload cancelled';
        if (cancelled || attempt === MAX_PART_ATTEMPTS) throw error;
      }
    }

    parts.push({ part_number: index + 1, etag: etag as string });
  }

  return parts;
}
