import { ApiLayer06 } from './06-shipping-orders-endpoints';
import {
  assertImageFile,
  MAX_AVATAR_UPLOAD_BYTES,
  MAX_IMAGE_UPLOAD_BYTES,
} from '../../upload-limits';
import { uploadFileParts, type DirectUploadTicket } from '@/lib/uploads/video-direct-upload';
import { readMediaDurationSeconds, readVideoDurationSeconds } from '@/lib/media-duration';

export class ApiLayer07 extends ApiLayer06 {
  async uploadImage(
    file: File,
    metadata?: { title?: string; description?: string },
    onProgress?: (progress: number) => void,
    abortController?: AbortController,
  ) {
    assertImageFile(file, MAX_IMAGE_UPLOAD_BYTES);

    const formData = new FormData();
    formData.append('imagefile', file); // Backend expects 'imagefile'
    formData.append('alt', metadata?.title || file.name); // Backend expects 'alt' field

    const response = await this.uploadFileWithProgress(
      '/images/upload',
      formData,
      onProgress,
      abortController,
    );
    return (response.data ?? null) as any;
  }

  /**
   * Profile photos go to their own route: it is the only image upload that
   * works without academy context, which most accounts do not have.
   */
  async uploadAvatarImage(
    file: File,
    onProgress?: (progress: number) => void,
    abortController?: AbortController,
  ) {
    assertImageFile(file, MAX_AVATAR_UPLOAD_BYTES);

    const formData = new FormData();
    formData.append('imagefile', file);
    formData.append('alt', file.name);

    const response = await this.uploadFileWithProgress(
      '/images/avatar',
      formData,
      onProgress,
      abortController,
    );
    return (response.data ?? null) as any;
  }

  protected buildVideoFormData(
    file: File,
    metadata?: { title?: string; description?: string },
    posterFile?: File,
    durationSeconds?: number,
  ): FormData {
    const formData = new FormData();
    formData.append('videofile', file); // Backend expects 'videofile'
    if (posterFile) {
      formData.append('posterfile', posterFile); // Backend expects 'posterfile'
    }
    if (metadata) {
      formData.append('title', metadata.title || file.name);
      formData.append('description', metadata.description || '');
    }
    if (durationSeconds) {
      formData.append('duration_seconds', String(durationSeconds));
    }
    return formData;
  }

  /**
   * Sends the file straight to object storage in chunks, then asks the API to
   * register it. Falls back to the through-the-server route when storage
   * cannot presign (local development), so both setups keep working.
   */
  async uploadVideoWithProgress(
    file: File,
    metadata?: { title?: string; description?: string },
    posterFile?: File,
    onProgress?: (progress: number) => void,
    abortController?: AbortController,
  ) {
    const title = metadata?.title || file.name;
    const durationSeconds = await readVideoDurationSeconds(file);
    const ticket = (
      await this.request<DirectUploadTicket>('/videos/upload/init', {
        method: 'POST',
        body: JSON.stringify({
          filename: file.name,
          size_bytes: file.size,
          mime_type: file.type || 'video/mp4',
        }),
      })
    ).data;

    if (ticket?.mode !== 'direct' || !ticket.part_urls || !ticket.part_size) {
      return this.uploadVideoThroughServer(
        file,
        metadata,
        posterFile,
        onProgress,
        abortController,
        durationSeconds,
      );
    }

    onProgress?.(0);
    let parts;
    try {
      parts = await uploadFileParts(
        file,
        { part_size: ticket.part_size, part_urls: ticket.part_urls },
        onProgress,
        abortController?.signal,
      );
    } catch (error) {
      // Fire-and-forget: the user already failed or cancelled, so releasing the
      // unfinished chunks must not delay or mask the original error.
      void this.request('/videos/upload/abort', {
        method: 'POST',
        body: JSON.stringify({ key: ticket.key, upload_id: ticket.upload_id }),
      }).catch(() => undefined);
      throw error;
    }

    const video = (
      await this.request<{ id: string }>('/videos/upload/complete', {
        method: 'POST',
        body: JSON.stringify({
          key: ticket.key,
          upload_id: ticket.upload_id,
          parts,
          title,
          description: metadata?.description,
          duration_seconds: durationSeconds,
        }),
      })
    ).data;

    if (posterFile && video?.id) {
      await this.attachVideoPoster(video.id, posterFile);
    }

    onProgress?.(100);
    return video;
  }

