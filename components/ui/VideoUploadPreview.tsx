'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Video, X } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useVideoUpload } from '@/hooks/useVideoUpload';
import MediaDropzone from './media-dropzone';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/hooks';

const VIDEO_ACCEPT = 'video/mp4,video/webm,video/ogg';

interface VideoUploadPreviewProps {
  title?: string;
  description?: string;
  onSuccess?: (video: { id: number; url: string; title?: string }) => void;
  onError?: (error: Error) => void;
  selectedVideoId?: string | null;
  disabled?: boolean;
  className?: string;
  posterUrl?: string | null;
}

const VideoUploadPreview: React.FC<VideoUploadPreviewProps> = ({
  title,
  description,
  onSuccess,
  onError,
  selectedVideoId,
  disabled = false,
  className,
  posterUrl
}) => {
  const { t } = useTranslation();

  const videoUpload = useVideoUpload({
    title: title ?? t('media.videoFile'),
    description: description ?? t('media.videoFile'),
    onSuccess: (videoId) => onSuccess?.({ id: parseInt(videoId, 10), url: '' }),
    onError
  });

  const attachedId = videoUpload.uploadedVideoId ?? selectedVideoId ?? null;
  const playableUrl =
    videoUpload.preview ??
    (attachedId ? apiClient.getVideoStreamUrl(String(attachedId)) : null);

  const handleRemove = () => {
    videoUpload.removeFiles();
    onSuccess?.({ id: 0, url: '' });
  };

  return (
    <div className={cn('space-y-4', className)}>
      <MediaDropzone
        accept={VIDEO_ACCEPT}
        icon={<Video className="h-8 w-8 text-muted-foreground" />}
        placeholderText={t('media.noVideoSelected')}
        placeholderSubtext={t('media.dropVideoHint')}
        isUploading={videoUpload.isUploading}
        uploadProgress={videoUpload.uploadProgress}
        uploadingLabel={
          videoUpload.uploadProgress === 100
            ? t('media.processingVideo')
            : t('media.uploadingVideo')
        }
        disabled={disabled}
        onFile={(file) => void videoUpload.selectAndUpload(file)}
        onRemove={handleRemove}
        filled={
          playableUrl ? (
            <video
              src={playableUrl}
              poster={posterUrl ?? undefined}
              controls
              className="aspect-video w-full rounded-md bg-black"
            />
          ) : null
        }
      />

      <p className="text-xs text-muted-foreground">
        {t('media.videoFormatsHint')}
      </p>

      {videoUpload.canCancel && (
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={videoUpload.cancelUpload}
        >
          <X className="me-2 h-4 w-4" />
          {t('common.cancel')}
        </Button>
      )}
    </div>
  );
};

export default VideoUploadPreview;
