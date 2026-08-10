import type { Accept } from 'react-dropzone';
import { apiClient } from '@/lib/api';

export type MediaKind = 'video' | 'audio' | 'document';

interface MediaKindConfig {
  triggerKey: string;
  descriptionKey: string;
  fileLabelKey: string;
  fileHintKey: string;
  titlePlaceholderKey: string;
  descriptionPlaceholderKey: string;
  successKey: string;
  maxSizeBytes: number;
  /**
   * Must stay in step with the API's `ALLOWED_EXTENSIONS` /
   * `ALLOWED_MIME_TYPES` (Backend/src/common/validators/file-validator.ts).
   * Offering a format the API rejects means the user only finds out after
   * waiting through the whole upload.
   */
  accept: Accept;
  upload: (
    file: File,
    metadata: { title: string; description: string },
    onProgress?: (progress: number) => void,
    abortController?: AbortController
  ) => Promise<unknown>;
}

const MB = 1024 * 1024;

export const MEDIA_KINDS: Record<MediaKind, MediaKindConfig> = {
  video: {
    triggerKey: 'media.uploadVideo',
    descriptionKey: 'media.uploadVideoDescription',
    fileLabelKey: 'media.videoFile',
    fileHintKey: 'media.videoFileHint',
    titlePlaceholderKey: 'media.videoTitlePlaceholder',
    descriptionPlaceholderKey: 'media.videoDescriptionPlaceholder',
    successKey: 'media.videoUploaded',
    maxSizeBytes: 500 * MB,
    accept: {
      'video/mp4': ['.mp4'],
      'video/webm': ['.webm'],
      'video/quicktime': ['.mov'],
      'video/x-msvideo': ['.avi'],
      'video/mpeg': ['.mpeg', '.mpg']
    },
    upload: (file, metadata, onProgress, abortController) =>
      apiClient.uploadVideoWithProgress(
        file,
        metadata,
        undefined,
        onProgress,
        abortController
      )
  },
  audio: {
    triggerKey: 'media.uploadAudio',
    descriptionKey: 'media.uploadAudioDescription',
    fileLabelKey: 'media.audioFile',
    fileHintKey: 'media.audioFileHint',
    titlePlaceholderKey: 'media.audioTitlePlaceholder',
    descriptionPlaceholderKey: 'media.audioDescriptionPlaceholder',
    successKey: 'media.audioUploaded',
    maxSizeBytes: 50 * MB,
    accept: {
      'audio/mpeg': ['.mp3'],
      'audio/wav': ['.wav'],
      'audio/ogg': ['.ogg'],
      'audio/webm': ['.weba', '.webm']
    },
    upload: (file, metadata, onProgress, abortController) =>
      apiClient.uploadAudio(file, metadata, onProgress, abortController)
  },
  document: {
    triggerKey: 'media.uploadDocument',
    descriptionKey: 'media.uploadDocumentDescription',
    fileLabelKey: 'media.documentFile',
    fileHintKey: 'media.documentFileHint',
    titlePlaceholderKey: 'media.documentTitlePlaceholder',
    descriptionPlaceholderKey: 'media.documentDescriptionPlaceholder',
    successKey: 'media.documentUploaded',
    maxSizeBytes: 20 * MB,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        ['.docx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation':
        ['.pptx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
        '.xlsx'
      ],
      'text/plain': ['.txt'],
      'text/markdown': ['.md']
    },
    upload: (file, metadata, onProgress, abortController) =>
      apiClient.uploadDocument(file, metadata, onProgress, abortController)
  }
};
