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
  maxSizeBytes: number;
  accept: Accept;
  upload: (
    file: File,
    metadata: { title: string; description: string }
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
    maxSizeBytes: 500 * MB,
    accept: {
      'video/*': ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv']
    },
    upload: (file, metadata) => apiClient.uploadVideo(file, metadata)
  },
  audio: {
    triggerKey: 'media.uploadAudio',
    descriptionKey: 'media.uploadAudioDescription',
    fileLabelKey: 'media.audioFile',
    fileHintKey: 'media.audioFileHint',
    titlePlaceholderKey: 'media.audioTitlePlaceholder',
    descriptionPlaceholderKey: 'media.audioDescriptionPlaceholder',
    maxSizeBytes: 50 * MB,
    accept: {
      'audio/*': ['.mp3', '.wav', '.aac', '.ogg', '.m4a', '.flac']
    },
    upload: (file, metadata) => apiClient.uploadAudio(file, metadata)
  },
  document: {
    triggerKey: 'media.uploadDocument',
    descriptionKey: 'media.uploadDocumentDescription',
    fileLabelKey: 'media.documentFile',
    fileHintKey: 'media.documentFileHint',
    titlePlaceholderKey: 'media.documentTitlePlaceholder',
    descriptionPlaceholderKey: 'media.documentDescriptionPlaceholder',
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
    upload: (file, metadata) => apiClient.uploadDocument(file, metadata)
  }
};