  /** Legacy path: the file travels through the API server (local dev only). */
  protected async uploadVideoThroughServer(
    file: File,
    metadata?: { title?: string; description?: string },
    posterFile?: File,
    onProgress?: (progress: number) => void,
    abortController?: AbortController,
    durationSeconds?: number,
  ): Promise<{ id: string }> {
    const response = await this.uploadFileWithProgress(
      '/videos/upload',
      this.buildVideoFormData(file, metadata, posterFile, durationSeconds),
      onProgress,
      abortController,
    );
    return (response.data ?? response) as { id: string };
  }

  async uploadVideo(
    file: File,
    metadata?: { title?: string; description?: string },
    posterFile?: File,
    onProgress?: (progress: number) => void,
    abortController?: AbortController,
  ) {
    return this.uploadVideoWithProgress(file, metadata, posterFile, onProgress, abortController);
  }

  async uploadAudio(
    file: File,
    metadata?: { title?: string; description?: string },
    onProgress?: (progress: number) => void,
    abortController?: AbortController,
  ) {
    const formData = new FormData();
    formData.append('audioFile', file); // Backend expects 'audioFile'
    if (metadata) {
      formData.append('title', metadata.title || file.name);
      formData.append('description', metadata.description || '');
    }
    // Measured here for the same reason video is: only the browser has the file.
    const durationSeconds = await readMediaDurationSeconds(file, 'audio');
    if (durationSeconds) {
      formData.append('duration_seconds', String(durationSeconds));
    }

    return this.uploadFileWithProgress('/audios/upload', formData, onProgress, abortController);
  }

  async uploadDocument(
    file: File,
    metadata?: { title?: string; description?: string },
    onProgress?: (progress: number) => void,
    abortController?: AbortController,
  ) {
    const formData = new FormData();
    formData.append('documentfile', file);
    if (metadata) {
      formData.append('title', metadata.title || file.name);
      formData.append('description', metadata.description || '');
    }

    return this.uploadFileWithProgress('/files/upload', formData, onProgress, abortController);
  }

  async getImages() {
    const response = await this.request('/images');
    // Return the images data directly
    if (response.data) {
      return response.data as any;
    }
    return null as any;
  }

  async getVideos() {
    const response = await this.request('/videos');
    // Return the videos data directly
    if (response.data) {
      return response.data as any;
    }
    return null as any;
  }

  getVideoStreamUrl(videoId: string): string {
    return `${this.baseURL}/videos/stream/${videoId}`;
  }

  async getVideo(videoId: number) {
    const response = await this.request(`/videos/${videoId}`);
    return response.data;
  }

  /** Re-queues a legacy or failed video for HLS conversion. */
  async secureVideo(videoId: string) {
    const response = await this.request<{ hls_status: string }>(`/videos/${videoId}/secure`, {
      method: 'PATCH',
    });
    return response.data;
  }

  async getAudios() {
    const response = await this.request('/audios');
    const payload = response.data as any;

    if (!payload) {
      return [];
    }

    if (Array.isArray(payload)) {
      return payload;
    }

    if (payload.status === 'ok' && Array.isArray(payload.data)) {
      return payload.data;
    }

    if (Array.isArray(payload?.audios)) {
      return payload.audios;
    }

    if (Array.isArray(payload?.data?.audios)) {
      return payload.data.audios;
    }

    if (Array.isArray(payload?.data)) {
      return payload.data;
    }

    return [];
  }

  async getAudio(audioId: number) {
    const response = await this.request(`/audios/${audioId}`);
    const payload = response.data as any;

    if (!payload) {
      return null;
    }

    if (payload.status === 'ok' && payload.data) {
      return payload.data;
    }

    if (payload.data) {
      return payload.data;
    }

    return payload;
  }

  async updateAudio(
    audioId: number,
    audioData: { title?: string; description?: string; is_public?: boolean },
  ) {
    const response = await this.request(`/audios/${audioId}`, {
      method: 'PATCH',
      body: JSON.stringify(audioData),
    });

    return response.data as any;
  }

  async deleteAudio(audioId: number) {
    return this.request(`/audios/${audioId}`, {
      method: 'DELETE',
    });
  }

  async getDocuments() {
    const response = await this.request('/files');

    // Return the documents data directly
    if (response.data) {
      return response.data as any;
    }
    return null as any;
  }

  async getDocument(documentId: number) {
    const response = await this.request(`/files/${documentId}`);
    const payload = response.data as any;

    if (!payload) {
      return null;
    }

    if (payload.status === 'ok' && payload.data) {
      return payload.data;
    }

    if (payload.data) {
      return payload.data;
    }

    return payload;
  }
}
